import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import InfoHeader from "./InfoHeader";
import AEnquiryRemark from "./AEnquiryRemark";
import Modal from "./Modal";

export default function EnquiryRemarks() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const productId = params.get("productId");
  const user = params.get("user");
  let [flagLoad, setFlagLoad] = useState(false);
  let [message, setMessage] = useState("");
  let [enquiry, setEnquiry] = useState([]);
  let [remark, setRemark] = useState("");
  let [remarks, setRemarks] = useState([]);
  let [flagDeleteButtonPressed, setFlagDeleteButtonPressed] = useState(false);

  let [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    getData();
  }, []);
  async function getData() {
    setFlagLoad(true);
    try {
      let response1 = await axios(
        import.meta.env.VITE_API_URL + "/enquiries/" + id
      );
      let response2 = await axios(
        import.meta.env.VITE_API_URL + "/products/" + productId
      );
      let enq = response1.data;
      let pr = response2.data;
      if (enq == "Unauthorized") {
        showMessage("Session over. Login again");
      } else {
        // assign product to enquiry
        enq.product = pr.name;
        setEnquiry(enq);
        setRemarks(enq.remarks);
        document.title = enq.name;
      }
    } catch (error) {
      console.log(error);
      showMessage("Something went wrong, refresh the page");
    }
    setFlagLoad(false);
  }
  function handleWhatsappClick() {
    let message = "";
    let url =
      `https://api.whatsapp.com/send?phone=${enquiry.mobileNumber}&text=` +
      message;
    window.open(url, "_blank");
  }
  async function handleFormSubmit(event) {
    event.preventDefault();
    setFlagLoad(true);
    try {
      let response = await axios.post(
        import.meta.env.VITE_API_URL + "/enquiries/" + id + "/remarks",
        { remark: remark, user: user }
      );
      let r = await response.data;
      console.log(r);

      let re = [...remarks];
      re.push(r);
      // setEnquiry({ ...enquiry, remarks: re });
      setRemarks(re);
      setRemark("");
    } catch (error) {
      console.log(error);
      showMessage("Something went wrong, refresh the page");
    }
    setFlagLoad(false);
  }
  function handleTextAreaChange(event) {
    setRemark(event.target.value);
  }
  if (flagLoad) {
    return (
      <div className="my-5 text-center">
        <BeatLoader size={24} color={"blue"} />
      </div>
    );
  }
  function showMessage(message) {
    setMessage(message);
    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  }
  function handleDeleteButtonClick(index) {
    if (remarks.length == 1) {
      showMessage("At least one remark is required.");
      return;
    }
    setFlagDeleteButtonPressed(true);
    setSelectedIndex(index);
  }
  function handleModalCloseClick() {
    setFlagDeleteButtonPressed(false);
  }
  function handleModalButtonClick(ans) {
    setFlagDeleteButtonPressed(false);
    if (ans == "No") {
      // delete operation cancelled
      showMessage("Delete operation cancelled");
    } else if (ans == "Yes") {
      // delete operation allowed
      performDeleteOperation();
    }
  }
  async function performDeleteOperation() {
    try {
      let response = await axios.delete(
        import.meta.env.VITE_API_URL +
          "/enquiries/" +
          id +
          "/remarks/" +
          remarks[selectedIndex]._id
      );
      let rs = remarks.filter((e) => e._id != remarks[selectedIndex]._id);
      setRemarks(rs);
      showMessage("Delete operation successful");
    } catch (error) {
      console.log(error);
      showMessage("Something went wrong.");
    }
  }
  return (
    <>
      <InfoHeader
        enquiry={enquiry}
        message={message}
        onWhatsappClick={handleWhatsappClick}
      />
      <div className="container enquiry-remarks">
        <form onSubmit={handleFormSubmit}>
          <div className="row">
            <div className="col-8">
              <textarea
                cols="40"
                rows="5"
                style={{ resize: "none", padding: "5px" }}
                name="remark"
                value={remark}
                id=""
                placeholder="Add remark here"
                onChange={handleTextAreaChange}
              ></textarea>
            </div>
            <div className="col-2">
              <button className="btn btn-primary" type="submit">
                Add
              </button>
            </div>
          </div>
        </form>
        <div className="container">
          {remarks && (
            <>
              {remarks
                .slice()
                .reverse()
                .map((e, index) => (
                  <AEnquiryRemark
                    key={index}
                    enquiryRemark={e}
                    shownIndex={remarks.length - 1 - index}
                    onDeleteButtonClick={handleDeleteButtonClick}
                  />
                ))}
            </>
          )}
        </div>
      </div>
      {flagDeleteButtonPressed && (
        <Modal
          modalText={"Do you really want to delete the selected record."}
          btnGroup={["Yes", "No"]}
          onModalCloseClick={handleModalCloseClick}
          onModalButtonClick={handleModalButtonClick}
        />
      )}
    </>
  );
}
