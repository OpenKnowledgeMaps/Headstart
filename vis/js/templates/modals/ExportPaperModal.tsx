// @ts-nocheck

import React from "react";
import { connect } from "react-redux";

import { Modal } from "react-bootstrap";
import { hideExportPaper } from "../../actions";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import usePaperExport from "../../utils/usePaperExport";
import Loading from "./exportmodal/Loading";
import Content from "./exportmodal/Content";
import Error from "./exportmodal/Error";

const ExportPaperModal = ({ open, onClose, paper, serverUrl }) => {
  const loc = useLocalizationContext();

  const exp = usePaperExport(paper, serverUrl);

  const hasFailed = exp && (exp.error || exp.content === "");

  const renderBody = () => {
    // no data = closed modal
    if (!paper) {
      return null;
    }
    // loading in progress
    if (!exp) {
      return <Loading />;
    }
    // error while loading
    if (hasFailed) {
      return <Error />;
    }
    // successfully loaded
    if (exp.content) {
      return (
        <Content paper={paper} serverUrl={serverUrl}>
          {exp.content}
        </Content>
      );
    }
    // fallback
    return null;
  };

  return (
    // html template starts here
    <Modal id="export_paper_modal" show={open} onHide={onClose}>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title
          id="export-paper-title"
          className="export-paper-modal-title"
          style={{ fontSize: 20, color: hasFailed ? "#e55137" : undefined }}
        >
          {loc.export_paper + (hasFailed ? " - connection lost" : "")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">{renderBody()}</Modal.Body>
    </Modal>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  open: state.modals.exportedPaper !== null,
  paper: state.modals.exportedPaper,
  serverUrl: state.modals.apiProperties.headstartPath,
});

const mapDispatchToProps = (dispatch) => ({
  onClose: () => dispatch(hideExportPaper()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExportPaperModal);
