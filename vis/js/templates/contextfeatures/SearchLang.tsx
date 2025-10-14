import React, { FC } from "react";
import ISO6391 from "iso-639-1";

import { useLocalizationContext } from "../../components/LocalizationProvider";

interface SearchLangProps {
  languageCode: string;
}

const SearchLang: FC<SearchLangProps> = ({ languageCode }) => {
  const loc = useLocalizationContext();

  const lang =
    languageCode === "all" ? loc.lang_all : ISO6391.getName(languageCode);

  return (
    <span id="search_lang" className="context_item">
      {lang}
    </span>
  );
};

export default SearchLang;
