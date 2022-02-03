import React from "react";
import { connect } from "react-redux";

import useMatomo from "../../utils/useMatomo";
import { getPaperPDFClickHandler } from "../../utils/data";
import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";
import Highlight from "../../components/Highlight";

const PaperButtons = ({
  paper,
  showCiteButton,
  handlePDFClick,
  handleCiteClick,
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

  return (
    // html template starts here
    <div className="paper_buttons_row">
      {!!onPDFClick && (
        <button className="paper_button main" onClick={handlePDFButtonClick}>
          <i className="far fa-file-pdf"></i>&nbsp;&nbsp;<Highlight>PDF</Highlight>
        </button>
      )}
      {showCiteButton && (
        <button className="paper_button" onClick={handleCiteButtonClick}>
          <i className="fa fa-quote-right"></i>&nbsp;&nbsp;Cite as
        </button>
      )}
    </div>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  showCiteButton: ["base", "pubmed"].includes(state.service),
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps
)(PaperButtons);
