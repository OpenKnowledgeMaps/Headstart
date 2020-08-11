import React from "react";

const Popover = ({label, text}) => {
  return (
    // html template starts here
    <span
      id="modifier"
      className="modifier context_moreinfo"
      data-toggle="popover"
      data-trigger="hover"
      data-content={text}
      data-original-title=""
      title=""
    >
      {label}{" "}
    </span>
    // html template ends here
  );
};

export default Popover;
