// @ts-nocheck

import React from "react";

const DataSource = ({ source, contentProvider, description, logo }) => {
  const getDataSource = () => {
    if (!contentProvider) {
      return <strong className="hs-strong">{source}</strong>;
    }

    return (
      <>
        {contentProvider} (via {source})
      </>
    );
  };

  return (
    <>
      <h3>Data source</h3>
      <p>
        The data is taken from {getDataSource()}. {description}
      </p>
      {!!logo && <p className="datasource-logo">{logo}</p>}
    </>
  );
};

export default DataSource;
