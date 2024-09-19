import React from "react";

import defaultImage from "../../images/author_default.png";

const AuthorImage = ({ url = "" }) => {
  let link = defaultImage;
  if (url) {
    link = url;
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
