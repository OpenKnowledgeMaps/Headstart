import React from "react";
import { connect } from "react-redux";

import {
  closeEmbedModal,
  closeViperEditModal,
  closeInfoModal,
  hidePreview,
} from "../actions";

import EmbedModal from "../templates/modals/EmbedModal";
import ImageModal from "../templates/modals/ImageModal";
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
  openInfoModal,
  infoContent,
  onInfoClose,
  showImagePreview,
  showPDFPreview,
  previewedPaper,
  serverUrl,
  service,
  useViewer,
  onPreviewClose,
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
      <InfoModal
        open={openInfoModal}
        onClose={onInfoClose}
        title={infoContent.title}
        body={infoContent.body}
        params={infoContent.dynamic ? infoContent.params : null}
      />
      {showImagePreview && (
        <ImageModal
          open={!!previewedPaper}
          onClose={onPreviewClose}
          paperID={previewedPaper ? previewedPaper.id : null}
        />
      )}
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
  openInfoModal: state.modals.openInfoModal,
  infoContent: state.modals.infoContent,
  showImagePreview: state.modals.showImagePreview,
  showPDFPreview: state.modals.showPDFPreview,
  previewedPaper: state.modals.previewedPaper,
  serverUrl: state.modals.reloadApiProperties.headstartPath,
  service: state.modals.service,
  useViewer: state.modals.useViewer,
  localization: state.localization,
});

const mapDispatchToProps = (dispatch) => ({
  onEmbedClose: () => dispatch(closeEmbedModal()),
  onViperEditClose: () => dispatch(closeViperEditModal()),
  onInfoClose: () => dispatch(closeInfoModal()),
  onPreviewClose: () => dispatch(hidePreview()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Modals);
