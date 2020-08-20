import React from "react";

const Timestamp = ({ value, label }) => {
  return (
    // html template starts here
    <span id="timestamp">
      {label}: {value}
    </span>
    // html template ends here
  );
};

export default Timestamp;
