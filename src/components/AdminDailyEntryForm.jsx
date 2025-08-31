import { useEffect, useState } from "react";
import { fieldValidate } from "../external/vite-sdk";
import "../formstyles.css";
import { SingleFileUpload } from "../external/vite-sdk";

export default function AdminDailyEntryForm(props) {
  let [user, setUser] = useState({});
  let [errorUser, setErrorUser] = useState(props.entryValidations);
  let [flagFormInvalid, setFlagFormInvalid] = useState(false);
  let { action } = props;
  let { selectedEntity } = props;
  let { categoryList } = props;
  let { entrySchema } = props;
  let [singleFileList, setSingleFileList] = useState(
    getSingleFileListFromEntrySchema()
  );
  function getSingleFileListFromEntrySchema() {
    let list = [];
    entrySchema.forEach((e, index) => {
      let obj = {};
      if (e.type == "singleFile") {
        obj["fileAttributeName"] = e.attribute;
        obj["allowedFileType"] = e.allowedFileType;
        obj["allowedSize"] = e.allowedSize;
        list.push(obj);
      }
    });
    return list;
  }
  useEffect(() => {
    window.scroll(0, 0);
    init();
    //setUser(props.emptyEntry);
  }, []);
  function init() {
    let { action } = props;
    if (action === "add") {
      // emptyEntry.category = props.categoryToRetain;
      // emptyEntry.categoryId = props.categoryIdToRetain;
      setUser(props.emptyEntry);
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
    let errEntry = { ...errorUser };
    errorUser[`${name}`].message = message;
    setErrorUser(errEntry);
  }
  function handleBlur(event) {
    let name = event.target.name;
    let message = fieldValidate(event, errorUser);
    let errEntry = { ...errorUser };
    errorUser[`${name}`].message = message;
    setErrorUser(errEntry);
  }
  function handleFocus(event) {
    setFlagFormInvalid(false);
  }
  function checkAllErrors() {
    console.log("▶️ User object:", user);
    console.log("▶️ Error object before validation:", errorUser);

    for (let field in errorUser) {
      if (errorUser[field].message !== "") {
        return true;
      }
    }
    let errEntry = { ...errorUser };
    let flag = false;
    for (let field in user) {
      if (["role"].includes(field)) continue;
      if (errorUser[field] && user[field] == "") {
        flag = true;
        errEntry[field].message = "Required...";
      }
    }
    if (flag) {
      console.log("⛔ Error object after validation:", errEntry); // <-- add this
      setErrorUser(errEntry);
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
      let pr = { ...user };
      for (let i = 0; i < singleFileList.length; i++) {
        let fAName = singleFileList[i].fileAttributeName;
        if (pr[fAName + "New"]) {
          // image is modified
          // if field-name is image, temporarily in "imageNew" field, new file-name is saved.
          pr[fAName] = pr[fAName + "New"];
          delete pr[fAName + "New"];
        }
      } //for
      setUser(pr);
      props.onFormSubmit(pr);
    } else if (action == "add") {
      console.log("📝 Submitting form with data:", user);
      props.onFormSubmit(user);
    }
  };
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
                value={user.name || ""}
                onChange={handleTextFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder="Enter Customer name"
              />
            </div>
            <div className="">
              {errorUser.name.message ? (
                <span className="text-danger">{errorUser.name.message}</span>
              ) : null}
            </div>
          </div>
          {/* Daily Quantity */}
          <div className="col-6 my-2">
            <div className="text-bold my-1">
              <label>Daily Milk Quantity (Litres)</label>
            </div>
            <input
              type="text"
              className="form-control"
              name="daily_qty"
              value={user.daily_qty || ""}
              onChange={handleTextFieldChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              placeholder="e.g., 1.5"
            />
            {errorUser.daily_qty.message && (
              <span className="text-danger">{errorUser.daily_qty.message}</span>
            )}
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
