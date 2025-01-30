// @ts-nocheck

import React from "react";

import Highlight from "../../components/Highlight";

const Tags = ({ values }) => {
  return (
    // html template starts here
    <div className="tags">
      {values.map((tag) => (
        <Tag key={tag}>{tag}</Tag>
      ))}
    </div>
    // html template ends here
  );
};

export default Tags;

// column B to D
// https://docs.google.com/spreadsheets/d/112Anbf-sJYkehyFvjuxr1DuMih-fPB9nt3E8ll19Iyc/edit?gid=2080652987#gid=2080652987
export const getIcon = (tag) => {
  if (tag.toLowerCase() === "audio" || tag.toLowerCase) {
    return "fas fa-music";
  }

  if (tag.toLowerCase() === "software") {
    return "fas fa-code";
  }

  if (tag.toLowerCase() === "moving image/video") {
    return "fas fa-video";
  }

  if (tag.toLowerCase() === "image/video") {
    return "fas fa-photo-video";
  }

  if (tag.toLowerCase() === "still image") {
    return "fas fa-image";
  }

  if (tag.toLowerCase() === "map") {
    return "fas fa-map";
  }

  if (tag.toLowerCase() === "dataset") {
    return "fas fa-database";
  }

  return null;
};

const Tag = ({ children: tag }) => {
  const faIcon = getIcon(tag);

  return (
    <div className="paper-tag">
      {!!faIcon && <span className={`access_icon ${faIcon}`}></span>}
      <Highlight>{tag}</Highlight>
    </div>
  );
};
