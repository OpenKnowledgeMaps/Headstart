import React from "react";

const PreviewIcons = ({ link, onClickPDF, email }) => {
  // icons pool: https://fontawesome.com/cheatsheet
  return (
    // html template starts here
    <div className="list_links">
      {!!link && (
        <a href={link} target="_blank" className="outlink">
          LINK <span className="outlink_symbol">&#61633;</span>
        </a>
      )}
      {!!onClickPDF && (
        <a className="link2 oa-link" onClick={onClickPDF}>
          PDF <span className="outlink_symbol">&#61550;</span>
        </a>
      )}
      {!!email && (
        <a href={`mailto:${email}`} className="outlink">
          MAIL <span className="outlink_symbol">&#61664;</span>
        </a>
      )}
    </div>
    // html template ends here
  );
};

export default PreviewIcons;
