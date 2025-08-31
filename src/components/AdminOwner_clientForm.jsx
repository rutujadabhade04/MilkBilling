// import { useEffect, useState } from "react";
// import { fieldValidate } from "../external/vite-sdk";
// import "../formstyles.css";
// import { SingleFileUpload } from "../external/vite-sdk";
// import formLayout from "./FormLayout";
// export default function AdminOwner_clientForm(props) {
//   let fl = formLayout();
//   let cardStyle = fl.cardStyle;
//   let cols = fl.cols;
//   let [owner_client, setOwner_client] = useState("");
//   let [errorOwner_client, setErrorOwner_client] = useState(props.owner_clientValidations);
//   let [flagFormInvalid, setFlagFormInvalid] = useState(false);
//   let { emptyCustomer } = props;
//   let { customerToBeEdited } = props;
//   let { action } = props;
//   let { selectedEntity } = props;
//   let { owner_clientSchema } = props;
//   let { categoryList } = props;
//   let [singleFileList, setSingleFileList] = useState(
//     getSingleFileListFromOwner_clientSchema()
//   );
//   function getSingleFileListFromOwner_clientSchema() {
//     let list = [];
//     owner_clientSchema.forEach((e, index) => {
//       let obj = {};
//       if (e.type == "singleFile") {
//         obj["fileAttributeName"] = e.attribute;
//         obj["allowedFileType"] = e.allowedFileType;
//         obj["allowedSize"] = e.allowedSize;
//         list.push(obj);
//       }
//     });
//     return list;
//   }
//   useEffect(() => {
//     window.scroll(0, 0);
//     init();
//   }, []);
//   function init() {
//     let { action } = props;
//     if (action === "add") {
//       // emptyOwner_client.category = props.categoryToRetain;
//       // emptyOwner_client.categoryId = props.categoryIdToRetain;
//       setOwner_client(props.emptyOwner_client);
//     } else if (action === "update") {
//       // in edit mode, keep the update button enabled at the beginning
//       setFlagFormInvalid(false);
//       // find missing keys
//       const missing = Object.keys(emptyOwner_client).filter(
//         (key) => !Object.keys(owner_clientToBeEdited).includes(key)
//       );
//       // add them to objB with empty string
//       missing.forEach((key) => {
//         owner_clientToBeEdited[key] = "";
//       });
//       setOwner_client(props.owner_clientToBeEdited);
//     }
//   }
//   function handleTextFieldChange(event) {
//     let name = event.target.name;
//     setOwner_client({ ...owner_client, [name]: event.target.value });
//     let message = fieldValidate(event, errorOwner_client);
//     let errOwner_client = { ...errorOwner_client };
//     errorOwner_client[`${name}`].message = message;
//     setErrorOwner_client(errOwner_client);
//   }
//   function handleBlur(event) {
//     let name = event.target.name;
//     let message = fieldValidate(event, errorOwner_client);
//     let errOwner_client = { ...errorOwner_client };
//     errorOwner_client[`${name}`].message = message;
//     setErrorOwner_client(errOwner_client);
//   }
//   function handleFocus(event) {
//     setFlagFormInvalid(false);
//   }
//   function handleRadioFieldChange(event) {
//     let name = event.target.name;
//     setOwner_client({ ...owner_client, [name]: event.target.value });
//   }
//   function handleCheckBoxChange(event) {
//     const { name, value, checked } = event.target;
//     if (checked) {
//       // Add value to array for that name
//       setOwner_client({ ...owner_client, [name]: [...owner_client[`${name}`], value] });
//     } else {
//       // Remove value from array for that name
//       setOwner_client({
//         ...owner_client,
//         [name]: owner_client[`${name}`].filter((e) => e !== value),
//       });
//     }
//   }
//   function checkAllErrors() {
//     for (let field in errorOwner_client) {
//       if (errorOwner_client[field].message !== "") {
//         return true;
//       } //if
//     } //for
//     let errOwner_client = { ...errorOwner_client };
//     let flag = false;
//     for (let field in owner_client) {
//       if (errorOwner_client[field] && owner_client[field] == "") {
//         flag = true;
//         errOwner_client[field].message = "Required...";
//       } //if
//     } //for
//     if (flag) {
//       setErrorOwner_client(errOwner_client);
//       return true;
//     }
//     return false;
//   }
//   const handleFormSubmit = (e) => {
//     e.preventDefault();
//     // for dropdown, data is to be modified
//     // first check whether all entries are valid or not
//     if (checkAllErrors()) {
//       setFlagFormInvalid(true);
//       return;
//     }
//     setFlagFormInvalid(false);
//     if (action == "update") {
//       // There might be files in this form, add those also
//       let pr = { ...owner_client };
//       for (let i = 0; i < singleFileList.length; i++) {
//         let fAName = singleFileList[i].fileAttributeName;
//         if (pr[fAName + "New"]) {
//           // image is modified
//           // if field-name is image, temporarily in "imageNew" field, new file-name is saved.
//           pr[fAName] = pr[fAName + "New"];
//           delete pr[fAName + "New"];
//         }
//       } //for
//       setOwner_client(pr);
//       props.onFormSubmit(pr);
//     } else if (action == "add") {
//       props.onFormSubmit(owner_client);
//     }
//   };
//   function handleFileChange(selectedFile, fileIndex, message) {
//     setFlagFormInvalid(false);
//     if (action == "add") {
//       // add datesuffix to file-name
//       const timestamp = Date.now();
//       const ext = selectedFile.name.split(".").pop();
//       const base = selectedFile.name.replace(/\.[^/.]+$/, "");
//       const newName = `${base}-${timestamp}.${ext}`;
//       // Create a new File object with the new name
//       const renamedFile = new File([selectedFile], newName, {
//         type: selectedFile.type,
//         lastModified: selectedFile.lastModified,
//       });
//       setOwner_client({
//         ...owner_client,
//         ["file" + fileIndex]: renamedFile,
//         [singleFileList[fileIndex].fileAttributeName]: newName,
//       });
//       let errOwner_client = { ...errorOwner_client };
//       errOwner_client[singleFileList[fileIndex].fileAttributeName].message = message;
//       setErrorOwner_client(errOwner_client);
//       // setErrorOwner_client({ ...errorOwner_client, message: message });
//     }
//   }
//   function handleFileRemove(selectedFile, fileIndex, message) {
//     if (action == "add") {
//       setFlagFormInvalid(false);
//       setOwner_client({
//         ...owner_client,
//         [singleFileList[fileIndex].fileAttributeName]: "",
//       });
//       let errOwner_client = { ...errorOwner_client };
//       errOwner_client[singleFileList[fileIndex].fileAttributeName].message = message;
//       setErrorOwner_client(errOwner_client);
//     } else if (action == "update") {
//       let newFileName = "";
//       if (selectedFile) {
//         newFileName = selectedFile.name;
//       } else {
//         // user selected a new file but then deselected
//         newFileName = "";
//       }
//       setOwner_client({
//         ...owner_client,
//         ["file" + fileIndex]: selectedFile,
//         [singleFileList[fileIndex].fileAttributeName + "New"]: newFileName,
//       });
//       let errOwner_client = { ...errorOwner_client };
//       errOwner_client[singleFileList[fileIndex].fileAttributeName].message = message;
//       setErrorOwner_client(errOwner_client);
//     }
//   }
//   function handleFileChangeUpdateMode(selectedFile, fileIndex, message) {
//     let newFileName = "";
//     if (selectedFile) {
//       newFileName = selectedFile.name;
//     } else {
//       // user selected a new file but then deselected
//       newFileName = "";
//     }
//     setOwner_client({
//       ...owner_client,
//       // file: file,
//       ["file" + fileIndex]: selectedFile,
//       [singleFileList[fileIndex].fileAttributeName + "New"]: newFileName,
//       // [singleFileList[fileIndex].fileAttributeName]: selectedFile.name,
//     });
//     let errOwner_client = { ...errorOwner_client };
//     errOwner_client[singleFileList[fileIndex].fileAttributeName].message = message;
//     setErrorOwner_client(errOwner_client);
//   }
//   function handleCancelChangeImageClick() {
//     if (action == "update") {
//       let fl = [...singleFileList];
//       fl[fileIndex]["newFileName"] = "";
//       fl[fileIndex]["newFile"] = "";
//       setSingleFileList(fl);
//     }
//   }
//   function handleSelectCategoryChange(event) {
//     let category = event.target.value.trim();
//     let categoryId = event.target.selectedOptions[0].id;
//     setOwner_client({ ...owner_client, category: category, categoryId: categoryId });
//   }
//   return (
//     <div>
//       <form className="text-thick p-4" onSubmit={handleFormSubmit}>
//         {/* row starts */}
//         <div className={`${cardStyle}`}>
          
