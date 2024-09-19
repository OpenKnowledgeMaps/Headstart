import React from "react";
import { connect } from "react-redux";

import SubdisciplineTitle from "../templates/SubdisciplineTitle";
import AuthorImage from "../templates/AuthorImage";

const TitleContext = ({ showAuthor, authorImage }) => {
  return (
    <div id="title_context" style={{ minHeight: 54 }}>
      {showAuthor && <AuthorImage url={authorImage} />}
      <SubdisciplineTitle />
    </div>
  );
};

const mapStateToProps = (state) => ({
  showAuthor: state.contextLine.showAuthor,
  authorImage: state.contextLine.author.imageLink,
});

export default connect(mapStateToProps)(TitleContext);
