export default function CheckBoxHeaders(props) {
  let { showInList } = props;
  function handleListCheckBoxClick(checked, selectedIndex) {
    props.onListCheckBoxClick(checked, selectedIndex);
  }
  return (
    <div className="row  my-2 mx-auto p-1">
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
  );
}
