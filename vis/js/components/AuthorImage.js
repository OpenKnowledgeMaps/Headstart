import React from "react";
import { connect } from "react-redux";

import AuthorImageTemplate from "../templates/AuthorImage";

import defaultImage from "../../images/author_default.png";

export const AuthorImage = ({ hidden, imageLink = "" }) => {
  if (hidden) {
    return null;
  }

  let link = defaultImage;
  if (imageLink !== "") {
    link = imageLink;
  }

  return <AuthorImageTemplate link={link} />;
};

const mapStateToProps = (state) => ({
  hidden: !state.contextLine.showAuthor,
  imageLink: state.contextLine.author.imageLink,
});

export default connect(mapStateToProps)(AuthorImage);
