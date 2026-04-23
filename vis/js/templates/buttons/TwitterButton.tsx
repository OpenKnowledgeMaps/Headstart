// @ts-nocheck

import React from "react";
import { Button } from "react-bootstrap";
import { connect } from "react-redux";

import useMatomo from "../../utils/useMatomo";

const TwitterButton = ({ twitterHashtags }) => {
  const title = encodeURIComponent(document.title);
  const pageUrl = encodeURIComponent(window.location.href);
  twitterHashtags = encodeURIComponent(twitterHashtags);

  const url = `https://twitter.com/intent/tweet?url=${pageUrl}&hashtags=${twitterHashtags}&text=${title}`;

  const { trackEvent } = useMatomo();

  const handleClick = () =>
    trackEvent("Added components", "Share", "Twitter button");

  // TODO localize
  return (
    <div>
      <a
        className="sharebutton_twitter"
        href={url}
        target="_blank"
        rel="noreferrer"
      >
        <Button
          bsStyle="primary"
          title="Share this visualization via Twitter"
          onClick={handleClick}
        >
          <i className="fab fa-twitter"></i>
        </Button>
      </a>
    </div>
  );
};

const mapStateToProps = (state) => ({
  twitterHashtags: state.modals.twitterHashtags,
});

export default connect(mapStateToProps)(TwitterButton);
