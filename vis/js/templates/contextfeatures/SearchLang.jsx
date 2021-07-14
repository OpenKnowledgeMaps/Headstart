import React from "react";
import ISO6391 from "iso-639-1";

import { useLocalizationContext } from "../../components/LocalizationProvider";

const SearchLang = ({ children: langCode }) => {
  const localization = useLocalizationContext();

  const lang =
    langCode === "all" ? localization.lang_all : ISO6391.getName(langCode);

  return (
    // html template starts here
    <span id="search_lang" className="context_item">
      {lang}
    </span>
    // html template ends here
  );
};

export default SearchLang;
