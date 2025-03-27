// @ts-nocheck
import React from "react";

const BasicTitle = ({ title }: {
  title: string;
}) => {
  // dangerously Setting the Inner HTML because of e.g. Covis, where the basic title is HTML
  // the span must be here so the dangerouslySetInnerHTML works
  return <span dangerouslySetInnerHTML={{ __html: title }}></span>;
};

export default BasicTitle;
