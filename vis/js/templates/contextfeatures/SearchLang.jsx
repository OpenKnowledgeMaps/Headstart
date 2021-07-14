import React from "react";

import { useLocalizationContext } from "../../components/LocalizationProvider";

const SearchLang = ({ children: value }) => {
  const localization = useLocalizationContext();

  const lang = localization[`lang_${value}`] || value;

  return (
    // html template starts here
    <span id="search_lang" className="context_item">
      {lang}
    </span>
    // html template ends here
  );
};

export default SearchLang;
