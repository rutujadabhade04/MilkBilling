import { useEffect, useState } from "react";
import { fieldValidate } from "../external/vite-sdk";
import "../formstyles.css";
import { SingleFileUpload } from "../external/vite-sdk";
import formLayout from "./FormLayout";

export default function AdminCustomerForm(props) {
  let [user, setUser] = useState({});
  let [errorUser, setErrorUser] = useState(props.customerValidations);
  let [flagFormInvalid, setFlagFormInvalid] = useState(false);
  let { action } = props;
  let { selectedEntity } = props;
  let { areaList } = props;
  let { customerSchema } = props;
  let [singleFileList, setSingleFileList] = useState(
    getSingleFileListFromCustomerSchema()
  );
  let fl = formLayout();
  let cardStyle = fl.cardStyle;
  let cols = fl.cols;
  function getSingleFileListFromCustomerSchema() {
    let list = [];
    customerSchema.forEach((e, index) => {
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
    //setUser(props.emptyCustomer);
  }, []);
  function init() {
    let { action } = props;
    if (action === "add") {
      // emptyCustomer.area = props.areaToRetain;
      // emptyCustomer.areaId = props.areaIdToRetain;
      setUser(props.emptyCustomer);
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
    let errCustomer = { ...errorUser };
    errorUser[`${name}`].message = message;
    setErrorUser(errCustomer);
  }
  function handleBlur(event) {
    let name = event.target.name;
    let message = fieldValidate(event, errorUser);
    let errCustomer = { ...errorUser };
    errorUser[`${name}`].message = message;
    setErrorUser(errCustomer);
  }
  function handleFocus(event) {
    setFlagFormInvalid(false);
  }

  // function checkAllErrors() {
  //   for (let field in errorUser) {
  //     if (errorUser[field].message !== "") {
  //       return true;
  //     } //if
  //   } //for
  //   let errProduct = { ...errorUser };
  //   let flag = false;

  //   // for (let field in user) {
  //   //   if (errorUser[field] && user[field] == "") {
  //   //     flag = true;
  //   //     errProduct[field].message = "Required...";
  //   //   } //if
  //   // } //for
  //   for (let field in user) {
  //     // Skip fields not shown in form
  //     // if (["status", "role"].includes(field)) continue;
  //     if (["role"].includes(field)) continue;

  //     if (errorUser[field] && user[field] == "") {
  //       flag = true;
  //       errProduct[field].message = "Required...";
  //     }
  //   }

  //   if (flag) {
  //     setErrorUser(errProduct);
  //     return true;
  //   }
  //   return false;
  // }
  function checkAllErrors() {
    console.log("▶️ User object:", user);
    console.log("▶️ Error object before validation:", errorUser);

    for (let field in errorUser) {
      if (errorUser[field].message !== "") {
        return true;
      }
    }

    let errCustomer = { ...errorUser };
    let flag = false;

    for (let field in user) {
      if (["role"].includes(field)) continue;

      if (errorUser[field] && user[field] == "") {
        flag = true;
        errCustomer[field].message = "Required...";
      }
    }

    if (flag) {
      console.log("⛔ Error object after validation:", errCustomer); // <-- add this
      setErrorUser(errCustomer);
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
  function handleFileChange(selectedFile, fileIndex, message) {
    setFlagFormInvalid(false);
    if (action == "add") {
      // add datesuffix to file-name
      const timestamp = Date.now();
      const ext = selectedFile.name.split(".").pop();
      const base = selectedFile.name.replace(/\.[^/.]+$/, "");
      const newName = `${base}-${timestamp}.${ext}`;
      // Create a new File object with the new name
      const renamedFile = new File([selectedFile], newName, {
        type: selectedFile.type,
        lastModified: selectedFile.lastModified,
      });
      setUser({
        ...user,
        ["file" + fileIndex]: renamedFile,
        [singleFileList[fileIndex].fileAttributeName]: newName,
      });
      let errCustomer = { ...errorUser };
      errCustomer[singleFileList[fileIndex].fileAttributeName].message =
        message;
      setErrorUser(errCustomer);
      // setErrorUser({ ...errorUser, message: message });
    }
  }
  function handleFileRemove(selectedFile, fileIndex, message) {
    if (action == "add") {
      setFlagFormInvalid(false);
      setUser({
        ...user,
        [singleFileList[fileIndex].fileAttributeName]: "",
      });
      let errCustomer = { ...errorUser };
      errCustomer[singleFileList[fileIndex].fileAttributeName].message =
        message;
      setErrorUser(errCustomer);
    } else if (action == "update") {
      let newFileName = "";
      if (selectedFile) {
        newFileName = selectedFile.name;
      } else {
        // user selected a new file but then deselected
        newFileName = "";
      }
      setUser({
        ...user,
        ["file" + fileIndex]: selectedFile,
        [singleFileList[fileIndex].fileAttributeName + "New"]: newFileName,
      });
      let errCustomer = { ...errorUser };
      errCustomer[singleFileList[fileIndex].fileAttributeName].message =
        message;
      setErrorUser(errCustomer);
    }
  }
  function handleFileChangeUpdateMode(selectedFile, fileIndex, message) {
    let newFileName = "";
    if (selectedFile) {
      newFileName = selectedFile.name;
    } else {
      // user selected a new file but then deselected
      newFileName = "";
    }
    setUser({
      ...user,
      // file: file,
      ["file" + fileIndex]: selectedFile,
      [singleFileList[fileIndex].fileAttributeName + "New"]: newFileName,
      // [singleFileList[fileIndex].fileAttributeName]: selectedFile.name,
    });
    let errCustomer = { ...errorUser };
    errCustomer[singleFileList[fileIndex].fileAttributeName].message = message;
    setErrorUser(errCustomer);
  }
  function handleCancelChangeImageClick() {
    if (action == "update") {
      let fl = [...singleFileList];
      fl[fileIndex]["newFileName"] = "";
      fl[fileIndex]["newFile"] = "";
      setSingleFileList(fl);
    }
  }
  function handleSelectAreaChange(event) {
    let index = event.target.selectedIndex; // get selected index, instead of selected value
    var optionElement = event.target.childNodes[index];
    var selectedAreaId = optionElement.getAttribute("id");
    let area = event.target.value.trim();
    let areaId = selectedAreaId;
    setUser({ ...user, area: area, areaId: areaId });
  }

  let optionsArea = areaList.map((area, index) =>
    area.rating != 1 ? (
      <option value={area.name} key={index} id={area._id}>
        {area.name}
      </option>
    ) : null
  );

  return (
    <form className="text-thick p-4" onSubmit={handleFormSubmit}>
      <div className={`${cardStyle}`}>
        {/* row starts */}
        <div className={cols + " my-1"}>
          <div className="text-bold my-1">
            <label className="form-label fw-semibold">Name</label>
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
        <div className={cols + " my-1"}>
          <div className="text-bold my-1">
            <label className="form-label fw-semibold">Email-ID</label>
          </div>
          <div className="px-0">
            <input
              type="email"
              className="form-control"
              name="emailId"
              value={user.emailId || ""}
              onChange={handleTextFieldChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              placeholder="Enter emailId : "
            />
          </div>
          <div className="">
            {errorUser.emailId.message ? (
              <span className="text-danger">{errorUser.emailId.message}</span>
            ) : null}
          </div>
        </div>
        {/* change from here */}
        {/* Mobile Number */}
        <div className={cols + " my-1"}>
          <div className="text-bold my-1">
            <label className="form-label fw-semibold">Mobile Number</label>
          </div>
          <input
            type="text"
            className="form-control"
            name="mobileNumber"
            value={user.mobileNumber || ""}
            onChange={handleTextFieldChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="Enter 10-digit mobile number"
          />
          {errorUser.mobileNumber.message && (
            <span className="text-danger">
              {errorUser.mobileNumber.message}
            </span>
          )}
        </div>

        {/* Address */}
        <div className={cols + " my-1"}>
          <div className="text-bold my-1">
            <label className="form-label fw-semibold">Address</label>
          </div>
          <input
            type="text"
            className="form-control"
            name="address"
            value={user.address || ""}
            onChange={handleTextFieldChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="Enter address"
          />
          {errorUser.address.message && (
            <span className="text-danger">{errorUser.address.message}</span>
          )}
        </div>
        {/* Status */}
        <div className={cols + " my-1"}>
          <div className="text-bold my-1">
            <label className="form-label fw-semibold">Status</label>
          </div>
          <div className="px-0">
            <select
              className="form-control"
              name="status"
              value={user.status || "active"}
              onChange={handleTextFieldChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="">
            {errorUser.status?.message && (
              <span className="text-danger">{errorUser.status.message}</span>
            )}
          </div>
        </div>

        {/* Daily Quantity */}
        <div className={cols + " my-1"}>
          <div className="text-bold my-1">
            <label className="form-label fw-semibold">
              {" "}
              Daily Milk Quantity (Litres)
            </label>
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
        {/* Start Date */}
        <div className={cols + " my-1"}>
          <div className="text-bold my-1">
            <label className="form-label fw-semibold">Start Date</label>
          </div>
          <input
            type="date"
            className="form-control"
            name="start_date"
            value={user.start_date || ""}
            onChange={handleTextFieldChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
          />
          {errorUser.start_date.message && (
            <span className="text-danger">{errorUser.start_date.message}</span>
          )}
        </div>
        <div className={cols + " my-1"}>
          <div className="text-bold my-1">
            <label className="form-label fw-semibold">Area</label>
          </div>
          <div className="px-0">
            <select
              className="form-control"
              name="area"
              value={user.area || ""}
              onChange={handleSelectAreaChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
            >
              <option> Select Area </option>
              {optionsArea}
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
  );
}
