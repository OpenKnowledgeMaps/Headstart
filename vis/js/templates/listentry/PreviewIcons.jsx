import React from "react";

const PreviewIcons = ({ link, onClickPDF }) => {
  return (
    // html template starts here
    <div className="list_links">
      {!!link && (
        <a href={link} target="_blank" rel="noreferrer" className="outlink">
          LINK <span className="outlink_symbol">&#61633;</span>
        </a>
      )}
      {!!onClickPDF && (
        <a className="link2 oa-link" onClick={onClickPDF}>
          PDF <span className="outlink_symbol">&#61550;</span>
        </a>
      )}
    </div>
    // html template ends here
  );
};

export default PreviewIcons;
