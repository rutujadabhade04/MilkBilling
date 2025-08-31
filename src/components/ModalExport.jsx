import { useEffect, useState } from "react";
export default function ModalExport(props) {
  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, []);
  let [columnSize, setColumnSize] = useState("all");
  let [exportFileType, setExportFileType] = useState("excel");
  function handleModalCloseClick() {
    props.onModalCloseClick();
  }

  function handleModalButtonCancelClick() {
    props.onModalButtonCancelClick();
  }
  function handleExportButtonClick() {
    props.onExportButtonClick(columnSize,exportFileType);
  }
  function handleColumnSizeSelection(columnSize) {
    setColumnSize(columnSize);
    // props.onColumnSizeSelection(columnSize);
  }
  function handleFileTypeSelectionChange(event) {
    setExportFileType(event.target.value);
  }
  return (
    <>
      <div className="modal-wrapper" onClick={handleModalCloseClick}></div>
      <div className="modal-container  ">
        <div className="text-bigger d-flex justify-content-between bg-primary text-white mb-3 p-2">
          {" "}
          <div>Export options</div>{" "}
          <div onClick={handleModalCloseClick}>
            <i className="bi bi-x-square"></i>
          </div>
        </div>
        <div className="p-3">
          <input
            type="radio"
            name="columnSize"
            id=""
            checked={columnSize == "all"}
            onChange={() => handleColumnSizeSelection("all")}
          />{" "}
          All Columns &nbsp;
          <input
            type="radio"
            name="columnSize"
            id=""
            checked={columnSize == "selected"}
            onChange={() => handleColumnSizeSelection("selected")}
          />{" "}
          Selected Columns{" "}
        </div>
        {/* <hr /> */}
        <div className="text-center my-3">
          <select
            name="exportType"
            id=""
            onChange={handleFileTypeSelectionChange}
          >
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
        {/* <hr /> */}
        <div className="text-center my-5">
          {/* <button onClick={handleModalCloseClick}>Close</button> */}

          <button
            className="btn btn-primary mx-1"
            onClick={handleExportButtonClick}
          >
            Export
          </button>
          <button
            className="btn btn-primary mx-1"
            onClick={handleModalButtonCancelClick}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
