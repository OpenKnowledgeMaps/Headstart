// @ts-nocheck

import React from "react";
import { connect } from "react-redux";

import SubdisciplineTitle from "../templates/SubdisciplineTitle";
import AuthorImage from "../templates/AuthorImage";

interface TitleContextProps {
  showAuthor: boolean;
  authorImage: string;
  orcidId: string;
  service: string;
}

const TitleContext = ({ showAuthor, authorImage, orcidId, service }: TitleContextProps) => {
  return (
    <div id="title_context" style={{ minHeight: 54 }}>
      {showAuthor && <AuthorImage service={service} orcidId={orcidId} url={authorImage} />}
      <SubdisciplineTitle />
    </div>
  );
};

const mapStateToProps = (state) => ({
  showAuthor: state.contextLine.showAuthor,
  authorImage: state.contextLine.author.imageLink,
  orcidId: state.author.orcid_id,
  service: state.contextLine.service
});

export default connect(mapStateToProps)(TitleContext);
