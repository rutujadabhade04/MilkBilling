import { useEffect, useState } from "react";
import {
  CommonUtilityBar,
  CheckBoxHeaders,
  ListHeaders,
  Entity,
} from "../external/vite-sdk";
import { BeatLoader } from "react-spinners";
import axios from "axios";
import * as XLSX from "xlsx";
import ModalImport from "./ModalImport";
import ChangeQtyModal from "./ChangeQtyModal";
import {
  recordsAddBulk,
  recordsUpdateBulk,
  analyseImportExcelSheet,
  getEmptyObject,
  getShowInList,
} from "../external/vite-sdk";
import AdminDailyEntryForm from "./AdminDailyEntryForm";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
export default function AdminDailyEntry(props) {
  const [anotherDate, setAnotherDate] = useState("");
  let [showChangeModal, setShowChangeModal] = useState(false);
  let [modalUser, setModalUser] = useState(null);
  let [modalQty, setModalQty] = useState("");
  let [selectedIds, setSelectedIds] = useState([]);
  let [currentDayEntryList, setCurrentDayEntryList] = useState([]);
  let [filteredCurrentDayEntryList, setFilteredCurrentDayEntryList] = useState(
    []
  );
  let [action, setAction] = useState("list");
  let [userToBeEdited, setUserToBeEdited] = useState("");
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
  let { flagToggleButton } = props;

  const [selectedDateOption, setSelectedDateOption] = useState("Today");
  const [allUsersFromDatabase, setAllUsersFromDatabase] = useState([]);
  const [globalLatestEntryDate, setGlobalLatestEntryDate] = useState(null);
  const [totalUsersWithRoleId, setTotalUsersWithRoleId] = useState(0);

  const [validationMessage, setValidationMessage] = useState("");
  const [validationMessageDate, setValidationMessageDate] = useState(null);
  const [datePickerIsOpen, setDatePickerIsOpen] = useState(false);

  function resolveSelectedDate(option, customDate = "") {
    const today = new Date();
    if (option === "Today") return today.toISOString().split("T")[0];
    if (option === "Yesterday") {
      const yest = new Date(today);
      yest.setDate(yest.getDate() - 1);
      return yest.toISOString().split("T")[0];
    }
    if (option === "Another Day" && customDate) return customDate;
    return today.toISOString().split("T")[0];
  }

  function getYearMonthFromDate(dateString) {
    if (!dateString) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1);
      return { year: year, month: parseInt(month, 10) };
    }
    const [year, month] = dateString.split("-");
    return { year: parseInt(year, 10), month: parseInt(month, 10) };
  }
  let entrySchema = [
    { attribute: "name", type: "normal" },
    { attribute: "delivered_qty", type: "normal" },
    { attribute: "daily_qty", type: "normal" },
    {
      attribute: "entry_status",
      type: "normal",
      show: true,
    },
  ];
  let entryValidations = {
    name: { message: "", mxLen: 200, mnLen: 4, onlyDigits: false },
    daily_qty: { message: "", onlyDigits: true },
    delivered_qty: { message: "", onlyDigits: true },
    entry_status: { message: "" },
  };

  let [showInList, setShowInList] = useState(
    getShowInList(entrySchema, cntShow)
  );
  let [emptyEntry, setEmptyEntry] = useState(getEmptyObject(entrySchema));

  async function fetchLatestEntryDate() {
    try {
      const latestEntryRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/entries/latest-date`
      );
      const latestDate = latestEntryRes.data.last_entry_date;
      setGlobalLatestEntryDate(latestDate ? new Date(latestDate) : null);
    } catch (error) {
      console.error("Failed to fetch latest entry date:", error);
      setGlobalLatestEntryDate(null);
    }
  }

  useEffect(() => {
    async function fetchInitialData() {
      setFlagLoad(true);
      try {
        const userRes = await axios(
          import.meta.env.VITE_API_URL + "/customers"
        );
        setAllUsersFromDatabase(userRes.data);
        const countUsers = userRes.data;
        setTotalUsersWithRoleId(countUsers);
        await fetchLatestEntryDate();
        await fetchEntriesForDisplay(
          selectedDateOption,
          anotherDate,
          userRes.data
        );
      } catch (error) {
        showMessage("Something went wrong while fetching initial data.");
        setFlagLoad(false);
      }
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    async function checkValidationStatus() {
      if (globalLatestEntryDate && totalUsersWithRoleId > 0) {
        const latestDateISO = globalLatestEntryDate.toISOString().split("T")[0];
        const { year, month } = getYearMonthFromDate(latestDateISO);
        const day = parseInt(latestDateISO.split("-")[2], 10);

        let entriesForLatestDate = [];
        try {
          const entryRes = await axios(
            `${import.meta.env.VITE_API_URL}/entries/${year}/${month}/${day}`
          );
          entriesForLatestDate = entryRes.data;
        } catch (error) {
          entriesForLatestDate = [];
        }

        const countValidDeliveredQtyForLatestDate = entriesForLatestDate.filter(
          (entry) => {
            const deliveredQty = entry.delivered_qty;
            return (
              deliveredQty !== "" &&
              !isNaN(Number(deliveredQty)) &&
              Number(deliveredQty) >= 0
            );
          }
        ).length;

        const isDayCompletelyFilled =
          countValidDeliveredQtyForLatestDate === totalUsersWithRoleId;
        if (!isDayCompletelyFilled) {
          const msg = `Please enter the data of ${globalLatestEntryDate.toLocaleDateString()} date.`;
          setValidationMessage(msg);
          setValidationMessageDate(globalLatestEntryDate);
        } else {
          const nextDay = new Date(globalLatestEntryDate);
          nextDay.setDate(nextDay.getDate() + 1);
          const msg = `Please enter the data of ${nextDay.toLocaleDateString()} date.`;
          setValidationMessage(msg);
          setValidationMessageDate(nextDay);
        }
      } else if (totalUsersWithRoleId > 0) {
        const today = new Date();
        setValidationMessage(
          `No entries found. Please enter data for today (${today.toLocaleDateString()}).`
        );
        setValidationMessageDate(today);
      } else {
        setValidationMessage(
          "No entries or users found in the database. Please add users and entries."
        );
        setValidationMessage("");
        setValidationMessageDate(null);
      }
    }

    checkValidationStatus();
  }, [globalLatestEntryDate, totalUsersWithRoleId]);

  async function fetchEntriesForDisplay(
    option = selectedDateOption,
    customDate = anotherDate,
    users = allUsersFromDatabase
  ) {
    setFlagLoad(true);
    const dateToDisplay = resolveSelectedDate(option, customDate);
    const { year, month } = getYearMonthFromDate(dateToDisplay);
    const day = parseInt(dateToDisplay.split("-")[2], 10);

    let entriesForCurrentDay = [];
    try {
      const entryRes = await axios(
        `${import.meta.env.VITE_API_URL}/entries/${year}/${month}/${day}`
      );
      entriesForCurrentDay = entryRes.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        showMessage(`No entries found for ${dateToDisplay}.`);
      } else {
        showMessage("Something went wrong while fetching entries.");
      }
      entriesForCurrentDay = [];
    } finally {
      const userList = users;
      const mergedListForCurrentDay = userList.map((user) => {
        const entryForSelectedDate = entriesForCurrentDay.find((entry) => {
          const entryDateFormatted =
            entry.date instanceof Date
              ? entry.date.toISOString().split("T")[0]
              : typeof entry.date === "string" && entry.date.includes("T")
              ? entry.date.split("T")[0]
              : entry.date;
          return (
            entry.userId === user._id && entryDateFormatted === dateToDisplay
          );
        });
        return {
          _id: user._id,
          userId: user._id,
          name: user.name,
          daily_qty: user.daily_qty,
          delivered_qty: entryForSelectedDate?.delivered_qty ?? "",
          entry_status: entryForSelectedDate?.entry_status || "",
          date: entryForSelectedDate?.date || dateToDisplay,
          updateDate: entryForSelectedDate?.updateDate || "",
          entryId: entryForSelectedDate?._id || null,
        };
      });

      mergedListForCurrentDay.sort(
        (a, b) => new Date(b.updateDate || 0) - new Date(a.updateDate || 0)
      );

      setCurrentDayEntryList(mergedListForCurrentDay);
      setFilteredCurrentDayEntryList(mergedListForCurrentDay);
      setFlagLoad(false);
    }
  }

  function fetchDataForSelectedDate(
    option = selectedDateOption,
    customDate = anotherDate
  ) {
    setSelectedIds([]);
    fetchEntriesForDisplay(option, customDate, allUsersFromDatabase);
  }

  async function handleFormSubmit(entry) {
    let message;
    let entryForBackEnd = { ...entry };
    for (let key in entryForBackEnd) {
      entrySchema.forEach((e) => {
        if (key == e.attribute && e.relationalData) {
          delete entryForBackEnd[key];
        }
      });
    }

    delete entryForBackEnd.name;
    delete entryForBackEnd.daily_qty;

    if (entryForBackEnd.date instanceof Date) {
      entryForBackEnd.date = entryForBackEnd.date.toISOString().split("T")[0];
    } else if (
      typeof entryForBackEnd.date === "string" &&
      entryForBackEnd.date.includes("T")
    ) {
      entryForBackEnd.date = entryForBackEnd.date.split("T")[0];
    }

    const { year, month } = getYearMonthFromDate(entryForBackEnd.date);

    if (action === "add") {
      setFlagLoad(true);
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/entries/${year}/${month}`,
          entryForBackEnd,
          { headers: { "Content-type": "application/json" } }
        );

        await fetchLatestEntryDate();
        await fetchEntriesForDisplay(
          selectedDateOption,
          anotherDate,
          allUsersFromDatabase
        );

        message = "Entry added successfully";
        showMessage(message);
        setAction("list");
      } catch (error) {
        showMessage("Something went wrong, refresh the page");
      }
      setFlagLoad(false);
    } else if (action === "update") {
      const entryToUpdateId = userToBeEdited.entryId;

      if (!entryToUpdateId) {
        showMessage(
          "Error: Cannot update. Entry ID not found for this record."
        );
        setFlagLoad(false);
        return;
      }

      setFlagLoad(true);
      try {
        await axios.put(
          `${
            import.meta.env.VITE_API_URL
          }/entries/${year}/${month}/${entryToUpdateId}`,
          entryForBackEnd,
          { headers: { "Content-type": "application/json" } }
        );

        await fetchLatestEntryDate();
        await fetchEntriesForDisplay(
          selectedDateOption,
          anotherDate,
          allUsersFromDatabase
        );

        message = "Entry Updated successfully";
        showMessage(message);
        setAction("list");
      } catch (error) {
        showMessage("Something went wrong during update, please try again.");
      }
      setFlagLoad(false);
    }
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
  function handleEditButtonClick(entry) {
    let safeEntry = {
      ...emptyEntry,
      ...entry,
      info: entry.info || "",
    };
    setAction("update");
    setUserToBeEdited(safeEntry);
  }
  function showMessage(message) {
    setMessage(message);
    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  async function handleModalQtySubmit() {
    if (!modalUser || modalQty === "") {
      showMessage("Please enter a valid quantity.");
      return;
    }

    const entry = modalUser;

    const entryDate = new Date(
      entry.date || resolveSelectedDate(selectedDateOption, anotherDate)
    );
    const entryYear = entryDate.getFullYear();
    const entryMonth = entryDate.getMonth() + 1;

    const entryData = {
      userId: entry.userId,
      delivered_qty: modalQty,
      entry_status: "Change",
      date: entry.date || resolveSelectedDate(selectedDateOption, anotherDate),
    };

    const url = `${
      import.meta.env.VITE_API_URL
    }/entries/${entryYear}/${entryMonth}`;
    const method = axios.post;

    try {
      await method(url, entryData, {
        headers: { "Content-type": "application/json" },
      });

      await fetchLatestEntryDate();
      await fetchEntriesForDisplay(
        selectedDateOption,
        anotherDate,
        allUsersFromDatabase
      );
      showMessage("Entry updated to 'Change'");
      setSelectedIds([]);
      setShowChangeModal(false);
    } catch (error) {
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      showMessage("Failed to update entry");
      setShowChangeModal(false);
    }
  }

  function handleDeleteButtonClick(ans, entry) {
    if (ans == "No") {
      showMessage("Delete operation cancelled");
      return;
    }
    if (ans == "Yes") {
      performDeleteOperation(entry);
    }
  }

  async function handleDeliverButtonClick() {
    setFlagLoad(true);

    const currentSelectedDate = resolveSelectedDate(
      selectedDateOption,
      anotherDate
    );
    const { year: currentYear, month: currentMonth } =
      getYearMonthFromDate(currentSelectedDate);

    for (const id of selectedIds) {
      const entry = currentDayEntryList.find((e) => e._id === id);

      const entryDate = new Date(entry.date || currentSelectedDate);
      const entryYear = entryDate.getFullYear();
      const entryMonth = entryDate.getMonth() + 1;

      const entryData = {
        userId: entry.userId,
        delivered_qty: entry.daily_qty,
        entry_status: "Delivered",
        date: entry.date || currentSelectedDate,
      };

      const url = `${
        import.meta.env.VITE_API_URL
      }/entries/${entryYear}/${entryMonth}`;

      try {
        await axios.post(url, entryData, {
          headers: { "Content-type": "application/json" },
        });
      } catch (err) {
        showMessage("Failed to mark as Delivered for " + entry.name);
      }
    }

    await fetchLatestEntryDate();
    await fetchEntriesForDisplay(
      selectedDateOption,
      anotherDate,
      allUsersFromDatabase
    );

    showMessage("Marked selected entries as Delivered");
    setSelectedIds([]);
    setFlagLoad(false);
  }

  async function handleKhadaButtonClick() {
    setFlagLoad(true);
    const currentSelectedDate = resolveSelectedDate(
      selectedDateOption,
      anotherDate
    );
    const { year: currentYear, month: currentMonth } =
      getYearMonthFromDate(currentSelectedDate);

    for (const id of selectedIds) {
      const userEntry = currentDayEntryList.find((e) => e._id === id);

      const entryDate = new Date(userEntry.date || currentSelectedDate);
      const entryYear = entryDate.getFullYear();
      const entryMonth = entryDate.getMonth() + 1;

      const entryData = {
        userId: userEntry.userId,
        delivered_qty: 0,
        entry_status: "Khada",
        date: userEntry.date || currentSelectedDate,
      };

      const url = `${
        import.meta.env.VITE_API_URL
      }/entries/${entryYear}/${entryMonth}`;

      try {
        await axios.post(url, entryData, {
          headers: { "Content-type": "application/json" },
        });
      } catch (error) {
        showMessage(`Failed to mark Khada for ${userEntry.name}`);
      }
    }

    await fetchLatestEntryDate();
    await fetchEntriesForDisplay(
      selectedDateOption,
      anotherDate,
      allUsersFromDatabase
    );
    showMessage("Marked selected entries as Khada");
    setSelectedIds([]);
    setFlagLoad(false);
  }

  function handleChangeButtonClick() {
    if (selectedIds.length !== 1) {
      showMessage("Select exactly one user to change delivered quantity.");
      return;
    }
    const user = currentDayEntryList.find((u) => u._id === selectedIds[0]);
    setModalUser(user);
    setModalQty(user.delivered_qty || "");
    setShowChangeModal(true);
  }

  async function performDeleteOperation(entry) {
    setFlagLoad(true);
    try {
      const entryDate = new Date(entry.date || entry.updateDate);
      const entryYear = entryDate.getFullYear();
      const entryMonth = entryDate.getMonth() + 1;

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/entries/${entryYear}/${entryMonth}/${
          entry.entryId
        }`
      );

      await fetchLatestEntryDate();
      await fetchEntriesForDisplay(
        selectedDateOption,
        anotherDate,
        allUsersFromDatabase
      );
      showMessage(`Entry - ${entry.name} deleted successfully.`);
    } catch (error) {
      showMessage("Something went wrong, refresh the page");
    }
    setFlagLoad(false);
  }

  function handleListCheckBoxClick(checked, selectedIndex) {
    let cnt = 0;
    showInList.forEach((e) => {
      if (e.show) {
        cnt++;
      }
    });
    if (cnt === 1 && !checked) {
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
      if (index === selectedIndex && checked) {
        p.show = true;
        setCntShow(cnt + 1);
      } else if (index === selectedIndex && !checked) {
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
      d = !direction;
    } else {
      d = false;
    }
    let list = [...filteredCurrentDayEntryList];
    setDirection(d);
    if (d === false) {
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
    setFilteredCurrentDayEntryList(list);
    setSortedField(field);
  }
  function handleSrNoClick() {
    let d = false;
    if (sortedField === "updateDate") {
      d = !direction;
    } else {
      d = false;
    }

    let list = [...filteredCurrentDayEntryList];
    setDirection(!direction);
    if (d === false) {
      list.sort((a, b) => {
        if (new Date(a.updateDate || 0) > new Date(b.updateDate || 0)) {
          return 1;
        }
        if (new Date(a.updateDate || 0) < new Date(b.updateDate || 0)) {
          return -1;
        }
        return 0;
      });
    } else {
      list.sort((a, b) => {
        if (new Date(a.updateDate || 0) < new Date(b.updateDate || 0)) {
          return 1;
        }
        if (new Date(a.updateDate || 0) > new Date(b.updateDate || 0)) {
          return -1;
        }
        return 0;
      });
    }
    setFilteredCurrentDayEntryList(list);
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
    if (query.length === 0) {
      setFilteredCurrentDayEntryList(currentDayEntryList);
      return;
    }
    let searchedEntrys = [];
    searchedEntrys = filterByShowInListAttributes(query);
    setFilteredCurrentDayEntryList(searchedEntrys);
  }
  function filterByName(query) {
    let fList = [];
    for (let i = 0; i < currentDayEntryList.length; i++) {
      if (
        currentDayEntryList[i].name.toLowerCase().includes(query.toLowerCase())
      ) {
        fList.push(currentDayEntryList[i]);
      }
    }
    return fList;
  }
  function filterByShowInListAttributes(query) {
    let fList = [];
    for (let i = 0; i < currentDayEntryList.length; i++) {
      for (let j = 0; j < showInList.length; j++) {
        if (showInList[j].show) {
          let parameterName = showInList[j].attribute;
          if (
            currentDayEntryList[i][parameterName] &&
            currentDayEntryList[i][parameterName]
              .toLowerCase()
              .includes(query.toLowerCase())
          ) {
            fList.push(currentDayEntryList[i]);
            break;
          }
        }
      }
    }
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
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setSheetData(jsonData);
      let result = analyseImportExcelSheet(jsonData, allUsersFromDatabase);
      if (result.message) {
        showMessage(result.message);
      } else {
        showImportAnalysis(result);
      }
    };
    reader.readAsArrayBuffer(file);
  }
  function showImportAnalysis(result) {
    setCntAdd(result.cntA);
    setCntUpdate(result.cntU);
    setRecordsToBeAdded(result.recordsToBeAdded);
    setRecordsToBeUpdated(result.recordsToBeUpdated);
    setFlagImport(true);
  }
  function handleModalCloseClick() {
    setFlagImport(false);
  }
  async function handleImportButtonClick() {
    setFlagImport(false);
    setFlagLoad(true);
    let result;
    try {
      if (recordsToBeAdded.length > 0) {
        result = await recordsAddBulk(
          recordsToBeAdded,
          "users",
          allUsersFromDatabase,
          import.meta.env.VITE_API_URL
        );
        if (result.success) {
          setAllUsersFromDatabase(result.updatedList);

          fetchEntriesForDisplay(
            selectedDateOption,
            anotherDate,
            result.updatedList
          );
        }
        showMessage(result.message);
      }
      if (recordsToBeUpdated.length > 0) {
        result = await recordsUpdateBulk(
          recordsToBeUpdated,
          "users",
          allUsersFromDatabase,
          import.meta.env.VITE_API_URL
        );
        if (result.success) {
          setAllUsersFromDatabase(result.updatedList);

          fetchEntriesForDisplay(
            selectedDateOption,
            anotherDate,
            result.updatedList
          );
        }
        showMessage(result.message);
      }
      await fetchLatestEntryDate();
    } catch (error) {
      showMessage("Something went wrong during import, refresh the page");
    }
    setFlagLoad(false);
  }
  function handleClearSelectedFile() {
    setSelectedFile(null);
  }
  if (flagLoad) {
    return (
      <div className="my-3 text-center">
        <BeatLoader size={24} color={"blue"} />
      </div>
    );
  }

  const currentlyDisplayedDate = new Date(
    resolveSelectedDate(selectedDateOption, anotherDate)
  );
  currentlyDisplayedDate.setHours(0, 0, 0, 0);

  const globalLatestEntryDateOnly = globalLatestEntryDate
    ? new Date(globalLatestEntryDate)
    : null;
  if (globalLatestEntryDateOnly) {
    globalLatestEntryDateOnly.setHours(0, 0, 0, 0);
  }

  let disableActions = false;

  if (validationMessageDate) {
    const requiredValidationDate = new Date(validationMessageDate);
    requiredValidationDate.setHours(0, 0, 0, 0);

    if (currentlyDisplayedDate.getTime() > requiredValidationDate.getTime()) {
      disableActions = true;
    }
  }

  const handlePreviousDate = () => {
    const currentDate = new Date(
      resolveSelectedDate(selectedDateOption, anotherDate)
    );
    currentDate.setDate(currentDate.getDate() - 1);
    const newDateISO = currentDate.toISOString().split("T")[0];
    setSelectedDateOption("Another Day");
    setAnotherDate(newDateISO);
    fetchDataForSelectedDate("Another Day", newDateISO);
    setDatePickerIsOpen(false);
  };

  const handleNextDate = () => {
    const currentDate = new Date(
      resolveSelectedDate(selectedDateOption, anotherDate)
    );
    currentDate.setDate(currentDate.getDate() + 1);
    const newDateISO = currentDate.toISOString().split("T")[0];

    setSelectedDateOption("Another Day");
    setAnotherDate(newDateISO);
    fetchDataForSelectedDate("Another Day", newDateISO);
    setDatePickerIsOpen(false);
  };
  const todayAtMidnight = new Date();
  todayAtMidnight.setHours(0, 0, 0, 0);
  const isNextButtonDisabled =
    currentlyDisplayedDate.getTime() >= todayAtMidnight.getTime();

  return (
    <>
      <CommonUtilityBar
        action={action}
        message={message}
        selectedEntity={selectedEntity}
        flagToggleButton={flagToggleButton}
        filteredList={filteredCurrentDayEntryList}
        mainList={currentDayEntryList}
        showInList={showInList}
        onListClick={handleListClick}
        onAddEntityClick={handleAddEntityClick}
        onSearchKeyUp={handleSearchKeyUp}
        onExcelFileUploadClick={handleExcelFileUploadClick}
        onClearSelectedFile={handleClearSelectedFile}
      />

      {currentDayEntryList.length === 0 && allUsersFromDatabase.length > 0 && (
        <div className="text-center">No entries recorded for this date.</div>
      )}
      {allUsersFromDatabase.length === 0 && (
        <div className="text-center">
          No users found in the database. Please add users.
        </div>
      )}

      {action === "list" && (
        <div className="text-center my-1">
          <label className="fw-bold me-1">Select Date:</label>

          <div className="btn-group" role="group">
            <button
              type="button"
              className={` btn ${
                selectedDateOption === "Today"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => {
                setSelectedDateOption("Today");
                setAnotherDate("");
                fetchDataForSelectedDate("Today");
                setDatePickerIsOpen(false);
              }}
            >
              Today
            </button>
            <button
              type="button"
              className={`btn ${
                selectedDateOption === "Yesterday"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => {
                setSelectedDateOption("Yesterday");
                setAnotherDate("");
                fetchDataForSelectedDate("Yesterday");
                setDatePickerIsOpen(false);
              }}
            >
              Yesterday
            </button>
            <button
              type="button"
              className={`btn ${
                selectedDateOption === "Another Day"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => {
                setSelectedDateOption("Another Day");
                setDatePickerIsOpen(true);
              }}
            >
              Another Day
            </button>
            {selectedDateOption === "Another Day" && (
              <DatePicker
                selected={anotherDate ? new Date(anotherDate) : null}
                onChange={(date) => {
                  const newDateISO = date
                    ? date.toISOString().split("T")[0]
                    : "";
                  setAnotherDate(newDateISO);
                  setSelectedIds([]);
                  fetchDataForSelectedDate("Another Day", newDateISO);
                  setDatePickerIsOpen(false);
                }}
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
                className="form-control d-inline-block"
                wrapperClassName="d-inline-block ms-1"
                disabled={
                  validationMessageDate &&
                  (anotherDate
                    ? new Date(anotherDate).setHours(0, 0, 0, 0) >
                      validationMessageDate.setHours(0, 0, 0, 0)
                    : false)
                }
                open={datePickerIsOpen}
                onInputClick={() => setDatePickerIsOpen(true)}
                onCalendarClose={() => setDatePickerIsOpen(false)}
              />
            )}
          </div>
        </div>
      )}

      <div className="text-center my-1 justify-content-between align-items-center ">
        <button className="me-2" onClick={handlePreviousDate}>
          <i className="bi bi-arrow-left fs-4 text-primary"></i>
        </button>
        <button onClick={handleNextDate} disabled={isNextButtonDisabled}>
          <i className="bi bi-arrow-right fs-4 text-primary"></i>
        </button>
      </div>

      {action === "list" && (
        <div className="text-center my-1">
          <div className="text-center my-1">
            <button
              className="btn btn-success mx-1"
              onClick={handleDeliverButtonClick}
              disabled={selectedIds.length === 0 || disableActions}
            >
              Delivered
            </button>

            <button
              className="btn btn-warning mx-1"
              onClick={handleKhadaButtonClick}
              disabled={selectedIds.length === 0 || disableActions}
            >
              Khada
            </button>

            <button
              className="btn btn-secondary mx-1"
              onClick={handleChangeButtonClick}
              disabled={selectedIds.length !== 1 || disableActions}
            >
              Change
            </button>
          </div>

          {globalLatestEntryDate !== null ? (
            <div className="text-sm text-red-600 font-semibold mt-1">
              Last entry date for this view:{" "}
              {globalLatestEntryDate.toLocaleDateString()}
            </div>
          ) : (
            <div className="text-sm text-gray-500 mt-1">
              No entries with a date found for this view.
            </div>
          )}

          {validationMessage && (
            <div className="text-sm text-danger font-semibold mt-1">
              {validationMessage}
            </div>
          )}
        </div>
      )}

      {action === "list" && currentDayEntryList.length !== 0 && (
        <CheckBoxHeaders
          showInList={showInList}
          cntShow={cntShow}
          onListCheckBoxClick={handleListCheckBoxClick}
        />
      )}

      {action === "list" && currentDayEntryList.length !== 0 && (
        <div className="row my-1 mx-auto">
          <div className="col-1">
            <input
              type="checkbox"
              checked={
                selectedIds.length > 0 &&
                selectedIds.length === filteredCurrentDayEntryList.length
              }
              onChange={(ev) => {
                if (ev.target.checked) {
                  setSelectedIds(
                    filteredCurrentDayEntryList.map((entry) => entry._id)
                  );
                } else {
                  setSelectedIds([]);
                }
              }}
              disabled={disableActions}
            />
          </div>
          <div className="col-1">
            <a
              href="#"
              onClick={() => {
                handleSrNoClick();
              }}
            >
              SN.{" "}
              {sortedField === "updateDate" && direction && (
                <i className="bi bi-arrow-up"></i>
              )}
              {sortedField === "updateDate" && !direction && (
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
      {(action === "add" || action === "update") && (
        <div className="row">
          <AdminDailyEntryForm
            entrySchema={entrySchema}
            entryValidations={entryValidations}
            emptyEntry={emptyEntry}
            selectedEntity={selectedEntity}
            userToBeEdited={userToBeEdited}
            action={action}
            flagFormInvalid={flagFormInvalid}
            onFormSubmit={handleFormSubmit}
            onFormCloseClick={handleFormCloseClick}
            onFormTextChangeValidations={handleFormTextChangeValidations}
          />
        </div>
      )}
      {showChangeModal && (
        <ChangeQtyModal
          user={modalUser}
          qty={modalQty}
          onQtyChange={(e) => setModalQty(e.target.value)}
          onSave={handleModalQtySubmit}
          onClose={() => setShowChangeModal(false)}
        />
      )}

      {action === "list" &&
        currentDayEntryList.length !== 0 &&
        filteredCurrentDayEntryList.map((e, index) => (
          <div
            className={`row mx-auto mt-1 my-1 ${
              e.entry_status === "Delivered"
                ? "bg-success bg-opacity-25"
                : e.entry_status === "Change"
                ? "bg-warning bg-opacity-25"
                : e.entry_status === "Khada"
                ? "bg-secondary bg-opacity-25"
                : ""
            }`}
            key={e._id || index}
          >
            <div className="col-1 d-flex align-items-center">
              <input
                type="checkbox"
                checked={selectedIds.includes(e._id)}
                onChange={(ev) => {
                  if (ev.target.checked) {
                    setSelectedIds((prev) => [...prev, e._id]);
                  } else {
                    setSelectedIds((prev) => prev.filter((id) => id !== e._id));
                  }
                }}
                disabled={disableActions}
              />
            </div>
            <div className="col-11">
              <Entity
                entity={e}
                index={index}
                sortedField={sortedField}
                direction={direction}
                listSize={filteredCurrentDayEntryList.length}
                selectedEntity={selectedEntity}
                showInList={showInList}
                cntShow={cntShow}
                VITE_API_URL={import.meta.env.VITE_API_URL}
                onEditButtonClick={handleEditButtonClick}
                onDeleteButtonClick={handleDeleteButtonClick}
                onToggleText={handleToggleText}
              />
            </div>
          </div>
        ))}

      {flagImport && (
        <ModalImport
          modalText={"Summary of Bulk Import"}
          additions={recordsToBeAdded}
          updations={recordsToBeUpdated}
          btnGroup={["Yes", "No"]}
          onModalCloseClick={handleModalCloseClick}
          onModalButtonCancelClick={handleModalButtonCancelClick}
          onImportButtonClick={handleImportButtonClick}
        />
      )}
    </>
  );
}









// import { useEffect, useState } from "react";
// import {
//   CommonUtilityBar,
//   CheckBoxHeaders,
//   ListHeaders,
//   Entity,
// } from "../external/vite-sdk";
// import { BeatLoader } from "react-spinners";
// import axios from "axios";
// import * as XLSX from "xlsx";
// import ModalImport from "./ModalImport";
// import ChangeQtyModal from "./ChangeQtyModal";
// import {
//   recordsAddBulk,
//   recordsUpdateBulk,
//   analyseImportExcelSheet,
//   getEmptyObject,
//   getShowInList,
// } from "../external/vite-sdk";
// import AdminDailyEntryForm from "./AdminDailyEntryForm";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// export default function AdminDailyEntry(props) {
//   const [anotherDate, setAnotherDate] = useState("");
//   let [showChangeModal, setShowChangeModal] = useState(false);
//   let [modalUser, setModalUser] = useState(null);
//   let [modalQty, setModalQty] = useState("");
//   let [selectedIds, setSelectedIds] = useState([]);
//   let [currentDayEntryList, setCurrentDayEntryList] = useState([]);
//   let [filteredCurrentDayEntryList, setFilteredCurrentDayEntryList] = useState(
//     []
//   );
//   let [action, setAction] = useState("list");
//   let [userToBeEdited, setUserToBeEdited] = useState("");
//   let [flagLoad, setFlagLoad] = useState(false);
//   let [flagImport, setFlagImport] = useState(false);
//   let [message, setMessage] = useState("");
//   let [searchText, setSearchText] = useState("");
//   let [sortedField, setSortedField] = useState("");
//   let [direction, setDirection] = useState("");
//   let [sheetData, setSheetData] = useState(null);
//   let [selectedFile, setSelectedFile] = useState("");
//   let [recordsToBeAdded, setRecordsToBeAdded] = useState([]);
//   let [recordsToBeUpdated, setRecordsToBeUpdated] = useState([]);
//   let [cntUpdate, setCntUpdate] = useState(0);
//   let [cntAdd, setCntAdd] = useState(0);
//   let [cntShow, setCntShow] = useState(window.maxCnt); // Initially 5 attributes are shown
//   let { selectedEntity } = props;
//   let { flagFormInvalid } = props;
//   let { flagToggleButton } = props;

//   const [selectedDateOption, setSelectedDateOption] = useState("Today");
//   const [allUsersFromDatabase, setAllUsersFromDatabase] = useState([]);
//   const [globalLatestEntryDate, setGlobalLatestEntryDate] = useState(null);
//   const [totalUsersWithRoleId, setTotalUsersWithRoleId] = useState(0);

//   const [validationMessage, setValidationMessage] = useState("");
//   const [validationMessageDate, setValidationMessageDate] = useState(null);
//   const [datePickerIsOpen, setDatePickerIsOpen] = useState(false);

//   function resolveSelectedDate(option, customDate = "") {
//     const today = new Date();
//     if (option === "Today") return today.toISOString().split("T")[0];
//     if (option === "Yesterday") {
//       const yest = new Date(today);
//       yest.setDate(yest.getDate() - 1);
//       return yest.toISOString().split("T")[0];
//     }
//     if (option === "Another Day" && customDate) return customDate;
//     return today.toISOString().split("T")[0];
//   }

//   function getYearMonthFromDate(dateString) {
//     if (!dateString) {
//       const today = new Date();
//       const year = today.getFullYear();
//       const month = String(today.getMonth() + 1);
//       return { year: year, month: parseInt(month, 10) };
//     }
//     const [year, month] = dateString.split("-");
//     return { year: parseInt(year, 10), month: parseInt(month, 10) };
//   }
//   let entrySchema = [
//     { attribute: "name", type: "normal" },
//     { attribute: "delivered_qty", type: "normal" },
//     { attribute: "daily_qty", type: "normal" },
//     {
//       attribute: "entry_status",
//       type: "normal",
//       show: true,
//     },
//   ];
//   let entryValidations = {
//     name: { message: "", mxLen: 200, mnLen: 4, onlyDigits: false },
//     daily_qty: { message: "", onlyDigits: true },
//     delivered_qty: { message: "", onlyDigits: true },
//     entry_status: { message: "" },
//   };

//   let [showInList, setShowInList] = useState(
//     getShowInList(entrySchema, cntShow)
//   );
//   let [emptyEntry, setEmptyEntry] = useState(getEmptyObject(entrySchema));

//   async function fetchLatestEntryDate() {
//     try {
//       const latestEntryRes = await axios.get(
//         `${import.meta.env.VITE_API_URL}/entries/latest-date`
//       );
//       const latestDate = latestEntryRes.data.last_entry_date;
//       setGlobalLatestEntryDate(latestDate ? new Date(latestDate) : null);
//     } catch (error) {
//       console.error("Failed to fetch latest entry date:", error);
//       setGlobalLatestEntryDate(null);
//     }
//   }

//   useEffect(() => {
//     async function fetchInitialData() {
//       setFlagLoad(true);
//       try {
//         const userRes = await axios(
//           import.meta.env.VITE_API_URL + "/customers"
//         );
//         setAllUsersFromDatabase(userRes.data);
//         const countUsers = userRes.data;
//         setTotalUsersWithRoleId(countUsers);
//         await fetchLatestEntryDate();
//         await fetchEntriesForDisplay(
//           selectedDateOption,
//           anotherDate,
//           userRes.data
//         );
//       } catch (error) {
//         showMessage("Something went wrong while fetching initial data.");
//         setFlagLoad(false);
//       }
//     }
//     fetchInitialData();
//   }, []);

//   useEffect(() => {
//     async function checkValidationStatus() {
//       if (globalLatestEntryDate && totalUsersWithRoleId > 0) {
//         const latestDateISO = globalLatestEntryDate.toISOString().split("T")[0];
//         const { year, month } = getYearMonthFromDate(latestDateISO);
//         const day = parseInt(latestDateISO.split("-")[2], 10);

//         let entriesForLatestDate = [];
//         try {
//           const entryRes = await axios(
//             `${import.meta.env.VITE_API_URL}/entries/${year}/${month}/${day}`
//           );
//           entriesForLatestDate = entryRes.data;
//         } catch (error) {
//           entriesForLatestDate = [];
//         }

//         const countValidDeliveredQtyForLatestDate = entriesForLatestDate.filter(
//           (entry) => {
//             const deliveredQty = entry.delivered_qty;
//             return (
//               deliveredQty !== "" &&
//               !isNaN(Number(deliveredQty)) &&
//               Number(deliveredQty) >= 0
//             );
//           }
//         ).length;

//         const isDayCompletelyFilled =
//           countValidDeliveredQtyForLatestDate === totalUsersWithRoleId;
//         if (!isDayCompletelyFilled) {
//           const msg = `Please enter the data of ${globalLatestEntryDate.toLocaleDateString()} date.`;
//           setValidationMessage(msg);
//           setValidationMessageDate(globalLatestEntryDate);
//         } else {
//           const nextDay = new Date(globalLatestEntryDate);
//           nextDay.setDate(nextDay.getDate() + 1);
//           const msg = `Please enter the data of ${nextDay.toLocaleDateString()} date.`;
//           setValidationMessage(msg);
//           setValidationMessageDate(nextDay);
//         }
//       } else if (totalUsersWithRoleId > 0) {
//         const today = new Date();
//         setValidationMessage(
//           `No entries found. Please enter data for today (${today.toLocaleDateString()}).`
//         );
//         setValidationMessageDate(today);
//       } else {
//         setValidationMessage(
//           "No entries or users found in the database. Please add users and entries."
//         ); 
//         setValidationMessage("");
//         setValidationMessageDate(null);
//       }
//     }

//     checkValidationStatus();
//   }, [globalLatestEntryDate, totalUsersWithRoleId]);

//   async function fetchEntriesForDisplay(
//     option = selectedDateOption,
//     customDate = anotherDate,
//     users = allUsersFromDatabase
//   ) {
//     setFlagLoad(true);
//     const dateToDisplay = resolveSelectedDate(option, customDate);
//     const { year, month } = getYearMonthFromDate(dateToDisplay);
//     const day = parseInt(dateToDisplay.split("-")[2], 10);

//     let entriesForCurrentDay = [];
//     try {
//       const entryRes = await axios(
//         `${import.meta.env.VITE_API_URL}/entries/${year}/${month}/${day}`
//       );
//       entriesForCurrentDay = entryRes.data;
//     } catch (error) {
//       if (error.response && error.response.status === 404) {
//         showMessage(`No entries found for ${dateToDisplay}.`);
//       } else {
//         showMessage("Something went wrong while fetching entries.");
//       }
//       entriesForCurrentDay = [];
//     } finally {
//       const userList = users;
//       const mergedListForCurrentDay = userList.map((user) => {
//         const entryForSelectedDate = entriesForCurrentDay.find((entry) => {
//           const entryDateFormatted =
//             entry.date instanceof Date
//               ? entry.date.toISOString().split("T")[0]
//               : typeof entry.date === "string" && entry.date.includes("T")
//               ? entry.date.split("T")[0]
//               : entry.date;
//           return (
//             entry.userId === user._id && entryDateFormatted === dateToDisplay
//           );
//         });
//         return {
//           _id: user._id,
//           userId: user._id,
//           name: user.name,
//           daily_qty: user.daily_qty,
//           delivered_qty: entryForSelectedDate?.delivered_qty ?? "",
//           entry_status: entryForSelectedDate?.entry_status || "",
//           date: entryForSelectedDate?.date || dateToDisplay,
//           updateDate: entryForSelectedDate?.updateDate || "",
//           entryId: entryForSelectedDate?._id || null,
//         };
//       });

//       mergedListForCurrentDay.sort(
//         (a, b) => new Date(b.updateDate || 0) - new Date(a.updateDate || 0)
//       );

//       setCurrentDayEntryList(mergedListForCurrentDay);
//       setFilteredCurrentDayEntryList(mergedListForCurrentDay);
//       setFlagLoad(false);
//     }
//   }

//   function fetchDataForSelectedDate(
//     option = selectedDateOption,
//     customDate = anotherDate
//   ) {
//     setSelectedIds([]);
//     fetchEntriesForDisplay(option, customDate, allUsersFromDatabase);
//   }

//   async function handleFormSubmit(entry) {
//     let message;
//     let entryForBackEnd = { ...entry };
//     for (let key in entryForBackEnd) {
//       entrySchema.forEach((e) => {
//         if (key == e.attribute && e.relationalData) {
//           delete entryForBackEnd[key];
//         }
//       });
//     }

//     delete entryForBackEnd.name;
//     delete entryForBackEnd.daily_qty;

//     if (entryForBackEnd.date instanceof Date) {
//       entryForBackEnd.date = entryForBackEnd.date.toISOString().split("T")[0];
//     } else if (
//       typeof entryForBackEnd.date === "string" &&
//       entryForBackEnd.date.includes("T")
//     ) {
//       entryForBackEnd.date = entryForBackEnd.date.split("T")[0];
//     }

//     const { year, month } = getYearMonthFromDate(entryForBackEnd.date);

//     if (action === "add") {
//       setFlagLoad(true);
//       try {
//         await axios.post(
//           `${import.meta.env.VITE_API_URL}/entries/${year}/${month}`,
//           entryForBackEnd,
//           { headers: { "Content-type": "application/json" } }
//         );

//         await fetchLatestEntryDate();
//         await fetchEntriesForDisplay(
//           selectedDateOption,
//           anotherDate,
//           allUsersFromDatabase
//         );

//         message = "Entry added successfully";
//         showMessage(message);
//         setAction("list");
//       } catch (error) {
//         showMessage("Something went wrong, refresh the page");
//       }
//       setFlagLoad(false);
//     } else if (action === "update") {
//       const entryToUpdateId = userToBeEdited.entryId;

//       if (!entryToUpdateId) {
//         showMessage(
//           "Error: Cannot update. Entry ID not found for this record."
//         );
//         setFlagLoad(false);
//         return;
//       }

//       setFlagLoad(true);
//       try {
//         await axios.put(
//           `${
//             import.meta.env.VITE_API_URL
//           }/entries/${year}/${month}/${entryToUpdateId}`,
//           entryForBackEnd,
//           { headers: { "Content-type": "application/json" } }
//         );

//         await fetchLatestEntryDate();
//         await fetchEntriesForDisplay(
//           selectedDateOption,
//           anotherDate,
//           allUsersFromDatabase
//         );

//         message = "Entry Updated successfully";
//         showMessage(message);
//         setAction("list");
//       } catch (error) {
//         showMessage("Something went wrong during update, please try again.");
//       }
//       setFlagLoad(false);
//     }
//   }

//   function handleFormCloseClick() {
//     props.onFormCloseClick();
//   }

//   function handleListClick() {
//     setAction("list");
//   }
//   function handleAddEntityClick() {
//     setAction("add");
//   }
//   function handleEditButtonClick(entry) {
//     let safeEntry = {
//       ...emptyEntry,
//       ...entry,
//       info: entry.info || "",
//     };
//     setAction("update");
//     setUserToBeEdited(safeEntry);
//   }
//   function showMessage(message) {
//     setMessage(message);
//     window.setTimeout(() => {
//       setMessage("");
//     }, 3000);
//   }

//   async function handleModalQtySubmit() {
//     if (!modalUser || modalQty === "") {
//       showMessage("Please enter a valid quantity.");
//       return;
//     }

//     const entry = modalUser;

//     const entryDate = new Date(
//       entry.date || resolveSelectedDate(selectedDateOption, anotherDate)
//     );
//     const entryYear = entryDate.getFullYear();
//     const entryMonth = entryDate.getMonth() + 1;

//     const entryData = {
//       userId: entry.userId,
//       delivered_qty: modalQty,
//       entry_status: "Change",
//       date: entry.date || resolveSelectedDate(selectedDateOption, anotherDate),
//     };

//     const url = `${
//       import.meta.env.VITE_API_URL
//     }/entries/${entryYear}/${entryMonth}`;
//     const method = axios.post;

//     try {
//       await method(url, entryData, {
//         headers: { "Content-type": "application/json" },
//       });

//       await fetchLatestEntryDate();
//       await fetchEntriesForDisplay(
//         selectedDateOption,
//         anotherDate,
//         allUsersFromDatabase
//       );
//       showMessage("Entry updated to 'Change'");
//       setSelectedIds([]);
//       setShowChangeModal(false);
//     } catch (error) {
//       if (error.response) {
//         console.error("Error response data:", error.response.data);
//         console.error("Error response status:", error.response.status);
//       } else if (error.request) {
//         console.error("Error request:", error.request);
//       } else {
//         console.error("Error message:", error.message);
//       }
//       showMessage("Failed to update entry");
//       setShowChangeModal(false);
//     }
//   }

//   function handleDeleteButtonClick(ans, entry) {
//     if (ans == "No") {
//       showMessage("Delete operation cancelled");
//       return;
//     }
//     if (ans == "Yes") {
//       performDeleteOperation(entry);
//     }
//   }

//   async function handleDeliverButtonClick() {
//     setFlagLoad(true);

//     const currentSelectedDate = resolveSelectedDate(
//       selectedDateOption,
//       anotherDate
//     );
//     const { year: currentYear, month: currentMonth } =
//       getYearMonthFromDate(currentSelectedDate);

//     for (const id of selectedIds) {
//       const entry = currentDayEntryList.find((e) => e._id === id);

//       const entryDate = new Date(entry.date || currentSelectedDate);
//       const entryYear = entryDate.getFullYear();
//       const entryMonth = entryDate.getMonth() + 1;

//       const entryData = {
//         userId: entry.userId,
//         delivered_qty: entry.daily_qty,
//         entry_status: "Delivered",
//         date: entry.date || currentSelectedDate,
//       };

//       const url = `${
//         import.meta.env.VITE_API_URL
//       }/entries/${entryYear}/${entryMonth}`;

//       try {
//         await axios.post(url, entryData, {
//           headers: { "Content-type": "application/json" },
//         });
//       } catch (err) {
//         showMessage("Failed to mark as Delivered for " + entry.name);
//       }
//     }

//     await fetchLatestEntryDate();
//     await fetchEntriesForDisplay(
//       selectedDateOption,
//       anotherDate,
//       allUsersFromDatabase
//     );

//     showMessage("Marked selected entries as Delivered");
//     setSelectedIds([]);
//     setFlagLoad(false);
//   }

//   async function handleKhadaButtonClick() {
//     setFlagLoad(true);
//     const currentSelectedDate = resolveSelectedDate(
//       selectedDateOption,
//       anotherDate
//     );
//     const { year: currentYear, month: currentMonth } =
//       getYearMonthFromDate(currentSelectedDate);

//     for (const id of selectedIds) {
//       const userEntry = currentDayEntryList.find((e) => e._id === id);

//       const entryDate = new Date(userEntry.date || currentSelectedDate);
//       const entryYear = entryDate.getFullYear();
//       const entryMonth = entryDate.getMonth() + 1;

//       const entryData = {
//         userId: userEntry.userId,
//         delivered_qty: 0,
//         entry_status: "Khada",
//         date: userEntry.date || currentSelectedDate,
//       };

//       const url = `${
//         import.meta.env.VITE_API_URL
//       }/entries/${entryYear}/${entryMonth}`;

//       try {
//         await axios.post(url, entryData, {
//           headers: { "Content-type": "application/json" },
//         });
//       } catch (error) {
//         showMessage(`Failed to mark Khada for ${userEntry.name}`);
//       }
//     }

//     await fetchLatestEntryDate();
//     await fetchEntriesForDisplay(
//       selectedDateOption,
//       anotherDate,
//       allUsersFromDatabase
//     );
//     showMessage("Marked selected entries as Khada");
//     setSelectedIds([]);
//     setFlagLoad(false);
//   }

//   function handleChangeButtonClick() {
//     if (selectedIds.length !== 1) {
//       showMessage("Select exactly one user to change delivered quantity.");
//       return;
//     }
//     const user = currentDayEntryList.find((u) => u._id === selectedIds[0]);
//     setModalUser(user);
//     setModalQty(user.delivered_qty || "");
//     setShowChangeModal(true);
//   }

//   async function performDeleteOperation(entry) {
//     setFlagLoad(true);
//     try {
//       const entryDate = new Date(entry.date || entry.updateDate);
//       const entryYear = entryDate.getFullYear();
//       const entryMonth = entryDate.getMonth() + 1;

//       await axios.delete(
//         `${import.meta.env.VITE_API_URL}/entries/${entryYear}/${entryMonth}/${
//           entry.entryId
//         }`
//       );

//       await fetchLatestEntryDate();
//       await fetchEntriesForDisplay(
//         selectedDateOption,
//         anotherDate,
//         allUsersFromDatabase
//       );
//       showMessage(`Entry - ${entry.name} deleted successfully.`);
//     } catch (error) {
//       showMessage("Something went wrong, refresh the page");
//     }
//     setFlagLoad(false);
//   }

//   function handleListCheckBoxClick(checked, selectedIndex) {
//     let cnt = 0;
//     showInList.forEach((e) => {
//       if (e.show) {
//         cnt++;
//       }
//     });
//     if (cnt === 1 && !checked) {
//       showMessage("Minimum 1 field should be selected.");
//       return;
//     }
//     if (cnt == window.maxCnt && checked) {
//       showMessage("Maximum " + window.maxCnt + " fields can be selected.");
//       return;
//     }
//     let att = [...showInList];
//     let a = att.map((e, index) => {
//       let p = { ...e };
//       if (index === selectedIndex && checked) {
//         p.show = true;
//         setCntShow(cnt + 1);
//       } else if (index === selectedIndex && !checked) {
//         p.show = false;
//         setCntShow(cnt - 1);
//       }
//       return p;
//     });
//     setShowInList(a);
//   }
//   function handleHeaderClick(index) {
//     let field = showInList[index].attribute;
//     let d = false;
//     if (field === sortedField) {
//       d = !direction;
//     } else {
//       d = false;
//     }
//     let list = [...filteredCurrentDayEntryList];
//     setDirection(d);
//     if (d === false) {
//       list.sort((a, b) => {
//         if (a[field] > b[field]) {
//           return 1;
//         }
//         if (a[field] < b[field]) {
//           return -1;
//         }
//         return 0;
//       });
//     } else {
//       list.sort((a, b) => {
//         if (a[field] < b[field]) {
//           return 1;
//         }
//         if (a[field] > b[field]) {
//           return -1;
//         }
//         return 0;
//       });
//     }
//     setFilteredCurrentDayEntryList(list);
//     setSortedField(field);
//   }
//   function handleSrNoClick() {
//     let d = false;
//     if (sortedField === "updateDate") {
//       d = !direction;
//     } else {
//       d = false;
//     }

//     let list = [...filteredCurrentDayEntryList];
//     setDirection(!direction);
//     if (d === false) {
//       list.sort((a, b) => {
//         if (new Date(a.updateDate || 0) > new Date(b.updateDate || 0)) {
//           return 1;
//         }
//         if (new Date(a.updateDate || 0) < new Date(b.updateDate || 0)) {
//           return -1;
//         }
//         return 0;
//       });
//     } else {
//       list.sort((a, b) => {
//         if (new Date(a.updateDate || 0) < new Date(b.updateDate || 0)) {
//           return 1;
//         }
//         if (new Date(a.updateDate || 0) > new Date(b.updateDate || 0)) {
//           return -1;
//         }
//         return 0;
//       });
//     }
//     setFilteredCurrentDayEntryList(list);
//     setSortedField("updateDate");
//   }
//   function handleFormTextChangeValidations(message, index) {
//     props.onFormTextChangeValidations(message, index);
//   }
//   function handleSearchKeyUp(event) {
//     let searchText = event.target.value;
//     setSearchText(searchText);
//     performSearchOperation(searchText);
//   }
//   function performSearchOperation(searchText) {
//     let query = searchText.trim();
//     if (query.length === 0) {
//       setFilteredCurrentDayEntryList(currentDayEntryList);
//       return;
//     }
//     let searchedEntrys = [];
//     searchedEntrys = filterByShowInListAttributes(query);
//     setFilteredCurrentDayEntryList(searchedEntrys);
//   }
//   function filterByName(query) {
//     let fList = [];
//     for (let i = 0; i < currentDayEntryList.length; i++) {
//       if (
//         currentDayEntryList[i].name.toLowerCase().includes(query.toLowerCase())
//       ) {
//         fList.push(currentDayEntryList[i]);
//       }
//     }
//     return fList;
//   }
//   function filterByShowInListAttributes(query) {
//     let fList = [];
//     for (let i = 0; i < currentDayEntryList.length; i++) {
//       for (let j = 0; j < showInList.length; j++) {
//         if (showInList[j].show) {
//           let parameterName = showInList[j].attribute;
//           if (
//             currentDayEntryList[i][parameterName] &&
//             currentDayEntryList[i][parameterName]
//               .toLowerCase()
//               .includes(query.toLowerCase())
//           ) {
//             fList.push(currentDayEntryList[i]);
//             break;
//           }
//         }
//       }
//     }
//     return fList;
//   }
//   function handleToggleText(index) {
//     let sil = [...showInList];
//     sil[index].flagReadMore = !sil[index].flagReadMore;
//     setShowInList(sil);
//   }
//   function handleExcelFileUploadClick(file, msg) {
//     if (msg) {
//       showMessage(message);
//       return;
//     }
//     setSelectedFile(file);
//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const arrayBuffer = event.target.result;
//       const workbook = XLSX.read(arrayBuffer, { type: "array" });
//       const sheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];
//       const jsonData = XLSX.utils.sheet_to_json(worksheet);
//       setSheetData(jsonData);
//       let result = analyseImportExcelSheet(jsonData, allUsersFromDatabase);
//       if (result.message) {
//         showMessage(result.message);
//       } else {
//         showImportAnalysis(result);
//       }
//     };
//     reader.readAsArrayBuffer(file);
//   }
//   function showImportAnalysis(result) {
//     setCntAdd(result.cntA);
//     setCntUpdate(result.cntU);
//     setRecordsToBeAdded(result.recordsToBeAdded);
//     setRecordsToBeUpdated(result.recordsToBeUpdated);
//     setFlagImport(true);
//   }
//   function handleModalCloseClick() {
//     setFlagImport(false);
//   }
//   async function handleImportButtonClick() {
//     setFlagImport(false);
//     setFlagLoad(true);
//     let result;
//     try {
//       if (recordsToBeAdded.length > 0) {
//         result = await recordsAddBulk(
//           recordsToBeAdded,
//           "users",
//           allUsersFromDatabase,
//           import.meta.env.VITE_API_URL
//         );
//         if (result.success) {
//           setAllUsersFromDatabase(result.updatedList);

//           fetchEntriesForDisplay(
//             selectedDateOption,
//             anotherDate,
//             result.updatedList
//           );
//         }
//         showMessage(result.message);
//       }
//       if (recordsToBeUpdated.length > 0) {
//         result = await recordsUpdateBulk(
//           recordsToBeUpdated,
//           "users",
//           allUsersFromDatabase,
//           import.meta.env.VITE_API_URL
//         );
//         if (result.success) {
//           setAllUsersFromDatabase(result.updatedList);

//           fetchEntriesForDisplay(
//             selectedDateOption,
//             anotherDate,
//             result.updatedList
//           );
//         }
//         showMessage(result.message);
//       }
//       await fetchLatestEntryDate();
//     } catch (error) {
//       showMessage("Something went wrong during import, refresh the page");
//     }
//     setFlagLoad(false);
//   }
//   function handleClearSelectedFile() {
//     setSelectedFile(null);
//   }
//   if (flagLoad) {
//     return (
//       <div className="my-5 text-center">
//         <BeatLoader size={24} color={"blue"} />
//       </div>
//     );
//   }

//   const currentlyDisplayedDate = new Date(
//     resolveSelectedDate(selectedDateOption, anotherDate)
//   );
//   currentlyDisplayedDate.setHours(0, 0, 0, 0);

//   const globalLatestEntryDateOnly = globalLatestEntryDate
//     ? new Date(globalLatestEntryDate)
//     : null;
//   if (globalLatestEntryDateOnly) {
//     globalLatestEntryDateOnly.setHours(0, 0, 0, 0);
//   }

//   let disableActions = false;

//   if (validationMessageDate) {
//     const requiredValidationDate = new Date(validationMessageDate);
//     requiredValidationDate.setHours(0, 0, 0, 0);

//     if (currentlyDisplayedDate.getTime() > requiredValidationDate.getTime()) {
//       disableActions = true;
//     }
//   }

//   const handlePreviousDate = () => {
//     const currentDate = new Date(
//       resolveSelectedDate(selectedDateOption, anotherDate)
//     );
//     currentDate.setDate(currentDate.getDate() - 1);
//     const newDateISO = currentDate.toISOString().split("T")[0];
//     setSelectedDateOption("Another Day");
//     setAnotherDate(newDateISO);
//     fetchDataForSelectedDate("Another Day", newDateISO);
//     setDatePickerIsOpen(false);
//   };

//   const handleNextDate = () => {
//     const currentDate = new Date(
//       resolveSelectedDate(selectedDateOption, anotherDate)
//     );
//     currentDate.setDate(currentDate.getDate() + 1);
//     const newDateISO = currentDate.toISOString().split("T")[0];

//     setSelectedDateOption("Another Day");
//     setAnotherDate(newDateISO);
//     fetchDataForSelectedDate("Another Day", newDateISO);
//     setDatePickerIsOpen(false);
//   };
//   const todayAtMidnight = new Date();
//   todayAtMidnight.setHours(0, 0, 0, 0);
//   const isNextButtonDisabled =
//     currentlyDisplayedDate.getTime() >= todayAtMidnight.getTime();

//   return (
//     <>
//       <CommonUtilityBar
//         action={action}
//         message={message}
//         selectedEntity={selectedEntity}
//         flagToggleButton={flagToggleButton}
//         filteredList={filteredCurrentDayEntryList}
//         mainList={currentDayEntryList}
//         showInList={showInList}
//         onListClick={handleListClick}
//         onAddEntityClick={handleAddEntityClick}
//         onSearchKeyUp={handleSearchKeyUp}
//         onExcelFileUploadClick={handleExcelFileUploadClick}
//         onClearSelectedFile={handleClearSelectedFile}
//       />

//       {currentDayEntryList.length === 0 && allUsersFromDatabase.length > 0 && (
//         <div className="text-center">No entries recorded for this date.</div>
//       )}
//       {allUsersFromDatabase.length === 0 && (
//         <div className="text-center">
//           No users found in the database. Please add users.
//         </div>
//       )}

//       {action === "list" && (
//         <div className="text-center my-3">
//           <label className="fw-bold me-3">Select Date:</label>

//           <div className="btn-group" role="group">
//             <button
//               type="button"
//               className={` btn ${
//                 selectedDateOption === "Today"
//                   ? "btn-primary"
//                   : "btn-outline-primary"
//               }`}
//               onClick={() => {
//                 setSelectedDateOption("Today");
//                 setAnotherDate("");
//                 fetchDataForSelectedDate("Today");
//                 setDatePickerIsOpen(false);
//               }}
//             >
//               Today
//             </button>
//             <button
//               type="button"
//               className={`btn ${
//                 selectedDateOption === "Yesterday"
//                   ? "btn-primary"
//                   : "btn-outline-primary"
//               }`}
//               onClick={() => {
//                 setSelectedDateOption("Yesterday");
//                 setAnotherDate("");
//                 fetchDataForSelectedDate("Yesterday");
//                 setDatePickerIsOpen(false);
//               }}
//             >
//               Yesterday
//             </button>
//             <button
//               type="button"
//               className={`btn ${
//                 selectedDateOption === "Another Day"
//                   ? "btn-primary"
//                   : "btn-outline-primary"
//               }`}
//               onClick={() => {
//                 setSelectedDateOption("Another Day");
//                 setDatePickerIsOpen(true);
//               }}
//             >
//               Another Day
//             </button>
//             {selectedDateOption === "Another Day" && (
//               <DatePicker
//                 selected={anotherDate ? new Date(anotherDate) : null}
//                 onChange={(date) => {
//                   const newDateISO = date
//                     ? date.toISOString().split("T")[0]
//                     : "";
//                   setAnotherDate(newDateISO);
//                   setSelectedIds([]);
//                   fetchDataForSelectedDate("Another Day", newDateISO);
//                   setDatePickerIsOpen(false);
//                 }}
//                 dateFormat="yyyy-MM-dd"
//                 maxDate={new Date()}
//                 className="form-control d-inline-block ms-2"
//                 wrapperClassName="d-inline-block"
//                 disabled={
//                   validationMessageDate &&
//                   (anotherDate
//                     ? new Date(anotherDate).setHours(0, 0, 0, 0) >
//                       validationMessageDate.setHours(0, 0, 0, 0)
//                     : false)
//                 }
//                 open={datePickerIsOpen}
//                 onInputClick={() => setDatePickerIsOpen(true)}
//                 onCalendarClose={() => setDatePickerIsOpen(false)}
//               />
//             )}
//           </div>
//         </div>
//       )}

//       <div className="text-center justify-content-between align-items-center ">
//         <button className="me-3" onClick={handlePreviousDate}>
//           <i className="bi bi-arrow-left fs-4 text-primary"></i>
//         </button>
//         <button onClick={handleNextDate} disabled={isNextButtonDisabled}>
//           <i className="bi bi-arrow-right fs-4 text-primary"></i>
//         </button>
//       </div>

//       {action === "list" && (
//         <div className="text-center my-3">
//           <div className="text-center my-3">
//             <button
//               className="btn btn-success mx-1"
//               onClick={handleDeliverButtonClick}
//               disabled={selectedIds.length === 0 || disableActions}
//             >
//               Delivered
//             </button>

//             <button
//               className="btn btn-warning mx-1"
//               onClick={handleKhadaButtonClick}
//               disabled={selectedIds.length === 0 || disableActions}
//             >
//               Khada
//             </button>

//             <button
//               className="btn btn-secondary mx-1"
//               onClick={handleChangeButtonClick}
//               disabled={selectedIds.length !== 1 || disableActions}
//             >
//               Change
//             </button>
//           </div>

//           {globalLatestEntryDate !== null ? (
//             <div className="text-sm text-red-600 font-semibold mt-2">
//               Last entry date for this view:{" "}
//               {globalLatestEntryDate.toLocaleDateString()}
//             </div>
//           ) : (
//             <div className="text-sm text-gray-500 mt-2">
//               No entries with a date found for this view.
//             </div>
//           )}

//           {validationMessage && (
//             <div className="text-sm text-danger font-semibold mt-2">
//               {validationMessage}
//             </div>
//           )}
//         </div>
//       )}

//       {action === "list" && currentDayEntryList.length !== 0 && (
//         <CheckBoxHeaders
//           showInList={showInList}
//           cntShow={cntShow}
//           onListCheckBoxClick={handleListCheckBoxClick}
//         />
//       )}

//       {action === "list" && currentDayEntryList.length !== 0 && (
//         <div className="row my-2 mx-auto">
//           <div className="col-1">
//             <input
//               type="checkbox"
//               checked={
//                 selectedIds.length > 0 &&
//                 selectedIds.length === filteredCurrentDayEntryList.length
//               }
//               onChange={(ev) => {
//                 if (ev.target.checked) {
//                   setSelectedIds(
//                     filteredCurrentDayEntryList.map((entry) => entry._id)
//                   );
//                 } else {
//                   setSelectedIds([]);
//                 }
//               }}
//               disabled={disableActions}
//             />
//           </div>
//           <div className="col-1">
//             <a
//               href="#"
//               onClick={() => {
//                 handleSrNoClick();
//               }}
//             >
//               SN.{" "}
//               {sortedField === "updateDate" && direction && (
//                 <i className="bi bi-arrow-up"></i>
//               )}
//               {sortedField === "updateDate" && !direction && (
//                 <i className="bi bi-arrow-down"></i>
//               )}
//             </a>
//           </div>
//           <ListHeaders
//             showInList={showInList}
//             sortedField={sortedField}
//             direction={direction}
//             cntShow={cntShow}
//             onHeaderClick={handleHeaderClick}
//           />
//           <div className="col-1">&nbsp;</div>
//         </div>
//       )}
//       {(action === "add" || action === "update") && (
//         <div className="row">
//           <AdminDailyEntryForm
//             entrySchema={entrySchema}
//             entryValidations={entryValidations}
//             emptyEntry={emptyEntry}
//             selectedEntity={selectedEntity}
//             userToBeEdited={userToBeEdited}
//             action={action}
//             flagFormInvalid={flagFormInvalid}
//             onFormSubmit={handleFormSubmit}
//             onFormCloseClick={handleFormCloseClick}
//             onFormTextChangeValidations={handleFormTextChangeValidations}
//           />
//         </div>
//       )}
//       {showChangeModal && (
//         <ChangeQtyModal
//           user={modalUser}
//           qty={modalQty}
//           onQtyChange={(e) => setModalQty(e.target.value)}
//           onSave={handleModalQtySubmit}
//           onClose={() => setShowChangeModal(false)}
//         />
//       )}

//       {action === "list" &&
//         currentDayEntryList.length !== 0 &&
//         filteredCurrentDayEntryList.map((e, index) => (
//           <div
//             className={`row mx-auto     mt-2 my-1 ${
//               e.entry_status === "Delivered"
//                 ? "bg-success bg-opacity-25"
//                 : e.entry_status === "Change"
//                 ? "bg-warning bg-opacity-25"
//                 : e.entry_status === "Khada"
//                 ? "bg-secondary bg-opacity-25"
//                 : ""
//             }`}
//             key={e._id || index}
//           >
//             <div className="col-1 d-flex align-items-center">
//               <input
//                 type="checkbox"
//                 checked={selectedIds.includes(e._id)}
//                 onChange={(ev) => {
//                   if (ev.target.checked) {
//                     setSelectedIds((prev) => [...prev, e._id]);
//                   } else {
//                     setSelectedIds((prev) => prev.filter((id) => id !== e._id));
//                   }
//                 }}
//                 disabled={disableActions}
//               />
//             </div>
//             <div className="col-11">
//               <Entity
//                 entity={e}
//                 index={index}
//                 sortedField={sortedField}
//                 direction={direction}
//                 listSize={filteredCurrentDayEntryList.length}
//                 selectedEntity={selectedEntity}
//                 showInList={showInList}
//                 cntShow={cntShow}
//                 VITE_API_URL={import.meta.env.VITE_API_URL}
//                 onEditButtonClick={handleEditButtonClick}
//                 onDeleteButtonClick={handleDeleteButtonClick}
//                 onToggleText={handleToggleText}
//               />
//             </div>
//           </div>
//         ))}

//       {flagImport && (
//         <ModalImport
//           modalText={"Summary of Bulk Import"}
//           additions={recordsToBeAdded}
//           updations={recordsToBeUpdated}
//           btnGroup={["Yes", "No"]}
//           onModalCloseClick={handleModalCloseClick}
//           onModalButtonCancelClick={handleModalButtonCancelClick}
//           onImportButtonClick={handleImportButtonClick}
//         />
//       )}
//     </>
//   );
// }