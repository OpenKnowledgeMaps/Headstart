import React from "react";
import { connect } from "react-redux";

import { closeEmbedModal, closeViperEditModal } from "../actions";

import EmbedModal from "../templates/modals/EmbedModal";
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
  localization: state.localization,
});

const mapDispatchToProps = (dispatch) => ({
  onEmbedClose: () => dispatch(closeEmbedModal()),
  onViperEditClose: () => dispatch(closeViperEditModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Modals);
