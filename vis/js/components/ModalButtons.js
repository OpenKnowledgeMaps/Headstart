import React from "react";
import { connect } from "react-redux";

import { openEmbedModal } from "../actions";

import EmbedButton from "../templates/buttons/EmbedButton";
import FAQsButton from "../templates/buttons/FAQsButton";
import ShareButton from "../templates/buttons/ShareButton";
import LocalizationProvider from "./LocalizationProvider";

const ModalButtons = ({
  showShareButton,
  twitterHashtags,
  showEmbedButton,
  onEmbedButtonClick,
  showFAQsButton,
  FAQsUrl,
  localization,
}) => {
  return (
    <LocalizationProvider localization={localization}>
      {showShareButton && <ShareButton twitterHashtags={twitterHashtags} />}
      {showEmbedButton && <EmbedButton onClick={onEmbedButtonClick} />}
      {showFAQsButton && <FAQsButton url={FAQsUrl} />}
    </LocalizationProvider>
  );
};

const mapStateToProps = (state) => ({
  showShareButton: state.modals.showShareButton,
  twitterHashtags: state.modals.twitterHashtags,
  showEmbedButton: state.modals.showEmbedButton,
  showFAQsButton: state.modals.showFAQsButton,
  FAQsUrl: state.modals.FAQsUrl,
  localization: state.localization,
});

const mapDispatchToProps = (dispatch) => ({
  onEmbedButtonClick: () => dispatch(openEmbedModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalButtons);
