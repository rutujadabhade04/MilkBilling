import { useEffect, useState } from "react";
import { fieldValidate } from "../external/vite-sdk";
import "../formstyles.css";
import { SingleFileUpload } from "../external/vite-sdk";
export default function AdminProductForm(props) {
  let [product, setProduct] = useState("");
  let [errorProduct, setErrorProduct] = useState(props.productValidations);
  let [flagFormInvalid, setFlagFormInvalid] = useState(false);
  let { action } = props;
  let { selectedEntity } = props;
  let { categoryList } = props;
  let { productSchema } = props;
  let [singleFileList, setSingleFileList] = useState(
    getSingleFileListFromProductSchema()
  );
  function getSingleFileListFromProductSchema() {
    let list = [];
    productSchema.forEach((e, index) => {
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
  }, []);
  function init() {
    let { action } = props;
    if (action === "add") {
      // emptyProduct.category = props.categoryToRetain;
      // emptyProduct.categoryId = props.categoryIdToRetain;
      setProduct(props.emptyProduct);
    } else if (action === "update") {
      // in edit mode, keep the update button enabled at the beginning
      setFlagFormInvalid(false);
      setProduct(props.productToBeEdited);
    }
  }
  function handleTextFieldChange(event) {
    let name = event.target.name;
    setProduct({ ...product, [name]: event.target.value });
    let message = fieldValidate(event, errorProduct);
    let errProduct = { ...errorProduct };
    errorProduct[`${name}`].message = message;
    setErrorProduct(errProduct);
  }
  function handleBlur(event) {
    let name = event.target.name;
    let message = fieldValidate(event, errorProduct);
    let errProduct = { ...errorProduct };
    errorProduct[`${name}`].message = message;
    setErrorProduct(errProduct);
  }
  function handleFocus(event) {
    setFlagFormInvalid(false);
  }
  function checkAllErrors() {
    for (let field in errorProduct) {
      if (errorProduct[field].message !== "") {
        return true;
      } //if
    } //for
    let errProduct = { ...errorProduct };
    let flag = false;
    for (let field in product) {
      if (errorProduct[field] && product[field] == "") {
        flag = true;
        errProduct[field].message = "Required...";
      } //if
    } //for
    if (flag) {
      setErrorProduct(errProduct);
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
      let pr = { ...product };
      for (let i = 0; i < singleFileList.length; i++) {
        let fAName = singleFileList[i].fileAttributeName;
        if (pr[fAName + "New"]) {
          // image is modified
          // if field-name is image, temporarily in "imageNew" field, new file-name is saved.
          pr[fAName] = pr[fAName + "New"];
          delete pr[fAName + "New"];
        }
      } //for
      setProduct(pr);
      props.onFormSubmit(pr);
    } else if (action == "add") {
      props.onFormSubmit(product);
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
      setProduct({
        ...product,
        ["file" + fileIndex]: renamedFile,
        [singleFileList[fileIndex].fileAttributeName]: newName,
      });
      let errProduct = { ...errorProduct };
      errProduct[singleFileList[fileIndex].fileAttributeName].message = message;
      setErrorProduct(errProduct);
      // setErrorProduct({ ...errorProduct, message: message });
    }
  }
  function handleFileRemove(selectedFile, fileIndex, message) {
    if (action == "add") {
      setFlagFormInvalid(false);
      setProduct({
        ...product,
        [singleFileList[fileIndex].fileAttributeName]: "",
      });
      let errProduct = { ...errorProduct };
      errProduct[singleFileList[fileIndex].fileAttributeName].message = message;
      setErrorProduct(errProduct);
    } else if (action == "update") {
      let newFileName = "";
      if (selectedFile) {
        newFileName = selectedFile.name;
      } else {
        // user selected a new file but then deselected
        newFileName = "";
      }
      setProduct({
        ...product,
        ["file" + fileIndex]: selectedFile,
        [singleFileList[fileIndex].fileAttributeName + "New"]: newFileName,
      });
      let errProduct = { ...errorProduct };
      errProduct[singleFileList[fileIndex].fileAttributeName].message = message;
      setErrorProduct(errProduct);
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
    setProduct({
      ...product,
      // file: file,
      ["file" + fileIndex]: selectedFile,
      [singleFileList[fileIndex].fileAttributeName + "New"]: newFileName,
      // [singleFileList[fileIndex].fileAttributeName]: selectedFile.name,
    });
    let errProduct = { ...errorProduct };
    errProduct[singleFileList[fileIndex].fileAttributeName].message = message;
    setErrorProduct(errProduct);
  }
  function handleCancelChangeImageClick() {
    if (action == "update") {
      let fl = [...singleFileList];
      fl[fileIndex]["newFileName"] = "";
      fl[fileIndex]["newFile"] = "";
      setSingleFileList(fl);
    }
  }
  function handleSelectCategoryChange(event) {
    let category = event.target.value.trim();
    let categoryId = event.target.selectedOptions[0].id;
    setProduct({ ...product, category: category, categoryId: categoryId });
  }

  let optionsCategory = categoryList.map((category, index) =>
    category.rating != 1 ? (
      <option value={category.name} key={index} id={category._id}>
        {category.name}
      </option>
    ) : null
  );

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
                value={product.name}
                onChange={handleTextFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder="Enter product name"
              />
            </div>
            <div className="">
              {errorProduct.name.message ? (
                <span className="text-danger">{errorProduct.name.message}</span>
              ) : null}
            </div>
          </div>
          <div className="col-6 my-2">
            <div className="text-bold my-1">
              <label>Price</label>
            </div>
            <div className="px-0">
              <input
                type="text"
                className="form-control"
                name="price"
                value={product.price}
                onChange={handleTextFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder="Enter price in Rs."
              />
            </div>
            <div className="">
              {errorProduct.price.message ? (
                <span className="text-danger">
                  {errorProduct.price.message}
                </span>
              ) : null}
            </div>
          </div>
          <div className="col-6 my-2">
            <div className="text-bold my-1">
              <label>Final Price</label>
            </div>
            <div className="px-0">
              <input
                type="text"
                className="form-control"
                name="finalPrice"
                value={product.finalPrice}
                onChange={handleTextFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder="Enter discounted price in Rs."
              />
            </div>
            <div className="">
              {errorProduct.finalPrice.message ? (
                <span className="text-danger">
                  {errorProduct.finalPrice.message}
                </span>
              ) : null}
            </div>
          </div>
          <div className="col-12 my-2">
            <div className="text-bold my-1">
              <label>Information</label>
            </div>
            <div className="px-0">
              <textarea
                className="form-control"
                name="info"
                style={{ height: "300px" }}
                rows={5}
                // cols={20}
                value={product.info}
                onChange={handleTextFieldChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder="Enter information"
              ></textarea>
            </div>
            <div className="">
              {errorProduct.info.message ? (
                <span className="text-danger">{errorProduct.info.message}</span>
              ) : null}
            </div>
          </div>
          <div className="col-12 my-2">
            <div className="text-bold my-1">
              <label>Product Image</label>
            </div>
            <SingleFileUpload
              action={action}
              singleFileList={singleFileList}
              name="productImage"
              fileName={product.productImage}
              VITE_API_URL={import.meta.env.VITE_API_URL}
              onFileChange={handleFileChange}
              onFileChangeUpdateMode={handleFileChangeUpdateMode}
              onCancelChangeImageClick={handleCancelChangeImageClick}
              onFileRemove={handleFileRemove}
            />
            <div className="">
              {errorProduct.productImage.message ? (
                <span className="text-danger">
                  {errorProduct.productImage.message}
                </span>
              ) : null}
            </div>
          </div>
          <div className="col-6 my-2">
            <div className="text-bold my-1">
              <label>Category</label>
            </div>
            <div className="px-0">
              <select
                className="form-control"
                name="category"
                value={product.category}
                onChange={handleSelectCategoryChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
              >
                <option> Select Category </option>
                {optionsCategory}
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
