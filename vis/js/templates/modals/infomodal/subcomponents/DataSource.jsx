import React from "react";

const DataSource = ({ source, description }) => {
  return (
    // html template starts here
    <>
      <h3>Data source</h3>
      <p>
        The data is taken from <strong>{source}</strong>.
      </p>
      {description}
    </>
    // html template ends here
  );
};

export default DataSource;
