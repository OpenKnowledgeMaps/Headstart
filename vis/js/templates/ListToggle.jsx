import React from "react";

const ListToggle = ({ toggleLabel, docsNumber, docsNumberLabel, onClick }) => {
  return (
    // html template starts here
    // TODO in the next refactoring step, move the div here and remove
    // the onClick events from children
    //<div id="show_hide_button" className="row" onClick={onClick}>
    <>
      <div className="col-xs-2" onClick={onClick}>▼</div>
      <div className="col-xs-8" id="show_hide_button_label" onClick={onClick}>
        <span id="show_hide_label">
          <span>
            {toggleLabel}{" "}
            <span id="list_item_banner">
              (<span id="list_item_count">{docsNumber}</span> {docsNumberLabel})
            </span>
          </span>
        </span>
      </div>
      <div className="col-xs-2 text-right" onClick={onClick}>▼</div>
    </>
    //</div>
    // html template ends here
  );
};

export default ListToggle;
