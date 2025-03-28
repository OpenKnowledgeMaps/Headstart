// @ts-nocheck

import React from "react";

import Highlight from "../../components/Highlight";
import Tags from "./Tags";

const datasetPredicate = (e) => e.toLowerCase() === "dataset";
const unknownPredicate = (e) => e.toLowerCase().includes("unknown");

const AccessIcons = ({ paper, showDocTypes }) => {
  const isDataset = paper.resulttype.some(datasetPredicate);

  const tags = [...paper.tags];
  if (showDocTypes) {
    tags.push(
      ...paper.resulttype
        .filter((e) => !datasetPredicate(e))
        .filter((e) => !unknownPredicate(e))
        .slice(0, isDataset ? 1 : 2)
    );
  }

  return (
    // html template starts here
    <div id="oa">
      {!!paper.oa && (
        <span className="paper-tag open-access-tag">
          <span className="access_icon outlink_symbol">
            <i className="fas fa-lock-open"></i>
          </span>
          <Highlight>open access</Highlight>
        </span>
      )}
      {!!paper.free_access && (
        <span className="paper-tag free-access-tag">
          <span className="access_icon outlink_symbol">
            <i className="fas fa-lock-open"></i>
          </span>
          <Highlight>free access</Highlight>
        </span>
      )}
      {isDataset && (
        <span className="paper-tag dataset-tag">
          <span className="fas fa-database access_icon"></span>
          <Highlight>dataset</Highlight>
        </span>
      )}
      {tags.length > 0 && <Tags values={tags} />}
    </div>
    // html template ends here
  );
};

export default AccessIcons;
