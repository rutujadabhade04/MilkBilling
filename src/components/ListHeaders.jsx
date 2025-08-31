export default function ListHeaders(props) {
  let { showInList } = props;
  let { sortedField } = props;
  let { direction } = props;
  function handleHeaderClick(index) {
    props.onHeaderClick(index);
  }
  return (
    <>
      {showInList.map(
        (e, index) =>
          e.show && (
            <div className={"col-2 "} key={index}>
              <a
                href="#"
                className={
                  sortedField == e.attribute ? " text-large text-danger" : ""
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
    </>
  );
}
