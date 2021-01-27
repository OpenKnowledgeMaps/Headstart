import React from "react";
import { connect } from "react-redux";

import { openEmbedModal } from "../actions";

import EmbedButton from "../templates/buttons/EmbedButton";
import ShareButton from "../templates/buttons/ShareButton";
import LocalizationProvider from "./LocalizationProvider";

const ModalButtons = ({
  showShareButton,
  twitterHashtags,
  showEmbedButton,
  onEmbedButtonClick,
  localization,
}) => {
  return (
    <LocalizationProvider localization={localization}>
      {showShareButton && <ShareButton twitterHashtags={twitterHashtags} />}
      {showEmbedButton && <EmbedButton onClick={onEmbedButtonClick} />}
    </LocalizationProvider>
  );
};

const mapStateToProps = (state) => ({
  showShareButton: state.modals.showShareButton,
  twitterHashtags: state.modals.twitterHashtags,
  showEmbedButton: state.modals.showEmbedButton,
  localization: state.localization,
});

const mapDispatchToProps = (dispatch) => ({
  onEmbedButtonClick: () => dispatch(openEmbedModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalButtons);
