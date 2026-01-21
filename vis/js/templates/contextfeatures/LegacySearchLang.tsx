import React, { FC } from "react";
import { PropsWithChildren } from "../../types";

const LegacySearchLang: FC<PropsWithChildren> = ({ children }) => (
  <span id="legacy_search_lang" className="context_item">
    {children}
  </span>
);

export default LegacySearchLang;
