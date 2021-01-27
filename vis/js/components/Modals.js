import React from "react";
import { connect } from "react-redux";

import { closeEmbedModal } from "../actions";

import EmbedModal from "../templates/modals/EmbedModal";
import LocalizationProvider from "./LocalizationProvider";

const Modals = ({
  showEmbedModal,
  openEmbedModal,
  onEmbedClose,
  localization,
}) => {
  return (
    <LocalizationProvider localization={localization}>
      {showEmbedModal && (
        <EmbedModal open={openEmbedModal} onClose={onEmbedClose} />
      )}
    </LocalizationProvider>
  );
};

const mapStateToProps = (state) => ({
  showEmbedModal: state.modals.showEmbedButton,
  openEmbedModal: state.modals.openEmbedModal,
  localization: state.localization,
});

const mapDispatchToProps = (dispatch) => ({
  onEmbedClose: () => dispatch(closeEmbedModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Modals);
