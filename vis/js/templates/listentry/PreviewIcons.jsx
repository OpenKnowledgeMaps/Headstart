import React from "react";
import useMatomo from "../../utils/useMatomo";

const PreviewIcons = ({ link, onClickPDF }) => {
  const { trackEvent } = useMatomo();

  const trackLinkClick = () => {
    trackEvent("List document", "Open paper link", "Button link");
  };

  const handlePDFClick = (event) => {
    event.preventDefault();
    onClickPDF();
    trackEvent("List document", "Show PDF preview", "PDF button");
  };

  return (
    // html template starts here
    <div className="list_links">
      {!!link && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="outlink"
          onClick={trackLinkClick}
        >
          LINK <span className="outlink_symbol">&#61633;</span>
        </a>
      )}
      {!!onClickPDF && (
        <a className="link2 oa-link" onClick={handlePDFClick}>
          PDF <span className="outlink_symbol">&#61550;</span>
        </a>
      )}
    </div>
    // html template ends here
  );
};

export default PreviewIcons;
