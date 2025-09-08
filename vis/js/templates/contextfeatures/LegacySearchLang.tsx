import React, { FC } from "react";
import { PropsWithChildren } from "../../@types/common-components-props";

const LegacySearchLang: FC<PropsWithChildren> = ({ children }) => (
  <span id="legacy_search_lang" className="context_item">
    {children}
  </span>
);

export default LegacySearchLang;
