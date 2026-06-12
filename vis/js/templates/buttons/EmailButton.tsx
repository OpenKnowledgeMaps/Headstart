// @ts-nocheck
import React from "react";
import { Button } from "react-bootstrap";

import useMatomo from "../../utils/useMatomo";

// This button currently builds email content from page metadata:
// - subject <- document.title
// - body <- meta[name="description"] + current URL
// As a result, social/SEO metadata changes can also change email template. It is
// also impossible to change the email template without changing the social/SEO metadata.
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
          title="Share this visualization via email"
          onClick={handleClick}
        >
          <i className="fa fa-envelope"></i>
        </Button>
      </a>
    </div>
  );
};

export default EmailButton;
