import React from "react";
import { connect } from "react-redux";

import useMatomo from "../../utils/useMatomo";
import { getPaperPDFClickHandler } from "../../utils/data";
import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";

const PaperButtons = ({
  paper,
  showCiteButton,
  showExportButton,
  handlePDFClick,
  handleCiteClick,
  handleExportClick,
}) => {
  const { trackEvent } = useMatomo();

  const onPDFClick = getPaperPDFClickHandler(paper, handlePDFClick);

  const handlePDFButtonClick = () => {
    onPDFClick();
    trackEvent("List document", "Show PDF preview", "PDF button");
  };

  const handleCiteButtonClick = () => {
    handleCiteClick(paper);
    trackEvent("List document", "Open paper citation", "Cite paper button");
  };

  const handleExportButtonClick = () => {
    handleExportClick(paper);
    trackEvent("List document", "Open paper export", "Export paper button");
  };

  return (
    // html template starts here
    <div className="paper_buttons_row">
      {!!onPDFClick && (
        <button className="paper_button" onClick={handlePDFButtonClick}>
          <i className="fa fa-eye"></i>&nbsp;&nbsp;PDF
        </button>
      )}
      {showCiteButton && (
        <button className="paper_button" onClick={handleCiteButtonClick}>
          <i className="fa fa-quote-right"></i>&nbsp;&nbsp;Cite as
        </button>
      )}
      {showExportButton && (
        <button className="paper_button" onClick={handleExportButtonClick}>
          <i className="fa fa-arrow-down"></i>&nbsp;&nbsp;Export
        </button>
      )}
    </div>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  showCiteButton: ["base", "pubmed"].includes(state.service),
  showExportButton: ["base", "pubmed"].includes(state.service),
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps
)(PaperButtons);
