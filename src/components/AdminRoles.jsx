import { useEffect, useState } from "react";
import {
  CommonUtilityBar,
  CheckBoxHeaders,
  ListHeaders,
  Entity,
} from "../external/vite-sdk";
import AdminRoleForm from "./AdminRoleForm";
import { BeatLoader } from "react-spinners";
import axios from "axios";
import { getEmptyObject, getShowInList } from "../external/vite-sdk";

export default function AdminRoles(props) {
  let [roleList, setRoleList] = useState([]);
  let [action, setAction] = useState("list");
  let [filteredRoleList, setFilteredRoleList] = useState([]);
  let [roleToBeEdited, setRoleToBeEdited] = useState("");
  let [flagLoad, setFlagLoad] = useState(false);
  let [message, setMessage] = useState("");
  let [searchText, setSearchText] = useState("");
  let [sortedField, setSortedField] = useState("");
  let [direction, setDirection] = useState("");
  let { selectedEntity } = props;
  let { flagFormInvalid } = props;
  let { flagToggleButton } = props;
  let roleSchema = [
    { attribute: "name", type: "normal" },
    { attribute: "level", type: "normal" },
  ];
  let roleValidations = {
    name: { message: "", mxLen: 80, mnLen: 4, onlyDigits: false },
    level: { message: "", onlyDigits: false },
  };
  let [showInList, setShowInList] = useState(getShowInList(roleSchema));
  let [emptyUser, setEmptyUser] = useState(getEmptyObject(roleSchema));
  function getShowInListFromRoleSchema() {
    let list = [];
    let cnt = 0;
    roleSchema.forEach((e, index) => {
      let obj = {};
      if (e.type != "relationalId") {
        // do not show id of relational data.
        obj["attribute"] = e.attribute;
        if (cnt < 5) {
          obj["show"] = true;
        } else {
          obj["show"] = false;
        }
        cnt++;
        list.push(obj);
      }
    });
    return list;
  }
  function getEmptyRole() {
    let eRole = {};
    roleSchema.forEach((e, index) => {
      if (e["defaultValue"]) {
        eRole[e["attribute"]] = e["defaultValue"];
      } else {
        eRole[e["attribute"]] = "";
      }
    });
    return eRole;
  }
  function getFileListFromRoleSchema() {
    let list = [];
    roleSchema.forEach((e, index) => {
      let obj = {};
      if (e.type == "file") {
        obj["fileAttributeName"] = e.attribute;
        list.push(obj);
      }
    });
    return list;
  }
  useEffect(() => {
    getData();
  }, []);
  async function getData() {
    setFlagLoad(true);
    try {
      let response = await axios(import.meta.env.VITE_API_URL + "/roles");
      let pList = await response.data;
      setRoleList(pList);
      setFilteredRoleList(pList);
    } catch (error) {
      showMessage("Something went wrong, refresh the page");
    }
    setFlagLoad(false);
  }
  async function handleFormSubmit(role) {
    let message;
    // now remove relational data
    let roleForBackEnd = { ...role };
    for (let key in roleForBackEnd) {
      roleSchema.forEach((e, index) => {
        if (key == e.attribute && e.relationalData) {
          delete roleForBackEnd[key];
        }
      });
    }
    if (action == "add") {
      // role = await addRoleToBackend(role);
      setFlagLoad(true);
      try {
        let response = await axios.post(
          import.meta.env.VITE_API_URL + "/roles",
          roleForBackEnd,
          { headers: { "Content-type": "multipart/form-data" } }
        );
        role._id = await response.data.insertedId;
        message = "Role added successfully";
        // update the role list now.
        let prList = [...roleList];
        prList.push(role);
        setRoleList(prList);
        let fprList = [...filteredRoleList];
        fprList.push(role);
        setFilteredRoleList(fprList);
        showMessage(message);
        setAction("list");
      } catch (error) {
        showMessage("Something went wrong, refresh the page");
      }
      setFlagLoad(false);
    } else if (action == "update") {
      role._id = roleToBeEdited._id; // The form does not have id field
      // await updateBackendRole(role);
      setFlagLoad(true);
      try {
        let response = await axios.put(
          import.meta.env.VITE_API_URL + "/roles",
          role,
          {
            headers: { "Content-type": "multipart/form-data" },
          }
        );
        let r = await response.data;
        message = "Role Updated successfully";
        // update the role list now.
        let prList = roleList.map((e, index) => {
          if (e._id == role._id) return role;
          return e;
        });
        let fprList = filteredRoleList.map((e, index) => {
          if (e._id == role._id) return role;
          return e;
        });
        setRoleList(prList);
        setFilteredRoleList(fprList);
        showMessage(message);
        setAction("list");
      } catch (error) {
        showMessage("Something went wrong, refresh the page");
      }
      setFlagLoad(false);
    }
  }
  function handleFormCloseClick() {
    // props.onFormCloseClick();
    setAction("list");
  }
  function handleListClick() {
    setAction("list");
  }
  function handleAddEntityClick() {
    setAction("add");
  }
  function handleEditButtonClick(role) {
    setAction("update");
    setRoleToBeEdited(role);
  }
  function showMessage(message) {
    setMessage(message);
    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  }
  async function handleDeleteButtonClick(ans, role) {
    // await deleteBackendRole(role.id);
    setFlagLoad(true);
    try {
      let response = await axios.delete(
        import.meta.env.VITE_API_URL + "/roles/" + role._id
      );
      let r = await response.data;
      message = `Role - ${role.name} deleted successfully.`;
      //update the role list now.
      let prList = roleList.filter((e, index) => e._id != role._id);
      setRoleList(prList);
      let fprList = roleList.filter((e, index) => e._id != role._id);
      setFilteredRoleList(fprList);
      showMessage(message);
    } catch (error) {
      showMessage("Something went wrong, refresh the page");
    }
    setFlagLoad(false);
  }
  function handleListCheckBoxClick(checked, selectedIndex) {
    // Minimum 1 field should be shown
    let cnt = 0;
    showInList.forEach((e, index) => {
      if (e.show) {
        cnt++;
      }
    });
    if (cnt == 1 && !checked) {
      showMessage("Minimum 1 field should be selected.");
      return;
    }
    if (cnt == 5 && checked) {
      showMessage("Maximum 5 fields can be selected.");
      return;
    }
    let att = [...showInList];
    let a = att.map((e, index) => {
      let p = { ...e };
      if (index == selectedIndex && checked) {
        p.show = true;
      } else if (index == selectedIndex && !checked) {
        p.show = false;
      }
      return p;
    });
    // sEntity.attributes = a;
    setShowInList(a);
  }
  function handleHeaderClick(index) {
    let field = showInList[index].attribute;
    let d = false;
    if (field === sortedField) {
      // same button clicked twice
      d = !direction;
    } else {
      // different field
      d = false;
    }
    let list = [...filteredRoleList];
    setDirection(d);
    if (d == false) {
      //in ascending order
      list.sort((a, b) => {
        if (a[field] > b[field]) {
          return 1;
        }
        if (a[field] < b[field]) {
          return -1;
        }
        return 0;
      });
    } else {
      //in descending order
      list.sort((a, b) => {
        if (a[field] < b[field]) {
          return 1;
        }
        if (a[field] > b[field]) {
          return -1;
        }
        return 0;
      });
    }
    setFilteredRoleList(list);
    setSortedField(field);
  }
  function handleSrNoClick() {
    // let field = selectedEntity.attributes[index].id;
    let d = false;
    if (sortedField === "updateDate") {
      d = !direction;
    } else {
      d = false;
    }

    let list = [...filteredRoleList];
    setDirection(!direction);
    if (d == false) {
      //in ascending order
      list.sort((a, b) => {
        if (new Date(a["updateDate"]) > new Date(b["updateDate"])) {
          return 1;
        }
        if (new Date(a["updateDate"]) < new Date(b["updateDate"])) {
          return -1;
        }
        return 0;
      });
    } else {
      //in descending order
      list.sort((a, b) => {
        if (new Date(a["updateDate"]) < new Date(b["updateDate"])) {
          return 1;
        }
        if (new Date(a["updateDate"]) > new Date(b["updateDate"])) {
          return -1;
        }
        return 0;
      });
    }
    // setSelectedList(list);
    setFilteredRoleList(list);
    setSortedField("updateDate");
  }
  function handleFormTextChangeValidations(message, index) {
    props.onFormTextChangeValidations(message, index);
  }
  function handleFileUploadChange(file, index) {
    props.onFileUploadChange(file, index);
  }

  function handleSearchKeyUp(event) {
    let searchText = event.target.value;
    setSearchText(searchText);
    performSearchOperation(searchText);
  }
  function performSearchOperation(searchText) {
    let query = searchText.trim();
    if (query.length == 0) {
      setFilteredRoleList(roleList);
      return;
    }
    let searchedRoles = [];
    // searchedRoles = filterByName(query);
    searchedRoles = filterByShowInListAttributes(query);
    setFilteredRoleList(searchedRoles);
  }
  function filterByName(query) {
    let fList = [];
    // console.log(selectedEntity.attributes[0].showInList);

    for (let i = 0; i < selectedList.length; i++) {
      if (selectedList[i].name.toLowerCase().includes(query.toLowerCase())) {
        fList.push(selectedList[i]);
      }
    } //for
    return fList;
  }
  function filterByShowInListAttributes(query) {
    let fList = [];
    for (let i = 0; i < roleList.length; i++) {
      for (let j = 0; j < showInList.length; j++) {
        if (showInList[j].show) {
          let parameterName = showInList[j].attribute;
          if (
            roleList[i][parameterName] &&
            roleList[i][parameterName]
              .toLowerCase()
              .includes(query.toLowerCase())
          ) {
            fList.push(roleList[i]);
            break;
          }
        }
      } //inner for
    } //outer for
    return fList;
  }
  function handleChangeImageClick(index) {
    props.onChangeImageClick(index);
  }
  function handleChangeImageCancelClick(index) {
    props.onChangeImageCancelClick(index);
  }
  function handleFileChangeInUpdateMode(file, fileIndex) {
    let fl = [...fileList];
    fl[fileIndex]["newFileName"] = file.name;
    fl[fileIndex]["newFile"] = file;
    setFileList(fl);
  }

  if (flagLoad) {
    return (
      <div className="my-5 text-center">
        <BeatLoader size={24} color={"blue"} />
      </div>
    );
  }
  return (
    <>
      <CommonUtilityBar
        action={action}
        message={message}
        selectedEntity={selectedEntity}
        flagToggleButton={flagToggleButton}
        filteredList={filteredRoleList}
        mainList={roleList}
        showInList={showInList}
        onListClick={handleListClick}
        onAddEntityClick={handleAddEntityClick}
        onSearchKeyUp={handleSearchKeyUp}
      />
      {filteredRoleList.length == 0 && roleList.length != 0 && (
        <div className="text-center">Nothing to show</div>
      )}
      {roleList.length == 0 && action == "list" && (
        <div className="text-center">List is empty</div>
      )}
      {(action == "add" || action == "update") && (
        <div className="row">
          <AdminRoleForm
            roleSchema={roleSchema}
            roleValidations={roleValidations}
            emptyRole={emptyRole}
            selectedEntity={selectedEntity}
            roleToBeEdited={roleToBeEdited}
            action={action}
            flagFormInvalid={flagFormInvalid}
            onFormSubmit={handleFormSubmit}
            onFormCloseClick={handleFormCloseClick}
            onFormTextChangeValidations={handleFormTextChangeValidations}
            onCancelFormButton={handleFormCloseClick}
          />
        </div>
      )}
      {action == "list" && filteredRoleList.length != 0 && (
        <div className="row  my-2 mx-auto  p-1">
          {/* <div className="col-1">
            <a
              href="#"
              onClick={() => {
                handleSrNoClick();
              }}
            ></a>
          </div> */}
          {showInList.map((e, index) => (
            <div className="col-2" key={index}>
              <input
                type="checkbox"
                name=""
                id=""
                checked={showInList[index]["show"] == true}
                onChange={(e) => {
                  handleListCheckBoxClick(e.target.checked, index);
                }}
              />{" "}
              {e.attribute.charAt(0).toUpperCase() + e.attribute.slice(1)}
            </div>
          ))}
        </div>
      )}
      {action == "list" && filteredRoleList.length != 0 && (
        <div className="row   my-2 mx-auto  p-1">
          <div className="col-1">
            <a
              href="#"
              onClick={() => {
                handleSrNoClick();
              }}
            >
              SN.{" "}
              {sortedField == "updateDate" && direction && (
                <i className="bi bi-arrow-up"></i>
              )}
              {sortedField == "updateDate" && !direction && (
                <i className="bi bi-arrow-down"></i>
              )}
            </a>
          </div>
          {showInList.map(
            (e, index) =>
              e.show && (
                <div className={"col-2 "} key={index}>
                  <a
                    href="#"
                    className={
                      sortedField == e.attribute
                        ? " text-large text-danger"
                        : ""
                    }
                    onClick={() => {
                      handleHeaderClick(index);
                    }}
                  >
                    {e.attribute.charAt(0).toUpperCase() + e.attribute.slice(1)}{" "}
                    {sortedField == e.attribute && direction && (
                      <i className="bi bi-arrow-up"></i>
                    )}
                    {sortedField == e.attribute && !direction && (
                      <i className="bi bi-arrow-down"></i>
                    )}
                  </a>
                </div>
              )
          )}
          <div className="col-1">&nbsp;</div>
        </div>
      )}
      {action == "list" &&
        filteredRoleList.length != 0 &&
        filteredRoleList.map((e, index) => (
          <Entity
            entity={e}
            key={index + 1}
            index={index}
            sortedField={sortedField}
            direction={direction}
            listSize={filteredRoleList.length}
            selectedEntity={selectedEntity}
            showInList={showInList}
            onEditButtonClick={handleEditButtonClick}
            onDeleteButtonClick={handleDeleteButtonClick}
          />
        ))}
    </>
  );
}
