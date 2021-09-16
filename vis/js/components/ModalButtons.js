import React, { useEffect } from "react";
import { connect } from "react-redux";

import { openEmbedModal, openViperEditModal } from "../actions";

import $ from "jquery";

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
  isEmbedded,
  visTag,
  service,
}) => {
  useEffect(() => {
    if (["base", "pubmed"].includes(service) && !isEmbedded) {
      positionButtons(visTag);
    }
  });

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
  isEmbedded: state.misc.isEmbedded,
  visTag: state.misc.visTag,
  service: state.modals.service,
});

const mapDispatchToProps = (dispatch) => ({
  onEmbedButtonClick: () => dispatch(openEmbedModal()),
  onViperEditClick: () => dispatch(openViperEditModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalButtons);

// legacy code from project website that sets the modal buttons position
$.fn.followTo = function (pos, top_pos, left_pos) {
  var $this = this,
    $window = $(window);

  const setPosition = function () {
    if ($window.scrollTop() > pos - top_pos) {
      $this.css({
        position: "absolute",
        top: pos,
        left: 0,
      });
    } else {
      $this.css({
        position: "fixed",
        top: top_pos,
        left: left_pos,
      });
    }
  };
  $window.scroll(setPosition);
  setPosition();
};

const positionButtons = (tag) => {
  var topPosition = $("#modals").position().top;

  const setPosition = () => {
    const height = parseInt($("#" + tag).css("min-height"));
    const leftOffset = $("#visualization").offset().left;

    $("#modals").followTo(height, topPosition, leftOffset, 0);
  };

  $(".close").click(function () {
    $("#modals").css(
      "top",
      $("#modals").position().top - $("#desktop-warning").outerHeight()
    );

    topPosition = $("#modals").position().top;
    setPosition();
  });

  $(window).resize(setPosition);

  setPosition();
};
