import React from "react";

import defaultImage from "../../images/author_default.png";

const AuthorImage = ({ url = "" }) => {
  let link = defaultImage;
  if (url) {
    link = url;
  }

  return (
    // html template starts here
    <div id="title_image" className="titleimage">
      <a id="author_image_link" href={link} target="_blank" rel="noreferrer">
        <div
          id="author_image"
          className="authorimage"
          style={{ backgroundImage: `url(${link})` }}
        ></div>
      </a>
    </div>
    // html template ends here
  );
};

export default AuthorImage;
