import React from "react";
import { connect } from "react-redux";

import { closeEmbedModal, closeViperEditModal, hidePreview } from "../actions";

import CitationModal from "../templates/modals/CitationModal";
import CitePaperModal from "../templates/modals/CitePaperModal";
import EmbedModal from "../templates/modals/EmbedModal";
import InfoModal from "../templates/modals/InfoModal";
import PdfModal from "../templates/modals/PdfModal";
import ViperEditModal from "../templates/modals/ViperEditModal";
import LocalizationProvider from "./LocalizationProvider";

const Modals = ({
  showEmbedModal,
  openEmbedModal,
  onEmbedClose,
  showViperEditModal,
  openViperEditModal,
  viperEditAcronym,
  viperEditTitle,
  viperEditObjID,
  onViperEditClose,
  showPDFPreview,
  previewedPaper,
  serverUrl,
  service,
  useViewer,
  onPreviewClose,
  showCitationModal,
  localization,
}) => {
  return (
    <LocalizationProvider localization={localization}>
      {showEmbedModal && (
        <EmbedModal open={openEmbedModal} onClose={onEmbedClose} />
      )}
      {showViperEditModal && (
        <ViperEditModal
          open={openViperEditModal}
          onClose={onViperEditClose}
          acronym={viperEditAcronym}
          title={viperEditTitle}
          objectID={viperEditObjID}
        />
      )}
      <InfoModal />
      {showPDFPreview && (
        <PdfModal
          open={!!previewedPaper}
          onClose={onPreviewClose}
          paper={previewedPaper}
          serverUrl={serverUrl}
          service={service}
          useViewer={useViewer}
        />
      )}
      {showCitationModal && <CitationModal />}
      <CitePaperModal />
    </LocalizationProvider>
  );
};

const mapStateToProps = (state) => ({
  showEmbedModal: state.modals.showEmbedButton,
  openEmbedModal: state.modals.openEmbedModal,
  showViperEditModal: state.modals.showViperEditButton,
  openViperEditModal: state.modals.openViperEditModal,
  viperEditAcronym: state.heading.acronym,
  viperEditTitle: state.heading.title,
  viperEditObjID: state.modals.viperEditObjID,
  showPDFPreview: state.modals.showPDFPreview,
  previewedPaper: state.modals.previewedPaper,
  serverUrl: state.modals.reloadApiProperties.headstartPath,
  service: state.service,
  useViewer: state.modals.useViewer,
  localization: state.localization,
  showCitationModal: state.modals.showCitationButton,
});

const mapDispatchToProps = (dispatch) => ({
  onEmbedClose: () => dispatch(closeEmbedModal()),
  onViperEditClose: () => dispatch(closeViperEditModal()),
  onPreviewClose: () => dispatch(hidePreview()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Modals);
