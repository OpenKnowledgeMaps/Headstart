import React from "react";
import { connect } from "react-redux";

import { openEmbedModal, openViperEditModal } from "../actions";

import EditButton from "../templates/buttons/EditButton";
import EmbedButton from "../templates/buttons/EmbedButton";
import FAQsButton from "../templates/buttons/FAQsButton";
import ReloadButton from "../templates/buttons/ReloadButton";
import ShareButton from "../templates/buttons/ShareButton";

const ModalButtons = ({
  showShareButton,
  twitterHashtags,
  showEmbedButton,
  onEmbedButtonClick,
  showFAQsButton,
  FAQsUrl,
  showViperEditButton,
  onViperEditClick,
  showReloadButton,
  reloadLastUpdate,
  reloadApiProperties,
}) => {
  return (
    <div id="modals">
      {showShareButton && <ShareButton twitterHashtags={twitterHashtags} />}
      {showEmbedButton && <EmbedButton onClick={onEmbedButtonClick} />}
      {showFAQsButton && <FAQsButton url={FAQsUrl} />}
      {showViperEditButton && (
        <EditButton onClick={onViperEditClick} title="Add project resources" />
      )}
      {showReloadButton && (
        <ReloadButton
          lastUpdate={reloadLastUpdate}
          apiProperties={reloadApiProperties}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  showShareButton: state.modals.showShareButton,
  twitterHashtags: state.modals.twitterHashtags,
  showEmbedButton: state.modals.showEmbedButton,
  showFAQsButton: state.modals.showFAQsButton,
  FAQsUrl: state.modals.FAQsUrl,
  showViperEditButton: state.modals.showViperEditButton,
  showReloadButton: state.modals.showReloadButton,
  reloadLastUpdate: state.modals.reloadLastUpdate,
  reloadApiProperties: state.modals.reloadApiProperties,
});

const mapDispatchToProps = (dispatch) => ({
  onEmbedButtonClick: () => dispatch(openEmbedModal()),
  onViperEditClick: () => dispatch(openViperEditModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalButtons);
