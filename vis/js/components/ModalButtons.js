import React from "react";
import { connect } from "react-redux";

import ShareButton from "../templates/buttons/ShareButton";
import LocalizationProvider from "./LocalizationProvider";

const ModalButtons = ({ showShareButton, twitterHashtags, localization }) => {
  return (
    <LocalizationProvider localization={localization}>
      {showShareButton && <ShareButton twitterHashtags={twitterHashtags} />}
    </LocalizationProvider>
  );
};

const mapStateToProps = (state) => ({
  showShareButton: state.modals.showShareButton,
  twitterHashtags: state.modals.twitterHashtags,
  localization: state.localization,
});

const mapDispatchToProps = (dispatch) => ({
  // TODO
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalButtons);
