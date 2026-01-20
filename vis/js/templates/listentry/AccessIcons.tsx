import React, { FC } from "react";
import Highlight from "../../components/Highlight";
import Tags from "./Tags";
import { AllPossiblePapersType } from "../../types";

const datasetPredicate = (e: string) => e.toLowerCase() === "dataset";
const unknownPredicate = (e: string) => e.toLowerCase().includes("unknown");

interface AccessIconsProps {
  paper: AllPossiblePapersType;
  showDocTypes: boolean;
}

const AccessIcons: FC<AccessIconsProps> = ({ paper, showDocTypes }) => {
  const isDataset = paper.resulttype.some(datasetPredicate);

  const tags = [...paper.tags];
  if (showDocTypes) {
    tags.push(
      ...paper.resulttype
        .filter((e) => !datasetPredicate(e))
        .filter((e) => !unknownPredicate(e))
        .slice(0, isDataset ? 1 : 2),
    );
  }

  return (
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
  );
};

export default AccessIcons;
