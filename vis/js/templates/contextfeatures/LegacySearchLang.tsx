import React, { FC, PropsWithChildren, ReactNode } from "react";

interface LegacySearchLangProps {
  children: ReactNode;
}

const LegacySearchLang: FC<LegacySearchLangProps> = ({ children }) => (
  <span id="legacy_search_lang" className="context_item">
    {children}
  </span>
);

export default LegacySearchLang;
