import { useEffect, useState } from "react";
import {
  CommonUtilityBar,
  CheckBoxHeaders,
  ListHeaders,
  Entity,
} from "../external/vite-sdk";
import AdminOwner_clientForm from "./AdminOwner_clientForm";
import { BeatLoader } from "react-spinners";
import axios from "axios";
import * as XLSX from "xlsx";
import ModalImport from "./ModalImport";
import {
  recordsAddBulk,
  recordsUpdateBulk,
  analyseImportExcelSheet,
} from "../external/vite-sdk";
import { getEmptyObject, getShowInList } from "../external/vite-sdk";

export default function AdminOwner_clients(props) {
  let [owner_clientList, setOwner_clientList] = useState([]);
  let [filteredOwner_clientList, setFilteredOwner_clientList] = useState([]);
  
  let [action, setAction] = useState("list");
  let [owner_clientToBeEdited, setOwner_clientToBeEdited] = useState("");
  let [flagLoad, setFlagLoad] = useState(false);
  let [flagImport, setFlagImport] = useState(false);
  let [message, setMessage] = useState("");
  let [searchText, setSearchText] = useState("");
  let [sortedField, setSortedField] = useState("");
  let [direction, setDirection] = useState("");
  let [sheetData, setSheetData] = useState(null);
  let [selectedFile, setSelectedFile] = useState("");
  let [recordsToBeAdded, setRecordsToBeAdded] = useState([]);
  let [recordsToBeUpdated, setRecordsToBeUpdated] = useState([]);
  let [cntUpdate, setCntUpdate] = useState(0);
  let [cntAdd, setCntAdd] = useState(0);
  let [cntShow, setCntShow] = useState(window.maxCnt); // Initially 5 attributes are shown
  let { selectedEntity } = props;
  let { flagFormInvalid } = props;
  let owner_clientSchema=[
{attribute:"name",type:"normal",},
{attribute:"email",type:"normal",},
{attribute:"whatsappno",type:"normal",},
{attribute:"startdate",type:"normal",},
{attribute:"paymentdate",type:"normal",},
{attribute:"dbname",type:"normal",},
{attribute:"link",type:"normal",},
{attribute:"status",type:"normal",},
]
  let owner_clientValidations={
name:{
    message:"",
    mxLen:20,
    mnLen:4,
    onlyDigits:false
  },email:{
    message:"",
    mxLen:30,
    mnLen:4,
    onlyDigits:false
  },whatsappno:{
    message:"",
    mxLen:10,
    mnLen:10,
    onlyDigits:true
  },startdate:{
    message:"",
    mxLen:10,
    mnLen:4,
    onlyDigits:false
  },paymentdate:{
    message:"",
    mxLen:10,
    mnLen:4,
    onlyDigits:false
  },dbname:{
    message:"",
    mxLen:30,
    mnLen:4,
    onlyDigits:false
  },link:{
    message:"",
    mxLen:50,
    mnLen:4,
    onlyDigits:false
  },status:{
    message:"",
    mxLen:10,
    mnLen:4,
    onlyDigits:false
  },}
  let [showInList, setShowInList] = useState(getShowInList(owner_clientSchema,cntShow));
  let [emptyOwner_client, setEmptyOwner_client] = useState(getEmptyObject(owner_clientSchema));
  useEffect(() => {
    getData();
  }, []);

  async function getData() {
      setFlagLoad(true);
      try {
        let response = await axios(import.meta.env.VITE_API_URL + "/owner_clients");
        let pList = await response.data;
    // Arrange products is sorted order as per updateDate
      pList = pList.sort(
        (a, b) => new Date(b.updateDate) - new Date(a.updateDate)
      );
    // update pList with relational-data
      pList.forEach((owner_client) => {
})//forEach
setOwner_clientList(pList);
      setFilteredOwner_clientList(pList);} catch (error) {
        showMessage("Oops! An error occurred. Refresh the page");
      }
      setFlagLoad(false);
    }
  
  async function handleFormSubmit(owner_client) {
    let message;
    // now remove relational data
    let owner_clientForBackEnd = { ...owner_client };
    for (let key in owner_clientForBackEnd) {
      owner_clientSchema.forEach((e, index) => {
        if (key == e.attribute && e.relationalData) {
          delete owner_clientForBackEnd[key];
        }
      });
    }
    if (action == "add") {
      // owner_client = await addOwner_clientToBackend(owner_client);
      setFlagLoad(true);
      try {
        let response = await axios.post(
          import.meta.env.VITE_API_URL + "/owner_clients",
          owner_clientForBackEnd,
          { headers: { "Content-type": "multipart/form-data" } }
        );
        let addedOwner_client = await response.data; //returned  with id
        // This addedOwner_client has id, addDate, updateDate, but the relational data is lost
        // The original owner_client has got relational data.
        for (let key in owner_client) {
          owner_clientSchema.forEach((e, index) => {
            if (key == e.attribute && e.relationalData) {
              addedOwner_client[key] = owner_client[key];
            }
          });
        }
        message = "Owner_client added successfully";
        // update the owner_client list now.
        let prList = [...owner_clientList];
        prList.push(addedOwner_client);
        prList = prList.sort(
          (a, b) => new Date(b.updateDate) - new Date(a.updateDate)
        );
        setOwner_clientList(prList);
        let fprList = [...filteredOwner_clientList];
        fprList.push(addedOwner_client);
        fprList = fprList.sort(
          (a, b) => new Date(b.updateDate) - new Date(a.updateDate)
        );
        setFilteredOwner_clientList(fprList);
        // update the list in sorted order of updateDate
        showMessage(message);
        setAction("list");
      } catch (error) {
        console.log(error);
        showMessage("Someowner_client went wrong, refresh the page");
      }
      setFlagLoad(false);
    } //...add
    else if (action == "update") {
      owner_clientForBackEnd._id = owner_clientToBeEdited._id; // The form does not have id field
      setFlagLoad(true);
      try {
        let response = await axios.put(
          import.meta.env.VITE_API_URL + "/owner_clients",
          owner_clientForBackEnd,
          { headers: { "Content-type": "multipart/form-data" } }
        );
        // update the owner_client list now, relational data is not deleted
        message = "Owner_client Updated successfully";
        // update the owner_client list now.
        let prList = owner_clientList.map((e, index) => {
          if (e._id == owner_client._id) return owner_client;
          return e;
        });
        prList = prList.sort(
          (a, b) => new Date(b.updateDate) - new Date(a.updateDate)
        );
        let fprList = filteredOwner_clientList.map((e, index) => {
          if (e._id == owner_client._id) return owner_client;
          return e;
        });
        fprList = fprList.sort(
          (a, b) => new Date(b.updateDate) - new Date(a.updateDate)
        );
        setOwner_clientList(prList);
        setFilteredOwner_clientList(fprList);
        showMessage(message);
        setAction("list");
      } catch (error) {
        showMessage("Someowner_client went wrong, refresh the page");
      }
    } //else ...(update)
    setFlagLoad(false);
  }
  function handleFormCloseClick() {
    props.onFormCloseClick();
  }
  function handleListClick() {
    setAction("list");
  }
  function handleAddEntityClick() {
    setAction("add");
  }
  function handleEditButtonClick(owner_client) {
    setAction("update");
    setOwner_clientToBeEdited(owner_client);
  }
  function showMessage(message) {
    setMessage(message);
    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  }
  function handleDeleteButtonClick(ans, owner_client) {
    if (ans == "No") {
      // delete operation cancelled
      showMessage("Delete operation cancelled");
      return;
    }
    if (ans == "Yes") {
      // delete operation allowed
      performDeleteOperation(owner_client);
    }
  }
  async function performDeleteOperation(owner_client) {
    setFlagLoad(true);
    try {
      let response = await axios.delete(
        import.meta.env.VITE_API_URL + "/owner_clients/" + owner_client._id
      );
      let r = await response.data;
      message = `Owner_client - ${owner_client.name} deleted successfully.`;
      //update the owner_client list now.
      let prList = owner_clientList.filter((e, index) => e._id != owner_client._id);
      setOwner_clientList(prList);

      let fprList = owner_clientList.filter((e, index) => e._id != owner_client._id);
      setFilteredOwner_clientList(fprList);
      showMessage(message);
    } catch (error) {
      console.log(error);
      showMessage("Someowner_client went wrong, refresh the page");
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
    if (cnt == window.maxCnt && checked) {
      showMessage("Maximum " + window.maxCnt + " fields can be selected.");
      return;
    }
    let att = [...showInList];
    let a = att.map((e, index) => {
      let p = { ...e };
      if (index == selectedIndex && checked) {
        p.show = true;
        setCntShow(cnt + 1);
      } else if (index == selectedIndex && !checked) {
        p.show = false;
        setCntShow(cnt - 1);
      }
      return p;
    });
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
    let list = [...filteredOwner_clientList];
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
    setFilteredOwner_clientList(list);
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
    let list = [...filteredOwner_clientList];
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
    setFilteredOwner_clientList(list);
    setSortedField("updateDate");
  }
  function handleFormTextChangeValidations(message, index) {
    props.onFormTextChangeValidations(message, index);
  }
  function handleSearchKeyUp(event) {
    let searchText = event.target.value;
    setSearchText(searchText);
    performSearchOperation(searchText);
  }
  function performSearchOperation(searchText) {
    let query = searchText.trim();
    if (query.length == 0) {
      setFilteredOwner_clientList(owner_clientList);
      return;
    }
    let searchedOwner_clients = [];
    searchedOwner_clients = filterByShowInListAttributes(query);
    setFilteredOwner_clientList(searchedOwner_clients);
  }
  function filterByName(query) {
    let fList = [];
    for (let i = 0; i < selectedList.length; i++) {
      if (selectedList[i].name.toLowerCase().includes(query.toLowerCase())) {
        fList.push(selectedList[i]);
      }
    } //for
    return fList;
  }
  function filterByShowInListAttributes(query) {
    let fList = [];
    for (let i = 0; i < owner_clientList.length; i++) {
      for (let j = 0; j < showInList.length; j++) {
        if (showInList[j].show) {
          let parameterName = showInList[j].attribute;
          if (
            owner_clientList[i][parameterName] &&
            owner_clientList[i][parameterName]
              .toLowerCase()
              .includes(query.toLowerCase())
          ) {
            fList.push(owner_clientList[i]);
            break;
          }
        }
      } //inner for
    } //outer for
    return fList;
  }
  function handleToggleText(index) {
    let sil = [...showInList];
    sil[index].flagReadMore = !sil[index].flagReadMore;
    setShowInList(sil);
  }
  function handleExcelFileUploadClick(file, msg) {
    if (msg) {
      showMessage(message);
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      // Read the workbook from the array buffer
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      // Assume reading the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      // const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      setSheetData(jsonData);
      let result = analyseImportExcelSheet(jsonData, owner_clientList);
      if (result.message) {
        showMessage(result.message);
      } else {
        showImportAnalysis(result);
      }
      // analyseSheetData(jsonData, owner_clientList);
    };
    // reader.readAsBinaryString(file);
    reader.readAsArrayBuffer(file);
  }
  function showImportAnalysis(result) {
    setCntAdd(result.cntA);
    setCntUpdate(result.cntU);
    setRecordsToBeAdded(result.recordsToBeAdded);
    setRecordsToBeUpdated(result.recordsToBeUpdated);
    //open modal
    setFlagImport(true);
  }
  function handleModalCloseClick() {
    setFlagImport(false);
  }
  async function handleImportButtonClick() {
    setFlagImport(false); // close the modal
    setFlagLoad(true);
    let result;
    try {
      if (recordsToBeAdded.length > 0) {
        result = await recordsAddBulk(
          recordsToBeAdded,
          "owner_clients",
          owner_clientList,
          import.meta.env.VITE_API_URL
        );
        if (result.success) {
          setOwner_clientList(result.updatedList);
          setFilteredOwner_clientList(result.updatedList);
        }
        showMessage(result.message);
      }
      if (recordsToBeUpdated.length > 0) {
        result = await recordsUpdateBulk(
          recordsToBeUpdated,
          "owner_clients",
          owner_clientList,
          import.meta.env.VITE_API_URL
        );
        if (result.success) {
          setOwner_clientList(result.updatedList);
          setFilteredOwner_clientList(result.updatedList);
        }
        showMessage(result.message);
      } //if
    } catch (error) {
      console.log(error);
      showMessage("Someowner_client went wrong, refresh the page");
    }
    setFlagLoad(false);
  }
  function handleClearSelectedFile() {
    setSelectedFile(null);
  }
  if (flagLoad) {
    return (
      <div className="my-5 text-center">
        <BeatLoader size={24} color={"blue"} />
      </div>
    );
  }
  return (
    <div className="container">
      <CommonUtilityBar
        action={action}
        message={message}
        selectedEntity={selectedEntity}
        filteredList={filteredOwner_clientList}
        mainList={owner_clientList}
        showInList={showInList}
        onListClick={handleListClick}
        onAddEntityClick={handleAddEntityClick}
        onSearchKeyUp={handleSearchKeyUp}
        onExcelFileUploadClick={handleExcelFileUploadClick}
        onClearSelectedFile={handleClearSelectedFile}
      />
      {filteredOwner_clientList.length == 0 && owner_clientList.length != 0 && (
        <div className="text-center">Noowner_client to show</div>
      )}
      {owner_clientList.length == 0 && (
        <div className="text-center">List is empty</div>
      )}
      {action == "list" && filteredOwner_clientList.length != 0 && (
        <CheckBoxHeaders
          showInList={showInList}
          cntShow={cntShow}
          onListCheckBoxClick={handleListCheckBoxClick}
        />
      )}
      {action == "list" && filteredOwner_clientList.length != 0 && (
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
          <ListHeaders
            showInList={showInList}
            sortedField={sortedField}
            direction={direction}
            cntShow={cntShow}
            onHeaderClick={handleHeaderClick}
          />
          <div className="col-1">&nbsp;</div>
        </div>
      )}
      {(action == "add" || action == "update") && (
        <div className="row">
          <AdminOwner_clientForm
            owner_clientSchema={owner_clientSchema}
            owner_clientValidations={owner_clientValidations}
            emptyOwner_client={emptyOwner_client}
            
            selectedEntity={selectedEntity}
            owner_clientToBeEdited={owner_clientToBeEdited}
            action={action}
            flagFormInvalid={flagFormInvalid}
            onFormSubmit={handleFormSubmit}
            onFormCloseClick={handleFormCloseClick}
            onFormTextChangeValidations={handleFormTextChangeValidations}
          />
        </div>
      )}
      {action == "list" &&
        filteredOwner_clientList.length != 0 &&
        filteredOwner_clientList.map((e, index) => (
          <Entity
            entity={e}
            key={index + 1}
            index={index}
            sortedField={sortedField}
            direction={direction}
            listSize={filteredOwner_clientList.length}
            selectedEntity={selectedEntity}
            showInList={showInList}
            cntShow={cntShow}
            VITE_API_URL={import.meta.env.VITE_API_URL}
            onEditButtonClick={handleEditButtonClick}
            onDeleteButtonClick={handleDeleteButtonClick}
            onToggleText={handleToggleText}
          />
        ))}
      {flagImport && (
        <ModalImport
          modalText={"Summary of Bulk Import"}
          additions={recordsToBeAdded}
          updations={recordsToBeUpdated}
          btnGroup={["Yes", "No"]}
          onModalCloseClick={handleModalCloseClick}
          onModalButtonCancelClick={handleModalCloseClick}
          onImportButtonClick={handleImportButtonClick}
        />
      )}
    </div>
  );
}
