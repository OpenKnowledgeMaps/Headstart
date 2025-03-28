// @ts-nocheck
import React from "react";
import Hyphenated from "react-hyphen";

const Hyphenate = ({ children }: {
  children: React.ReactNode;
}) => {
  return <Hyphenated>{children}</Hyphenated>;
};

export default Hyphenate;
