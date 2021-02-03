import React from "react";
import { connect } from "react-redux";

import {
  closeEmbedModal,
  closeViperEditModal,
  closeInfoModal,
} from "../actions";

import EmbedModal from "../templates/modals/EmbedModal";
import InfoModal from "../templates/modals/InfoModal";
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
  localization: state.localization,
});

const mapDispatchToProps = (dispatch) => ({
  onEmbedClose: () => dispatch(closeEmbedModal()),
  onViperEditClose: () => dispatch(closeViperEditModal()),
  onInfoClose: () => dispatch(closeInfoModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Modals);
