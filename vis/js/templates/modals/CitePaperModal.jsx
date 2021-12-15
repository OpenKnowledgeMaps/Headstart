import React, { useEffect } from "react";
import { connect } from "react-redux";

import { Modal, Button } from "react-bootstrap";
import { hideCitePaper } from "../../actions";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import useCitationStyle, {
  availableStyles,
} from "../../utils/useCitationStyle";
import { useState } from "react";
import selectText from "../../utils/selectText";

const CitePaperModal = ({ open, onClose, paper }) => {
  const loc = useLocalizationContext();
  const [copied, setCopied] = useState(false);
  const [currentStyle, setStyle, getCitation] = useCitationStyle();

  useEffect(() => {
    setCopied(false);
  }, [paper, currentStyle]);

  if (!paper) {
    return null;
  }

  const citationText = getCitation(paper);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(citationText).then(() => {
      selectText("copy-citation");
      setCopied(true);
    });
  };

  const metadataMissing =
    !paper.title ||
    !paper.authors_objects ||
    paper.authors_objects.length === 0 ||
    !paper.year;

  return (
    // html template starts here
    <Modal id="cite_paper_modal" show={open} onHide={onClose}>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title
          id="cite-title"
          className="cite-paper-modal-title"
          style={{ fontSize: 20 }}
        >
          {loc.cite_paper}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body id="cite-body" className="modal-body">
        <p>
          {availableStyles.map((s) => (
            <span
              key={s.id}
              onClick={() => setStyle(s)}
              className={
                "cit-style-label" +
                (s.id === currentStyle.id ? " selected" : "")
              }
            >
              {s.name}
            </span>
          ))}
        </p>
        <div id="copy-citation" className="citation">
          {citationText}
        </div>
        <p className="cit-style-desc">{currentStyle.description}</p>
        <Button
          bsStyle="primary"
          onClick={handleCopyClick}
          className={copied ? "copied-button" : "copy-button"}
        >
          <i className="fa fa-copy"></i>
          &nbsp;&nbsp;
          {copied ? loc.copied_button_text : loc.embed_button_text}
        </Button>
        {metadataMissing && (
          <p className="cite-paper-warning">
            <strong>{loc.cite_metadata_warn_1}</strong>{" "}
            {loc.cite_metadata_warn_2}{" "}
            <a
              href={
                paper.list_link.isDoi
                  ? `https://dx.doi.org/${paper.list_link.address}`
                  : paper.list_link.address
              }
              target="_blank"
              rel="noreferrer"
            >
              {loc.cite_metadata_warn_3}
            </a>
            .
          </p>
        )}
      </Modal.Body>
    </Modal>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  open: state.modals.citedPaper !== null,
  paper: state.modals.citedPaper,
});

const mapDispatchToProps = (dispatch) => ({
  onClose: () => dispatch(hideCitePaper()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CitePaperModal);
