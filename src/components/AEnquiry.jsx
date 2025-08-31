import { useState } from "react";
import {Modal} from "../external/vite-sdk";
import { Link } from "react-router-dom";

export default function AEnquiry(props) {
  let [flagDeleteButtonPressed, setFlagDeleteButtonPressed] = useState(false);
  let [flagLoad, setFlagLoad] = useState(false);
  let { enquiry } = props;
  let { user } = props;
  let { showInList } = props;
  let { sortedField } = props;
  let { direction } = props;
  let { index } = props;
  let { selectedEntity } = props;
  let { listSize } = props;
  function handleEditButtonClick() {
    props.onEditButtonClick(enquiry);
  }
  function handleDeleteButtonClick() {
    setFlagDeleteButtonPressed(true);
  }
  function handleModalCloseClick() {
    setFlagDeleteButtonPressed(false);
  }
  function handleModalButtonClick(ans) {
    setFlagDeleteButtonPressed(false);
    props.onDeleteButtonClick(ans, enquiry);
  }
  function getNameFromId(id, index) {
    let obj = selectedEntity.attributes[index].optionList.find(
      (e, i) => e._id == id
    );
    return obj.name;
  }
  function handleToggleText(index) {
    props.onToggleText(index);
  }
  function handleWhatsappClick(event) {
    event.preventDefault();
    let message = "";
    let url =
      `https://api.whatsapp.com/send?phone=${enquiry.mobileNumber}&text=` +
      message;
    window.open(url, "_blank");
  }

  return (
    <>
      <div className="row my-2 mx-auto border border-1 border-secondary p-1">
        <div className="col-1">
          {sortedField == "updateDate" && !direction
            ? index + 1
            : listSize - index}
          .
        </div>
        {/* <div key={index} className="col-2">
          {enquiry.name}
        </div> */}
        {showInList.map(
          (e, index) =>
            e.show && (
              <div key={index} className="col-2">
                <>
                  {e.type == "normal" && enquiry[e.attribute]}
                  {e.type == "singleFile" && (
                    <img
                      className="img-fluid"
                      src={
                        import.meta.env.VITE_API_URL +
                        "/uploadedImages/" +
                        enquiry[e.attribute]
                      }
                    />
                  )}
                  {e.type == "text-area" &&
                    e.flagReadMore &&
                    enquiry[e.attribute]}
                  {e.type == "text-area" &&
                    !e.flagReadMore &&
                    enquiry[e.attribute].slice(0, 50)}
                  {e.type == "text-area" && (
                    <button
                      className="btn btn-link"
                      onClick={() => {
                        handleToggleText(index);
                      }}
                    >
                      Read {e.flagReadMore ? "Less" : "More"}
                    </button>
                  )}
                </>
              </div>
            )
        )}

        <div className="col-1">
          <div className="mb-1">
            <span onClick={handleEditButtonClick}>
              <i className="bi bi-pencil-square"></i>
            </span>
            &nbsp;{" "}
            <span onClick={handleDeleteButtonClick}>
              <i className="bi bi-trash3-fill"></i>
            </span>
          </div>
        </div>
        <div className="col-12 ">
          <div className="row mt-2 justify-content-between">
            <div className="col-4">
              <div>
                <span className="text-italic text-small">
                  {enquiry.remarks[enquiry.remarks.length - 1].user}
                </span>
                <Link
                  to={`/AdminEnquiryRemarks?id=${enquiry._id}&productId=${enquiry.productId}&user=${user.name}`}
                  target="_blank"
                >
                  :{" "}
                  {enquiry.remarks[enquiry.remarks.length - 1].remark.slice(
                    0,
                    50
                  )}
                </Link>
              </div>
              <div className="col-12 text-secondary text-italic text-small">
                Last updated:{" "}
                {new Date(enquiry.updateDate).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}{" "}
              </div>
            </div>
            <div className="col-2">
              <span onClick={handleWhatsappClick}>
                <a href="">
                  <i
                    className="bi bi-whatsapp"
                    style={{ fontSize: "2rem", color: "#25D366" }}
                  ></i>
                </a>
              </span>
            </div>
            <div className="col-2">
              <Link
                to={`/AdminEnquiryFiles?id=${enquiry._id}&productId=${enquiry.productId}&user=${user.name}`}
                target="_blank"
              >
                <i
                  className="bi bi-file-earmark-plus"
                  style={{ fontSize: "2rem", color: "#25D366" }}
                ></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {flagDeleteButtonPressed && (
        <Modal
          modalText={
            'Do you really want to delete data of "' + enquiry.name + '".'
          }
          btnGroup={["Yes", "No"]}
          onModalCloseClick={handleModalCloseClick}
          onModalButtonClick={handleModalButtonClick}
        />
      )}
    </>
  );
}
