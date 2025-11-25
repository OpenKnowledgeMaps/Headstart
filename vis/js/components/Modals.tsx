// @ts-nocheck

import React from "react";
import { connect } from "react-redux";

import { closeEmbedModal, hidePreview } from "../actions";
import CitationModal from "../templates/modals/CitationModal";
import CitePaperModal from "../templates/modals/CitePaperModal";
import EmbedModal from "../templates/modals/EmbedModal";
import ExportPaperModal from "../templates/modals/ExportPaperModal";
import InfoModal from "../templates/modals/InfoModal";
import PdfModal from "../templates/modals/PdfModal";
import ResearcherInfoModal from "../templates/modals/ResearcherInfoModal";
import ResearcherMetricsInfoModal from "../templates/modals/ResearcherMetricsInfoModal";
import LocalizationProvider from "./LocalizationProvider";

const Modals = ({
  showEmbedModal,
  openEmbedModal,
  onEmbedClose,
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
      <InfoModal />
      <ResearcherMetricsInfoModal />
      <ResearcherInfoModal />
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
      <ExportPaperModal />
    </LocalizationProvider>
  );
};

const mapStateToProps = (state) => ({
  showEmbedModal: state.modals.showEmbedButton,
  openEmbedModal: state.modals.openEmbedModal,
  showPDFPreview: state.modals.showPDFPreview,
  previewedPaper: state.modals.previewedPaper,
  serverUrl: state.modals.apiProperties.headstartPath,
  service: state.service,
  useViewer: state.modals.useViewer,
  localization: state.localization,
  showCitationModal: state.modals.showCitationButton,
});

const mapDispatchToProps = (dispatch) => ({
  onEmbedClose: () => dispatch(closeEmbedModal()),
  onPreviewClose: () => dispatch(hidePreview()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Modals);
