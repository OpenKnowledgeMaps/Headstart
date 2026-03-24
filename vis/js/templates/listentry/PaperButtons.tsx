import React, { FC } from "react";
import { connect } from "react-redux";

import Highlight from "../../components/Highlight";
import { AllPossiblePapersType, State } from "../../types";
import { getPaperPDFClickHandler } from "../../utils/data";
import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";
import useMatomo from "../../utils/useMatomo";
import { isNonTextDocument } from "../Paper";

interface PaperButtonsProps {
  paper: AllPossiblePapersType;
  showCiteButton: boolean;
  showExportButton: boolean;
  noCitationDoctypes: string[];
  handlePDFClick: (paper: AllPossiblePapersType) => void;
  handleCiteClick: (paper: AllPossiblePapersType) => void;
  handleExportClick: (paper: AllPossiblePapersType) => void;
}

const PaperButtons: FC<PaperButtonsProps> = ({
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
    trackEvent("List document", "Show PDF preview", "PDF button");

    if (onPDFClick) {
      onPDFClick();
    }
  };

  const handleCiteButtonClick = () => {
    handleCiteClick(paper);
    trackEvent("List document", "Open paper citation", "Cite paper button");
  };

  const handleExportButtonClick = () => {
    handleExportClick(paper);
    trackEvent("List document", "Open paper export", "Export paper button");
  };

  const isText = !isNonTextDocument(paper);

  noCitationDoctypes = noCitationDoctypes.map((t: string) => t.toLowerCase());
  const hasCiteButton =
    showCiteButton &&
    !paper.resulttype.some((t: string) =>
      noCitationDoctypes.includes(t.toLowerCase()),
    );

  return (
    // html template starts here
    <div className="paper_buttons_row">
      {isText && !!onPDFClick && (
        <button
          className="paper_button main"
          title="Open the PDF"
          onClick={handlePDFButtonClick}
        >
          <i className="far fa-file-pdf"></i>&nbsp;&nbsp;
          {/* @ts-ignore */}
          <Highlight>PDF</Highlight>
        </button>
      )}
      {/*add paper.oa condition to avoid show file button if no access */}
      {!!paper.oa && !isText && (
        <a
          href={paper.list_link.address}
          title="Open the file"
          target="_blank"
          rel="noreferrer"
        >
          <div className="paper_button main">
            <i className="far fa-file"></i>&nbsp;&nbsp;
            {/* @ts-ignore */}
            <Highlight>File</Highlight>
          </div>
        </a>
      )}
      {hasCiteButton && (
        <button
          className="paper_button"
          title="Cite this resource"
          onClick={handleCiteButtonClick}
        >
          <i className="fa fa-quote-right"></i>&nbsp;&nbsp;Cite as
        </button>
      )}
      {showExportButton && (
        <button
          className="paper_button"
          title="Export this resource"
          onClick={handleExportButtonClick}
        >
          <i className="fa fa-arrow-down"></i>&nbsp;&nbsp;Export
        </button>
      )}
    </div>
    // html template ends here
  );
};

const mapStateToProps = (state: State) => ({
  showCiteButton: state.list.citePapers,
  noCitationDoctypes: state.list.noCitationDoctypes,
  showExportButton: state.list.exportPapers,
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps,
)(PaperButtons);
