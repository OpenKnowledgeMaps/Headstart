import React from "react";

import { getDateTimeFromTimestamp } from "../../utils/dates";

const StandardBuiltWith = ({
  timestamp,
  codebaseUrl,
  codebaseName,
  sourceUrl,
  sourceName,
}) => (
  <div className="builtwith" id="builtwith">
    Created {getDateTimeFromTimestamp(timestamp)} with{" "}
    <a
      href="https://github.com/OpenKnowledgeMaps/Headstart"
      target="_blank"
      rel="noreferrer"
    >
      Headstart
    </a>{" "}
    and{" "}
    <a href={codebaseUrl} target="_blank" rel="noreferrer">
      {codebaseName}
    </a>
    . All content retrieved from{" "}
    <a href={sourceUrl} target="_blank" rel="noreferrer">
      {sourceName}
    </a>
    .
  </div>
);

export default StandardBuiltWith;
