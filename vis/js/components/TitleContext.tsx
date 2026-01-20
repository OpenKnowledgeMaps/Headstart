import React, { FC } from "react";
import { connect } from "react-redux";
import SubdisciplineTitle from "../templates/SubdisciplineTitle";
import AuthorImage from "../templates/AuthorImage";
import { ServiceType, State } from "../types";

interface TitleContextProps {
  showAuthor: boolean;
  authorImage: string | null;
  orcidId: string;
  service: ServiceType;
}

const TitleContext: FC<TitleContextProps> = ({
  showAuthor,
  authorImage,
  orcidId,
  service,
}) => (
  <div id="title_context" style={{ minHeight: 54 }}>
    {showAuthor && (
      <AuthorImage service={service} orcidId={orcidId} url={authorImage} />
    )}
    <SubdisciplineTitle />
  </div>
);

const mapStateToProps = (state: State) => ({
  showAuthor: state.contextLine.showAuthor,
  authorImage: state.contextLine.author.imageLink,
  orcidId: state.author.orcid_id,
  service: state.contextLine.service,
});

export default connect(mapStateToProps)(TitleContext);
