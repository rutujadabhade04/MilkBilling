import { useEffect, useState } from "react";
import fieldValidate from "./FormValidations.js";
import "../formstyles.css";
export default function AdminRoleForm(props) {
  let [role, setRole] = useState("");
  let [errorRole, setErrorRole] = useState(props.roleValidations);
  let [flagFormInvalid, setFlagFormInvalid] = useState(false);
  let { action } = props;
  let { selectedEntity } = props;
  let { categoryList } = props;
  // let { fileList } = props;
  let [fileList, setFileList] = useState(getFileListFromRoleSchema());
  function getFileListFromRoleSchema() {
    let list = [];
    props.roleSchema.forEach((e, index) => {
      let obj = {};
      if (e.type == "file") {
        obj["fileAttributeName"] = e.attribute;
        list.push(obj);
      }
    });
    return list;
  }
  useEffect(() => {
    window.scroll(0, 0);
    init();
  }, []);
  function init() {
    let { action } = props;
    if (action === "add") {
      // emptyRole.category = props.categoryToRetain;
      // emptyRole.categoryId = props.categoryIdToRetain;
      setRole(props.emptyRole);
    } else if (action === "update") {
      // in edit mode, keep the update button enabled at the beginning
      setFlagFormInvalid(false);
      setRole(props.roleToBeEdited);
    }
  }
  function handleTextFieldChange(event) {
    let name = event.target.name;
    setRole({ ...role, [name]: event.target.value });
    let message = fieldValidate(event, errorRole);
    let errRole = { ...errorRole };
    errorRole[`${name}`].message = message;
    setErrorRole(errRole);
  }
  function handleBlur(event) {
    let name = event.target.name;
    let message = fieldValidate(event, errorRole);
    let errRole = { ...errorRole };
    errorRole[`${name}`].message = message;
    setErrorRole(errRole);
  }
  function handleFocus(event) {
    setFlagFormInvalid(false);
  }
  function checkAllErrors() {
    for (let field in errorRole) {
      if (errorRole[field].message !== "") {
        return true;
      } //if
    } //for
    let errRole = { ...errorRole };
    let flag = false;
    for (let field in role) {
      if (role[field] == "") {
        flag = true;
        errRole[field].message = "Required...";
      } //if
    } //for
    if (flag) {
      setErrorRole(errRole);
      return true;
    }
    return false;
  }
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // for dropdown, data is to be modified
    // first check whether all entries are valid or not
    if (checkAllErrors()) {
      setFlagFormInvalid(true);
      return;
    }
    setFlagFormInvalid(false);
    if (action == "update") {
      // There might be files in this form, add those also
      for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].newFileName) {
          role[fileList[i].fileAttributeName] = fileList[i].newFileName;
          //currently this is only for one file.
          role.file = fileList[i].newFile;
        }
      } //for
      // console.log(fileList);
    }
    props.onFormSubmit(role);
  };
  function handleFileChange(file, fileIndex) {
    if (action == "add") {
      setRole({
        ...role,
        file: file,
        [fileList[fileIndex].fileAttributeName]: file.name,
      });
    } else if (action == "update") {
      // setRole({ ...role, newFile: file, newImage: file.name });
      // props.onFileChangeInUpdateMode(file, fileIndex);
      let fl = [...fileList];
      fl[fileIndex]["newFileName"] = file.name;
      fl[fileIndex]["newFile"] = file;
      setFileList(fl);
    }
  }
  function handleCancelChangeImageClick() {
    if (action == "update") {
      let fl = [...fileList];
      fl[fileIndex]["newFileName"] = "";
      fl[fileIndex]["newFile"] = "";
      setFileList(fl);
    }
  }
  function handleSelectLevelChange(event) {
    let level = event.target.value.trim();
    setRole({ ...role, level: level });
  }

  function handleCancelFormButton() {
    props.onCancelFormButton();
  }
  let levelArray = ["A", "B", "C", "D", "E", "F"];
  let optionsLevel = levelArray.map((e, index) => (
    <option value={e} key={index}>
      {e}
    </option>
  ));
  return (
    <>
      <form className="text-thick px-4" onSubmit={handleFormSubmit}>
        {/* row starts */}
        <div className="form-group row align-items-center">
          <div className="col-6 my-2">
            <div className="text-bold my-1">
              <label>Name</label>
            </div>
            <div className=" px-0">
              <input
                type="text"
                className="form-control"
                name="name"
                value={role.name}
                onChange={handleTextFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder="Enter Role - E.g. Receptionist"
              />
            </div>
            <div className="">
              {errorRole.name.message ? (
                <span className="text-danger">{errorRole.name.message}</span>
              ) : null}
            </div>
          </div>
          <div className="col-6 my-2">
            <div className="text-bold my-1">
              <label>Level</label>
            </div>
            <div className="px-0">
              <select
                className="form-control"
                name="level"
                value={role.lavel}
                onChange={handleSelectLevelChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
              >
                <option> Select Level </option>
                {optionsLevel}
              </select>
            </div>
          </div>
          <div className="col-12">
            <button
              className="btn btn-primary"
              type="submit"
              // disabled={flagFormInvalid}
            >
              {(action + " " + selectedEntity.singularName).toUpperCase()}
            </button>{" "}
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleCancelFormButton}
            >
              Cancel
            </button>{" "}
            &nbsp;{" "}
            <span className="text-danger">
              {" "}
              {flagFormInvalid ? "Missing data.." : ""}
            </span>
          </div>
        </div>
      </form>
    </>
  );
}
