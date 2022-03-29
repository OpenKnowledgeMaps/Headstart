import React from "react";
import { getIcon } from "../listentry/Tags";

const Icons = ({ paper, iconClasses }) => {
  const { oa: isOpenAccess, free_access: isFreeAccess } = paper;

  const doctypeIcons = paper.resulttype
    .map((type) => getIcon(type))
    .filter((icon) => icon !== null);

  return (
    <div className="icons">
      {isOpenAccess && (
        <p className={"open-access-logo " + iconClasses}>
          <i className="fas fa-lock-open"></i>
        </p>
      )}
      {isFreeAccess && (
        <p className={"free-access-logo " + iconClasses}>
          <i className="fas fa-lock-open"></i>
        </p>
      )}
      {doctypeIcons.map((icon) => (
        <p key={icon} className={"dataset-icon " + iconClasses}>
          <i className={icon}></i>
        </p>
      ))}
    </div>
  );
};

export default React.memo(Icons);
