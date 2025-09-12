// @ts-nocheck
import React from "react";

import { Button } from "react-bootstrap";
import useMatomo from "../../utils/useMatomo";

const EmailButton = () => {
  const title = encodeURIComponent(document.title);
  const pageUrl = encodeURIComponent(window.location.href);
  const descriptionMetaTag = document.querySelector("meta[name='description']");
  const description = descriptionMetaTag
    ? encodeURIComponent(descriptionMetaTag.content)
    : "";

  const url = `mailto:?subject=${title}&body=${description} ${pageUrl}`;

  const { trackEvent } = useMatomo();

  const handleClick = () =>
    trackEvent("Added components", "Share", "E-mail button");

  // TODO localize
  return (
    <div>
      <a
        className="sharebutton_mail"
        href={url}
        target="_blank"
        rel="noreferrer"
      >
        <Button
          bsStyle="primary"
          title="Share this knowledge map via email"
          onClick={handleClick}
        >
          <i className="fa fa-envelope"></i>
        </Button>
      </a>
    </div>
  );
};

export default EmailButton;
