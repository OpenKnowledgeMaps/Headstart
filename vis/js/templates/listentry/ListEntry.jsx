import React from "react";

const ListEntry = ({ anchorId, children }) => {
  return (
    // html template starts here
    <div id="list_holder" className="resulttype-paper">
      <div className="list_entry">
        <a className="list_anchor" id={anchorId}></a>
        {children}
      </div>
    </div>
    // html template ends here
  );
};

export default ListEntry;
