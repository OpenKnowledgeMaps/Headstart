import React from "react";

const LegacySearchLang = ({ children }: {
  children: React.ReactNode;
}) => {
  return (
    // html template starts here
    <span id="legacy_search_lang" className="context_item">
      {children}
    </span>
    // html template ends here
  );
};

export default LegacySearchLang;
