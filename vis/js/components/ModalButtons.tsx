// @ts-nocheck

import $ from "jquery";
import React, { useEffect } from "react";
import { connect } from "react-redux";

import { openEmbedModal } from "../actions";
import { STREAMGRAPH_MODE } from "../reducers/chartType";
import CitationButton from "../templates/buttons/CitationButton";
import EmailButton from "../templates/buttons/EmailButton";
import EmbedButton from "../templates/buttons/EmbedButton";
import FAQsButton from "../templates/buttons/FAQsButton";
import ShareButton from "../templates/buttons/ShareButton";
import TwitterButton from "../templates/buttons/TwitterButton";

const ModalButtons = ({
  showShareButton,
  twitterHashtags,
  showEmbedButton,
  onEmbedButtonClick,
  showFAQsButton,
  FAQsUrl,
  isEmbedded,
  visTag,
  service,
  showCitationButton,
  isStreamgraph,
  showTwitterButton,
  showEmailButton,
}) => {
  useEffect(() => {
    if (["base", "pubmed"].includes(service) && !isEmbedded) {
      positionButtons(visTag);
    }
  });

  return (
    <div id="modals">
      {showShareButton && (
        <ShareButton
          twitterHashtags={twitterHashtags}
          isStreamgraph={isStreamgraph}
        />
      )}
      {showTwitterButton && <TwitterButton />}
      {showEmailButton && <EmailButton />}
      {showEmbedButton && (
        <EmbedButton
          onClick={onEmbedButtonClick}
          isStreamgraph={isStreamgraph}
        />
      )}
      {showFAQsButton && <FAQsButton url={FAQsUrl} />}
      {showCitationButton && <CitationButton />}
    </div>
  );
};

const mapStateToProps = (state) => ({
  showShareButton: state.modals.showShareButton,
  twitterHashtags: state.modals.twitterHashtags,
  showEmbedButton: state.modals.showEmbedButton,
  showFAQsButton: state.modals.showFAQsButton,
  FAQsUrl: state.modals.FAQsUrl,
  isEmbedded: state.misc.isEmbedded,
  visTag: state.misc.visTag,
  service: state.service,
  showCitationButton: state.modals.showCitationButton,
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
  showTwitterButton: state.modals.showTwitterButton,
  showEmailButton: state.modals.showEmailButton,
});

const mapDispatchToProps = (dispatch) => ({
  onEmbedButtonClick: () => dispatch(openEmbedModal()),
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
    const height = parseInt($(`#${tag}`).css("min-height"));
    const leftOffset = $("#visualization").offset().left;

    $("#modals").followTo(height, topPosition, leftOffset, 0);
  };

  $(".close").click(function (event) {
    $("#modals").css(
      "top",
      $("#modals").position().top - $(event.target).parent().outerHeight(),
    );

    topPosition = $("#modals").position().top;
    setPosition();
  });

  $(window).resize(setPosition);

  setPosition();
};
