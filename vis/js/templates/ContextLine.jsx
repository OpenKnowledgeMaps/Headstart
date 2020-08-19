import React from "react";

const ContextLine = ({
  author, // React component: contextfeatures/Author.jsx
  numArticles, // React component: contextfeatures/NumArticles.jsx
  dataSource = null, // config.service_name || config.service_names[context.service]
  dataSourceLabel, // config.localization[config.language].source_label
  timespan = null, // string composed from config data
  docTypes, // React component: contextfeatures/DocumentTypes*.jsx
  paperCount = null, // context.num_papers
  paperCountLabel, // config.localization[config.language].paper_count_label
  datasetCount = null, // context.num_datasets
  datasetCountLabel, // config.localization[config.language].dataset_count_label
  funder = null, // context.params.funder
  projectRuntime = null, // string composed from config data
  searchLang = null, // string composed from multiple params in config.options.languages
  timestamp = null, // context.last_update
  timestampLabel, // config.localization[config.language].timestamp_label
}) => {
  return (
    // html template starts here
    <>
      {author}
      {numArticles}
      {dataSource !== null && (
        <span
          id="source"
          dangerouslySetInnerHTML={{
            __html: `${dataSourceLabel}: ${dataSource}`,
          }}
        ></span>
      )}
      {timespan !== null && <span id="timespan">{timespan}</span>}
      {docTypes}
      {paperCount !== null && (
        <span id="context-paper_count">
          {paperCount} {paperCountLabel}
        </span>
      )}
      {datasetCount !== null && (
        <span id="context-dataset_count">
          {datasetCount} {datasetCountLabel}
        </span>
      )}
      {funder !== null && <span id="context-funder">Funder: {funder}</span>}
      {projectRuntime !== null && (
        <span id="context-project_runtime">{projectRuntime}</span>
      )}
      {searchLang !== null && <span id="search_lang">{searchLang}</span>}
      {timestamp !== null && (
        <span id="timestamp">
          {timestampLabel}: {timestamp}
        </span>
      )}
    </>
    // html template ends here
  );
};

export default ContextLine;
