import React from "react";
import {LangOptions} from "../../lang/lang_options.js";
import useMatomo from "../../utils/useMatomo";
import HoverPopover from "../HoverPopover";


const DocumentLang = ({value, popoverContainer}) => {

    const {trackEvent} = useMatomo();

    // was an issue to left "All Languages" as default value in the context if no lang_id in parameters
    value = value || 'all-lang'  // Default value for value parameter

    // popover messages
    const allLangMessage = "All languages were taken into consideration in the creation of this visualisation. Please note " +
        "that not all of them may appear in the visualisation. ";
    const multLangMessage = "The following languages were taken into consideration in the creation of this visualisation. " +
        "Please note that not all of them may appear in the visualisation: ";


    let lang = ''
    let lang_list = null
    let popoverText = ''

    // exists 2 types: string and object in lang_id parameter
    if (typeof value === 'string') {
        const selectedLangOption = LangOptions.find(langOption => langOption.id === value);
        lang = selectedLangOption ? selectedLangOption.label : '';
        popoverText = (value === 'all-lang') ? allLangMessage : (lang.length > 10 && selectedLangOption?.label) || '';
        if (lang.length > 10 && value !== 'all-lang') {
            lang = cutString(lang, 10);
        }
    }

    if (Array.isArray(value)) {
        if (value.length === 1 && value[0] === 'all-lang') {
            popoverText = allLangMessage;
            lang = LangOptions.filter((item) => item.id === value[0] && item)[0].label
        } else if (value.length === 1) {
            lang = LangOptions.filter((item) => item.id === value[0] && item)[0].label
            popoverText = lang.length > 10 ? lang : '';
            if (lang.length > 10 && value[0] !== 'all-lang') {
                lang = cutString(lang, 10);
            }
        } else {
            lang = "Languages";
            lang_list = value
                .map(langId => LangOptions.find(langOption => langOption.id === langId)?.label)
                .join(', ');
            popoverText = multLangMessage;
        }
    }

    const trackMouseEnter = () =>
        trackEvent("Title & Context line", "Hover languages", "Context line");

    return (
        <>
            {popoverText
                // if multiple languages were selected, then show popover
                ? <span
                    id="document_types"
                    className="context_item"
                    onMouseEnter={trackMouseEnter}
                >
                    <HoverPopover
                        id="lang-popover"
                        size="wide"
                        container={popoverContainer}
                        content={
                            <>
                                {popoverText}
                                {lang_list ?
                                    <div style={{marginTop: '15px'}}>{lang_list}</div>
                                    : null
                                }
                            </>
                        }
                    >
                      <span className="context_moreinfo">{lang}</span>
                    </HoverPopover>
                </span>

                // if only one language with label length < 10 was selected, show it without popover
                : <span id="document_lang" className="context_item">
                    {lang}
                </span>
            }
        </>
    );
};

export default DocumentLang;

//  cutString function for shortening long language names
export function cutString(str, length) {
    if (str.length > length) {
        return str.substring(0, length) + '...';
    }
    return str;
}
