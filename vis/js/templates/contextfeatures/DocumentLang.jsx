import React from "react";
import {LangOptions} from "../../lang/lang_options.js";

const DocumentLang = ({value}) => {

    const lang = LangOptions.filter((item) => item.id === value && item)[0].label

    return (
        // html template starts here
        <span id="document_lang" className="context_item">
            {lang}
        </span>
        // html template ends here
    );
};

export default DocumentLang;
