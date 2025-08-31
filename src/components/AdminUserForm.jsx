import { useEffect, useState } from "react";
import fieldValidate from "./FormValidations.js";
import "../formstyles.css";
export default function AdminUserForm(props) {
  let [user, setUser] = useState("");
  let [errorUser, setErrorUser] = useState(props.userValidations);
  let [flagFormInvalid, setFlagFormInvalid] = useState(false);
  let { action } = props;
  let { selectedEntity } = props;
  let { roleList } = props;
  // let { fileList } = props;
  let [fileList, setFileList] = useState(getFileListFromUserSchema());
  function getFileListFromUserSchema() {
    let list = [];
    props.userSchema.forEach((e, index) => {
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
      // emptyUser.category = props.categoryToRetain;
      // emptyUser.categoryId = props.categoryIdToRetain;
      setUser(props.emptyUser);
    } else if (action === "update") {
      // in edit mode, keep the update button enabled at the beginning
      setFlagFormInvalid(false);
      setUser(props.userToBeEdited);
    }
  }
  function handleTextFieldChange(event) {
    let name = event.target.name;
    setUser({ ...user, [name]: event.target.value });
    let message = fieldValidate(event, errorUser);
    let errUser = { ...errorUser };
    errorUser[`${name}`].message = message;
    setErrorUser(errUser);
  }
  function handleBlur(event) {
    let name = event.target.name;
    let message = fieldValidate(event, errorUser);
    let errUser = { ...errorUser };
    errorUser[`${name}`].message = message;
    setErrorUser(errUser);
  }
  function handleFocus(event) {
    setFlagFormInvalid(false);
  }
  function checkAllErrors() {
    for (let field in errorUser) {
      if (errorUser[field].message !== "") {
        return true;
      } //if
    } //for
    let errUser = { ...errorUser };
    let flag = false;
    for (let field in user) {
      if (user[field] == "") {
        flag = true;
        errUser[field].message = "Required...";
      } //if
    } //for
    if (flag) {
      setErrorUser(errUser);
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
          user[fileList[i].fileAttributeName] = fileList[i].newFileName;
          //currently this is only for one file.
          user.file = fileList[i].newFile;
        }
      } //for
      // console.log(fileList);
    }
    props.onFormSubmit(user);
  };
  function handleFileChange(file, fileIndex) {
    if (action == "add") {
      setUser({
        ...user,
        file: file,
        [fileList[fileIndex].fileAttributeName]: file.name,
      });
    } else if (action == "update") {
      // setUser({ ...user, newFile: file, newImage: file.name });
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
  function handleSelectRoleChange(event) {
    let index = event.target.selectedIndex; // get selected index, instead of selected value
    var optionElement = event.target.childNodes[index];
    var selectedRoleId = optionElement.getAttribute("id");
    let role = event.target.value.trim();
    let roleId = selectedRoleId;
    setUser({ ...user, role: role, roleId: roleId });
  }
  function handleUserStatusSelection(userStatus) {
    setUser({ ...user, status: userStatus });
  }
  let optionsRole = roleList.map((role, index) => (
    <option value={role.name} key={index} id={role._id}>
      {role.name}
    </option>
  ));
  return (
    <div className="p-2">
      <form className="text-thick p-4" onSubmit={handleFormSubmit}>
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
                value={user.name}
                onChange={handleTextFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder="Enter user name"
              />
            </div>
            <div className="">
              {errorUser.name.message ? (
                <span className="text-danger">{errorUser.name.message}</span>
              ) : null}
            </div>
          </div>
          {/* field starts */}
          <div className="col-6 my-2">
            <div className="text-bold my-1">
              <label>Status</label>
            </div>
            <div className="px-0">
              <input
                type="radio"
                name="status"
                id=""
                checked={user.status == "active"}
                onChange={() => handleUserStatusSelection("active")}
              />{" "}
              Active{" "}
              <input
                type="radio"
                name="status"
                id=""
                checked={user.status == "disabled"}
                onChange={() => handleUserStatusSelection("disabled")}
              />{" "}
              Disabled{" "}
              <input
                type="radio"
                name="status"
                id=""
                checked={user.status == "forgotPassword"}
                onChange={() => handleUserStatusSelection("forgotPassword")}
              />{" "}
              Forgot password
            </div>
            <div className="">
              {errorUser.emailId.message ? (
                <span className="text-danger">{errorUser.emailId.message}</span>
              ) : null}
            </div>
          </div>
          {/* field ends */}
          <div className="col-6 my-2">
            <div className="text-bold my-1">
              <label>EmailId</label>
            </div>
            <div className="px-0">
              <input
                type="text"
                className="form-control"
                name="emailId"
                value={user.emailId}
                onChange={handleTextFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder="Enter email-id"
              />
            </div>
            <div className="">
              {errorUser.emailId.message ? (
                <span className="text-danger">{errorUser.emailId.message}</span>
              ) : null}
            </div>
          </div>
          <div className="col-6 my-2">
            <div className="text-bold my-1">
              <label>Mobile Number</label>
            </div>
            <div className="px-0">
              <input
                type="text"
                className="form-control"
                name="mobileNumber"
                value={user.mobileNumber}
                onChange={handleTextFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder="Enter Mobile Number"
              />
            </div>
            <div className="">
              {errorUser.mobileNumber.message ? (
                <span className="text-danger">
                  {errorUser.mobileNumber.message}
                </span>
              ) : null}
            </div>
          </div>
          <div className="col-6 my-2">
            <div className="text-bold my-1">
              <label>Role</label>
            </div>
            <div className="px-0">
              <select
                className="form-control"
                name="role"
                value={user.role}
                onChange={handleSelectRoleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
              >
                <option> Select Role </option>
                {optionsRole}
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
            &nbsp;{" "}
            <span className="text-danger">
              {" "}
              {flagFormInvalid ? "Missing data.." : ""}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
