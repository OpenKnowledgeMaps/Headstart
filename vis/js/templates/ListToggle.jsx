import React from "react";

const ListToggle = ({ toggleLabel, docsNumber, docsNumberLabel, onClick }) => {
  return (
    // html template starts here
    <div id="show_hide_button" className="row" onClick={onClick}>
      <div className="col-xs-2">▼</div>
      <div className="col-xs-8" id="show_hide_button_label">
        <span id="show_hide_label">
          <span>
            {toggleLabel}{" "}
            <span id="list_item_banner">
              (<span id="list_item_count">{docsNumber}</span> {docsNumberLabel})
            </span>
          </span>
        </span>
      </div>
      <div className="col-xs-2 text-right">▼</div>
    </div>
    // html template ends here
  );
};

export default ListToggle;
