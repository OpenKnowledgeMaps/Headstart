import React from "react";
import { connect } from "react-redux";

import useMatomo from "../../utils/useMatomo";
import { getPaperPDFClickHandler } from "../../utils/data";
import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";
import Highlight from "../../components/Highlight";

const PaperButtons = ({ paper, handlePDFClick }) => {
  const { trackEvent } = useMatomo();

  const onPDFClick = getPaperPDFClickHandler(paper, handlePDFClick);

  const handlePDFButtonClick = () => {
    onPDFClick();
    trackEvent("List document", "Show PDF preview", "PDF button");
  };

  return (
    // html template starts here
    <div className="paper_buttons_row">
      {!!onPDFClick && (
        <button className="paper_button" onClick={handlePDFButtonClick}>
          <i className="fa fa-eye"></i>&nbsp;&nbsp;<Highlight>PDF</Highlight>
        </button>
      )}
    </div>
    // html template ends here
  );
};

export default connect(null, mapDispatchToListEntriesProps)(PaperButtons);
