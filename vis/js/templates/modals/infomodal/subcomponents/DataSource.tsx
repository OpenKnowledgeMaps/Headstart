import React from "react";

interface DataSourceProps {
  source: string;
  contentProvider: string;
  description: string;
  logo: string;
}

const DataSource = ({ source, contentProvider, description, logo }: DataSourceProps) => {
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
