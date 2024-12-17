import React from "react";

// @ts-ignore
import defaultImage from "../../images/author_default.png";
import { ServiceType } from "../@types/service";

export interface AuthorImageProps {
  service: ServiceType;
  url: string;
  orcidId: string;
}

const AuthorImage = ({ service, url = "", orcidId }: AuthorImageProps) => {
  let link = defaultImage;
  
  if (url) {
    link = url;
  }

  let href = "";

  if (service === ServiceType.ORCID) {
    href = `https://orcid.org/${orcidId}`
  } else {
    href = link;
  }

  return (
    <div id="title_image" className="titleimage">
      <a
        id="author_image_link"
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
