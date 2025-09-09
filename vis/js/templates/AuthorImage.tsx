import React, { FC } from "react";
import defaultImage from "../../images/author_default.png";
import { ServiceType } from "../@types/service";

export interface AuthorImageProps {
  orcidId: string;
  service: ServiceType;
  url?: string;
}

const AuthorImage: FC<AuthorImageProps> = ({ service, orcidId, url = "" }) => {
  let link = defaultImage;

  if (url) {
    link = url;
  }

  let href = "";

  if (service === ServiceType.ORCID) {
    href = `https://orcid.org/${orcidId}`;
  } else {
    href = link;
  }

  return (
    <div id="title_image" className="titleimage">
      <a
        id="author_image_link"
        title="Open link to ORCID profile in a new tab"
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label="author image"
        // if href is empty, then the link is not clickable
        style={{ pointerEvents: href ? "auto" : "none" }}
      >
        <div
          id="author_image"
          className="authorimage"
          style={{ backgroundImage: `url(${link})` }}
          role="img"
          aria-label="author image"
        ></div>
      </a>
    </div>
  );
};

export default AuthorImage;
