import React from "react";

const DataSource = ({ source, description, logo }) => {
  return (
    // html template starts here
    <>
      <h3>Data source</h3>
      <p>
        The data is taken from <strong className="hs-strong">{source}</strong>.{" "}
        {description}
      </p>
      {!!logo && <p className="datasource-logo">{logo}</p>}
    </>
    // html template ends here
  );
};

export default DataSource;
