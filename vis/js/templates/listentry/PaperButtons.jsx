import React from "react";
import { connect } from "react-redux";

import useMatomo from "../../utils/useMatomo";
import { getPaperPDFClickHandler } from "../../utils/data";
import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";
import Highlight from "../../components/Highlight";

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
        <button className="paper_button main" onClick={handlePDFButtonClick}>
          <i className="far fa-file-pdf"></i>&nbsp;&nbsp;
          <Highlight>PDF</Highlight>
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
  // showCiteButton: ["base", "pubmed", "triple_km", "triple_sg"].includes(
  //   state.service
  // ),
  showCiteButton: state.list.citePapers,
  // showExportButton: ["base", "pubmed"].includes(state.service),
  showExportButton: state.list.exportPapers,
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps
)(PaperButtons);
