import React from "react";

const Readers = ({ number, label }) => {
  return (
    // html template starts here
    <div className="list_readers">
      <span className="list_readers_entity">{label}</span>{" "}
      <span className="num_readers">{number}</span>&nbsp;
    </div>
    // html template ends here
  );
};

export default Readers;