//       <div className={cols +" my-2"}>
//       <div className="text-bold my-1">
//       <label className="form-label fw-semibold">Name</label>
//       </div>
//       <div className=" px-0">
//       <input
//       type="text"
//       className="form-control"
//       name="name"
//       value={owner_client.name}
//       onChange={handleTextFieldChange}
//       onBlur={handleBlur}
//       onFocus={handleFocus}
//       placeholder="Enter name"
//       />
//       </div>
//       <div className="">
//       {errorOwner_client.name.message ? (
//                 <span className="text-danger">{errorOwner_client.name.message}</span>
//                 ) : null}
//                 </div>
//                 </div>
//       <div className={cols +" my-2"}>
//       <div className="text-bold my-1">
//       <label className="form-label fw-semibold">Email</label>
//       </div>
//       <div className=" px-0">
//       <input
//       type="email"
//       className="form-control"
//       name="email"
//       value={owner_client.email}
//       onChange={handleTextFieldChange}
//       onBlur={handleBlur}
//       onFocus={handleFocus}
//       placeholder="Enter email"
//       />
//       </div>
//       <div className="">
//       {errorOwner_client.email.message ? (
//                 <span className="text-danger">{errorOwner_client.email.message}</span>
//                 ) : null}
//                 </div>
//                 </div>
//       <div className={cols +" my-2"}>
//       <div className="text-bold my-1">
//       <label className="form-label fw-semibold">Whatsappno</label>
//       </div>
//       <div className=" px-0">
//       <input
//       type="number"
//       className="form-control"
//       name="whatsappno"
//       value={owner_client.whatsappno}
//       onChange={handleTextFieldChange}
//       onBlur={handleBlur}
//       onFocus={handleFocus}
//       placeholder="Enter whatsappno"
//       />
//       </div>
//       <div className="">
//       {errorOwner_client.whatsappno.message ? (
//                 <span className="text-danger">{errorOwner_client.whatsappno.message}</span>
//                 ) : null}
//                 </div>
//                 </div>
//       <div className={cols +" my-2"}>
//       <div className="text-bold my-1">
//       <label className="form-label fw-semibold">Startdate</label>
//       </div>
//       <div className=" px-0">
//       <input
//       type="date"
//       className="form-control"
//       name="startdate"
//       value={owner_client.startdate}
//       onChange={handleTextFieldChange}
//       onBlur={handleBlur}
//       onFocus={handleFocus}
//       placeholder="Enter startdate"
//       />
//       </div>
//       <div className="">
//       {errorOwner_client.startdate.message ? (
//                 <span className="text-danger">{errorOwner_client.startdate.message}</span>
//                 ) : null}
//                 </div>
//                 </div>
//       <div className={cols +" my-2"}>
//       <div className="text-bold my-1">
//       <label className="form-label fw-semibold">Paymentdate</label>
//       </div>
//       <div className=" px-0">
//       <input
//       type="date"
//       className="form-control"
//       name="paymentdate"
//       value={owner_client.paymentdate}
//       onChange={handleTextFieldChange}
//       onBlur={handleBlur}
//       onFocus={handleFocus}
//       placeholder="Enter paymentdate"
//       />
//       </div>
//       <div className="">
//       {errorOwner_client.paymentdate.message ? (
//                 <span className="text-danger">{errorOwner_client.paymentdate.message}</span>
//                 ) : null}
//                 </div>
//                 </div>
//       <div className={cols +" my-2"}>
//       <div className="text-bold my-1">
//       <label className="form-label fw-semibold">Dbname</label>
//       </div>
//       <div className=" px-0">
//       <input
//       type="text"
//       className="form-control"
//       name="dbname"
//       value={owner_client.dbname}
//       onChange={handleTextFieldChange}
//       onBlur={handleBlur}
//       onFocus={handleFocus}
//       placeholder="Enter dbname"
//       />
//       </div>
//       <div className="">
//       {errorOwner_client.dbname.message ? (
//                 <span className="text-danger">{errorOwner_client.dbname.message}</span>
//                 ) : null}
//                 </div>
//                 </div>
//       <div className={cols +" my-2"}>
//       <div className="text-bold my-1">
//       <label className="form-label fw-semibold">Link</label>
//       </div>
//       <div className=" px-0">
//       <input
//       type="text"
//       className="form-control"
//       name="link"
//       value={owner_client.link}
//       onChange={handleTextFieldChange}
//       onBlur={handleBlur}
//       onFocus={handleFocus}
//       placeholder="Enter link"
//       />
//       </div>
//       <div className="">
//       {errorOwner_client.link.message ? (
//                 <span className="text-danger">{errorOwner_client.link.message}</span>
//                 ) : null}
//                 </div>
//                 </div>
//           <div className={cols + " my-2"}>
//         <div className="text-bold my-1">
//         <label className="form-label fw-semibold">Status</label>
//         </div>
//         <div className="px-0"><input
//         type="radio"
//         name="status"
//         value="active"
//         onChange={handleRadioFieldChange}
//         onBlur={handleBlur}
//         onFocus={handleFocus}      
//         checked={owner_client.status == "active"}
//         />&nbsp;active&nbsp;<input
//         type="radio"
//         name="status"
//         value="inactive"
//         onChange={handleRadioFieldChange}
//         onBlur={handleBlur}
//         onFocus={handleFocus}      
//         checked={owner_client.status == "inactive"}
//         />&nbsp;inactive&nbsp;<input
//         type="radio"
//         name="status"
//         value="closed"
//         onChange={handleRadioFieldChange}
//         onBlur={handleBlur}
//         onFocus={handleFocus}      
//         checked={owner_client.status == "closed"}
//         />&nbsp;closed&nbsp;</div>
//           </div>
          
