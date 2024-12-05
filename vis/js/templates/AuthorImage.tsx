// @ts-nocheck

import React from "react";

import defaultImage from "../../images/author_default.png";

const AuthorImage = ({ url = "" }) => {
  let link = url || defaultImage;

  const handleClick = (e) => {
    // for now we are disabling this behaviour, since we decided to not redirect users
    e.preventDefault(); // Prevents navigation
  };

  return (
    <div id="title_image" className="titleimage">
      <a
        id="author_image_link"
        href={link}
        target="_blank"
        rel="noreferrer"
        aria-label="author image"
        onClick={handleClick}
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
