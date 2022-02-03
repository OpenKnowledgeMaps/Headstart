import React, { useState, useRef } from "react";
import $ from "jquery";

import useOutsideClick from "../../utils/useOutsideClick";
import { useLocalizationContext } from "../../components/LocalizationProvider";
import useMatomo from "../../utils/useMatomo";

const ShareButton = ({ twitterHashtags }) => {
  const localization = useLocalizationContext();
  const { trackEvent } = useMatomo();

  const trackToggle = (opening) => {
    if (opening) {
      trackEvent("Added components", "Open share buttons", "Share button");
    } else {
      trackEvent("Added components", "Close share buttons", "Share button");
    }

    return opening;
  };

  const trackShare = (type) => trackEvent("Added components", "Share", type);

  const [opened, setOpened] = useState(false);
  const handleClick = () => {
    setOpened((prevOpened) => trackToggle(!prevOpened));
  };
  const handleOutsideClick = () => {
    setOpened((prevOpened) => {
      if (prevOpened) {
        trackToggle(false);
      }
      return false;
    });
  };

  const containerRef = useRef(null);
  useOutsideClick(containerRef, handleOutsideClick);

  const title = encodeURIComponent(document.title);
  const url = encodeURIComponent(window.location.href);
  const description = encodeURIComponent(
    $("meta[name='description']").attr("content")
  );
  twitterHashtags = encodeURIComponent(twitterHashtags);

  const twitterUrl = `https://twitter.com/intent/tweet?url=${url}&hashtags=${twitterHashtags}&text=${title}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  const emailUrl = `mailto:?subject=${title}&body=${description} ${url}`;

  return (
    // html template starts here
    <div ref={containerRef}>
      <button
        className="btn btn-primary sharebutton"
        id="sharebutton"
        title={localization.share_button_title}
        onClick={handleClick}
      >
        <i className="fa fa-share-alt fa-fw" aria-hidden="true"></i>
      </button>
      {opened && (
        <div className="sharebuttons" style={{ display: "inline-block" }}>
          <a
            className="sharebutton_twitter"
            href={twitterUrl}
            target="_blank"
            rel="noreferrer"
          >
            <button
              className="btn btn-primary"
              onClick={() => trackShare("Twitter button")}
            >
              <i className="fab fa-twitter-square fa-fw" aria-hidden="true"></i>
            </button>
          </a>
          <a
            className="sharebutton_fb"
            href={facebookUrl}
            target="_blank"
            rel="noreferrer"
          >
            <button
              className="btn btn-primary"
              onClick={() => trackShare("Facebook button")}
            >
              <i className="fab fa-facebook-square"></i>
            </button>
          </a>
          <a className="sharebutton_mail" href={emailUrl}>
            <button
              className="btn btn-primary"
              onClick={() => trackShare("E-mail button")}
            >
              <i className="fa fa-envelope"></i>
            </button>
          </a>
        </div>
      )}
    </div>
    // html template ends here
  );
};

export default ShareButton;
