import React from "react";
import { connect } from "react-redux";

import useMatomo from "../../utils/useMatomo";
import { getPaperPDFClickHandler } from "../../utils/data";
import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";
import Highlight from "../../components/Highlight";

const PaperButtons = ({
  paper,
  showCiteButton,
  noCitationDoctypes,
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

  noCitationDoctypes = noCitationDoctypes.map((t) => t.toLowerCase());
  const hasCiteButton =
    showCiteButton &&
    !paper.resulttype.some((t) => noCitationDoctypes.includes(t.toLowerCase()));

  return (
    // html template starts here
    <div className="paper_buttons_row">
      {!!onPDFClick && (
        <button
          className="paper_button main"
          title="Open the PDF"
          onClick={handlePDFButtonClick}
        >
          <i className="far fa-file-pdf"></i>&nbsp;&nbsp;
          <Highlight>PDF</Highlight>
        </button>
      )}
      {hasCiteButton && (
        <button
          className="paper_button"
          title="Cite this document"
          onClick={handleCiteButtonClick}
        >
          <i className="fa fa-quote-right"></i>&nbsp;&nbsp;Cite as
        </button>
      )}
      {showExportButton && (
        <button
          className="paper_button"
          title="Export this document"
          onClick={handleExportButtonClick}
        >
          <i className="fa fa-arrow-down"></i>&nbsp;&nbsp;Export
        </button>
      )}
    </div>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  showCiteButton: state.list.citePapers,
  noCitationDoctypes: state.list.noCitationDoctypes,
  showExportButton: state.list.exportPapers,
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps
)(PaperButtons);