//           <div className="col-12">
//             <button
//               className="btn btn-primary"
//               type="submit"
//               // disabled={flagFormInvalid}
//             >
//               {(action + " " + selectedEntity.singularName).toUpperCase()}
//             </button>{" "}
//             &nbsp;{" "}
//             <span className="text-danger">
//               {" "}
//               {flagFormInvalid ? "Missing data.." : ""}
//             </span>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { fieldValidate } from "../external/vite-sdk";
import "../formstyles.css";
import { SingleFileUpload } from "../external/vite-sdk";
import formLayout from "./FormLayout";
export default function AdminOwner_clientForm(props) {
  let fl = formLayout();
  let cardStyle = fl.cardStyle;
  let cols = fl.cols;

  // Corrected initial state to an empty object
  let [owner_client, setOwner_client] = useState({});
  let [errorOwner_client, setErrorOwner_client] = useState(props.owner_clientValidations);
  let [flagFormInvalid, setFlagFormInvalid] = useState(false);

  // Destructuring props for easier access
  let { action, selectedEntity, owner_clientSchema, owner_clientToBeEdited } = props;

  let [singleFileList, setSingleFileList] = useState(
    getSingleFileListFromOwner_clientSchema()
  );

  function getSingleFileListFromOwner_clientSchema() {
    let list = [];
    owner_clientSchema.forEach((e, index) => {
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
  }, [action]); // Added 'action' to dependency array to re-run on action change
  
  function init() {
    if (action === "add") {
      // setOwner_client(props.emptyOwner_client);
      setOwner_client({ ...props.emptyOwner_client, status: "inactive" });
    } else if (action === "update") {
      setFlagFormInvalid(false);
      // Corrected to use props.emptyOwner_client
      const missing = Object.keys(props.emptyOwner_client).filter(
        (key) => !Object.keys(owner_clientToBeEdited).includes(key)
      );
      missing.forEach((key) => {
        owner_clientToBeEdited[key] = "";
      });
      setOwner_client(props.owner_clientToBeEdited);
    }
  }

  function handleTextFieldChange(event) {
    let name = event.target.name;
    setOwner_client({ ...owner_client, [name]: event.target.value });
    let message = fieldValidate(event, errorOwner_client);
    let errOwner_client = { ...errorOwner_client };
    errorOwner_client[`${name}`].message = message;
    setErrorOwner_client(errOwner_client);
  }

  function handleBlur(event) {
    let name = event.target.name;
    let message = fieldValidate(event, errorOwner_client);
    let errOwner_client = { ...errorOwner_client };
    errorOwner_client[`${name}`].message = message;
    setErrorOwner_client(errOwner_client);
  }

  function handleFocus(event) {
    setFlagFormInvalid(false);
  }

  function handleRadioFieldChange(event) {
    let name = event.target.name;
    setOwner_client({ ...owner_client, [name]: event.target.value });
  }

  function handleCheckBoxChange(event) {
    const { name, value, checked } = event.target;
    if (checked) {
      setOwner_client({ ...owner_client, [name]: [...owner_client[`${name}`], value] });
    } else {
      setOwner_client({
        ...owner_client,
        [name]: owner_client[`${name}`].filter((e) => e !== value),
      });
    }
  }

  function checkAllErrors() {
    for (let field in errorOwner_client) {
      if (errorOwner_client[field].message !== "") {
        return true;
      }
    }
    let errOwner_client = { ...errorOwner_client };
    let flag = false;
    for (let field in owner_client) {
      if (errorOwner_client[field] && owner_client[field] === "") {
        flag = true;
        errOwner_client[field].message = "Required...";
      }
    }
    if (flag) {
      setErrorOwner_client(errOwner_client);
      return true;
    }
    return false;
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (checkAllErrors()) {
      setFlagFormInvalid(true);
      return;
    }
    setFlagFormInvalid(false);
    if (action === "update") {
      let pr = { ...owner_client };
      for (let i = 0; i < singleFileList.length; i++) {
        let fAName = singleFileList[i].fileAttributeName;
        if (pr[fAName + "New"]) {
          pr[fAName] = pr[fAName + "New"];
          delete pr[fAName + "New"];
        }
      }
      setOwner_client(pr);
      props.onFormSubmit(pr);
    } else if (action === "add") {
      props.onFormSubmit(owner_client);
    }
  };

  function handleFileChange(selectedFile, fileIndex, message) {
    setFlagFormInvalid(false);
    if (action === "add") {
      const timestamp = Date.now();
      const ext = selectedFile.name.split(".").pop();
      const base = selectedFile.name.replace(/\.[^/.]+$/, "");
      const newName = `${base}-${timestamp}.${ext}`;
      const renamedFile = new File([selectedFile], newName, {
        type: selectedFile.type,
        lastModified: selectedFile.lastModified,
      });
      setOwner_client({
        ...owner_client,
        ["file" + fileIndex]: renamedFile,
        [singleFileList[fileIndex].fileAttributeName]: newName,
      });
      let errOwner_client = { ...errorOwner_client };
      errOwner_client[singleFileList[fileIndex].fileAttributeName].message = message;
      setErrorOwner_client(errOwner_client);
    }
  }

  function handleFileRemove(selectedFile, fileIndex, message) {
    if (action === "add") {
      setFlagFormInvalid(false);
      setOwner_client({
        ...owner_client,
        [singleFileList[fileIndex].fileAttributeName]: "",
      });
      let errOwner_client = { ...errorOwner_client };
      errOwner_client[singleFileList[fileIndex].fileAttributeName].message = message;
      setErrorOwner_client(errOwner_client);
    } else if (action === "update") {
      let newFileName = "";
      if (selectedFile) {
        newFileName = selectedFile.name;
      }
      setOwner_client({
        ...owner_client,
        ["file" + fileIndex]: selectedFile,
        [singleFileList[fileIndex].fileAttributeName + "New"]: newFileName,
      });
      let errOwner_client = { ...errorOwner_client };
      errOwner_client[singleFileList[fileIndex].fileAttributeName].message = message;
      setErrorOwner_client(errOwner_client);
    }
  }

  function handleFileChangeUpdateMode(selectedFile, fileIndex, message) {
    let newFileName = "";
    if (selectedFile) {
      newFileName = selectedFile.name;
    }
    setOwner_client({
      ...owner_client,
      ["file" + fileIndex]: selectedFile,
      [singleFileList[fileIndex].fileAttributeName + "New"]: newFileName,
    });
    let errOwner_client = { ...errorOwner_client };
    errOwner_client[singleFileList[fileIndex].fileAttributeName].message = message;
    setErrorOwner_client(errOwner_client);
  }

  function handleCancelChangeImageClick() {
    if (action === "update") {
      let fl = [...singleFileList];
      fl[fileIndex]["newFileName"] = "";
      fl[fileIndex]["newFile"] = "";
      setSingleFileList(fl);
    }
  }

  function handleSelectCategoryChange(event) {
    let category = event.target.value.trim();
    let categoryId = event.target.selectedOptions[0].id;
    setOwner_client({ ...owner_client, category: category, categoryId: categoryId });
  }

  return (
    <div>
      <form className="text-thick p-4" onSubmit={handleFormSubmit}>
        {/* row starts */}
        <div className={`${cardStyle}`}>
          <div className={cols + " my-2"}>
            <div className="text-bold my-1">
              <label className="form-label fw-semibold">Name</label>
            </div>
            <div className=" px-0">
              <input
                type="text"
                className="form-control"
                name="name"
                value={owner_client.name || ""}
                onChange={handleTextFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder="Enter name"
              />
            </div>
            <div className="">
              {errorOwner_client.name.message ? (
                <span className="text-danger">{errorOwner_client.name.message}</span>
              ) : null}
            </div>
          </div>
          <div className={cols + " my-2"}>
            <div className="text-bold my-1">
              <label className="form-label fw-semibold">Email</label>
            </div>
            <div className=" px-0">
              <input
                type="email"
                className="form-control"
                name="email"
                value={owner_client.email || ""}
                onChange={handleTextFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder="Enter email"
              />
            </div>
            <div className="">
              {errorOwner_client.email.message ? (
                <span className="text-danger">{errorOwner_client.email.message}</span>
              ) : null}
            </div>
          </div>
          <div className={cols + " my-2"}>
            <div className="text-bold my-1">
              <label className="form-label fw-semibold">Whatsappno</label>
            </div>
            <div className=" px-0">
              <input
                type="number"
                className="form-control"
                name="whatsappno"
                value={owner_client.whatsappno || ""}
                onChange={handleTextFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder="Enter whatsappno"
              />
            </div>
            <div className="">
              {errorOwner_client.whatsappno.message ? (
                <span className="text-danger">{errorOwner_client.whatsappno.message}</span>
              ) : null}
            </div>
          </div>
          <div className={cols + " my-2"}>
            <div className="text-bold my-1">
              <label className="form-label fw-semibold">Startdate</label>
            </div>
            <div className=" px-0">
              <input
                type="date"
                className="form-control"
                name="startdate"
                value={owner_client.startdate || ""}
                onChange={handleTextFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder="Enter startdate"
              />
            </div>
            <div className="">
              {errorOwner_client.startdate.message ? (
                <span className="text-danger">{errorOwner_client.startdate.message}</span>
              ) : null}
            </div>
          </div>
          <div className={cols + " my-2"}>
            <div className="text-bold my-1">
              <label className="form-label fw-semibold">Paymentdate</label>
            </div>
            <div className=" px-0">
              <input
                type="date"
                className="form-control"
                name="paymentdate"
                value={owner_client.paymentdate || ""}
                onChange={handleTextFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder="Enter paymentdate"
              />
            </div>
            <div className="">
              {errorOwner_client.paymentdate.message ? (
                <span className="text-danger">{errorOwner_client.paymentdate.message}</span>
              ) : null}
            </div>
          </div>
          <div className={cols + " my-2"}>
            <div className="text-bold my-1">
              <label className="form-label fw-semibold">Dbname</label>
            </div>
            <div className=" px-0">
              <input
                type="text"
                className="form-control"
                name="dbname"
                value={owner_client.dbname || ""}
                onChange={handleTextFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder="Enter dbname"
              />
            </div>
            <div className="">
              {errorOwner_client.dbname.message ? (
                <span className="text-danger">{errorOwner_client.dbname.message}</span>
              ) : null}
            </div>
          </div>
          <div className={cols + " my-2"}>
            <div className="text-bold my-1">
              <label className="form-label fw-semibold">Link</label>
            </div>
            <div className=" px-0">
              <input
                type="text"
                className="form-control"
                name="link"
                value={owner_client.link || ""}
                onChange={handleTextFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder="Enter link"
              />
            </div>
            <div className="">
              {errorOwner_client.link.message ? (
                <span className="text-danger">{errorOwner_client.link.message}</span>
              ) : null}
            </div>
          </div>
          <div className={cols + " my-2"}>
            <div className="text-bold my-1">
              <label className="form-label fw-semibold">Status</label>
            </div>
            <div className="px-0">
              <input
                type="radio"
                name="status"
                value="active"
                onChange={handleRadioFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                checked={owner_client.status === "active"}
              />&nbsp;active&nbsp;
              <input
                type="radio"
                name="status"
                value="inactive"
                onChange={handleRadioFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                checked={owner_client.status === "inactive"}
              />&nbsp;inactive&nbsp;
              <input
                type="radio"
                name="status"
                value="closed"
                onChange={handleRadioFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                checked={owner_client.status === "closed"}
              />&nbsp;closed&nbsp;
            </div>
          </div>
          <div className="col-12">
            <button
              className="btn btn-primary"
              type="submit"
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