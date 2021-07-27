import React from "react";

const LegacySearchLang = ({ children: value }) => {
  return (
    // html template starts here
    <span id="legacy_search_lang" className="context_item">
      {value}
    </span>
    // html template ends here
  );
};

export default LegacySearchLang;
