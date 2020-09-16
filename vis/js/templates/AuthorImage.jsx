import React from "react";

const AuthorImage = ({ link }) => {
  return (
    // html template starts here
    // TODO return the div back when bigger part of app is refactored
    // <div id="title_image" className="titleimage">
      <a id="author_image_link" href={link} target="_blank">
        <div
          id="author_image"
          className="authorimage"
          style={{ backgroundImage: `url(${link})` }}
        ></div>
      </a>
    // </div>
    // html template ends here
  );
};

export default AuthorImage;
