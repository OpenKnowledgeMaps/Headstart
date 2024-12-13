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

  if (service === ServiceType.ORCID) {
    link = `https://orcid.org/${orcidId}`
  }

  return (
    <div id="title_image" className="titleimage">
      <a
        id="author_image_link"
        href={link}
        target="_blank"
        rel="noreferrer"
        aria-label="author image"
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
