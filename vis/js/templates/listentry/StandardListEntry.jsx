import React from "react";
import Abstract from "./Abstract";
import AccessIcons from "./AccessIcons";
import Area from "./Area";
import Citations from "./Citations";
import Comments from "./Comments";
import Details from "./Details";
import DocumentType from "./DocumentType";
import Keywords from "./Keywords";
import Link from "./Link";
import ListEntry from "./ListEntry";
import Metrics from "./Metrics";
import PreviewIcons from "./PreviewIcons";
import PreviewImage from "./PreviewImage";
import Tags from "./Tags";
import Title from "./Title";

/**
 * Standard list entry template used in project website, CoVis and Viper.
 * @param {Object} props
 */
const StandardListEntry = ({
  id,
  access = {},
  tags,
  title,
  preview = {},
  details = {},
  link = {},
  documentType,
  abstract,
  comments,
  keywords,
  metrics = {},
  area = {},
  citations,
  baseUnit,
  handleTitleClick,
  handleZoomIn,
}) => {
  return (
    // html template starts here
    <ListEntry anchorId={id}>
      <div className="list_metadata">
        <AccessIcons
          isOpenAccess={access.isOpenAccess}
          isFreeAccess={access.isFreeAccess}
          isDataset={access.isDataset}
          tags={!!tags ? <Tags values={tags} /> : null}
        />
        <Title onClick={handleTitleClick}>{title}</Title>
        <PreviewIcons link={preview.link} onClickPDF={preview.onClickPDF} />
        <Details
          authors={details.authors}
          source={details.source}
          year={details.year}
        />
        <Link address={link.address} isDoi={link.isDoi} />
      </div>
      {!!documentType && <DocumentType type={documentType} />}
      <Abstract text={abstract} />
      {!!comments && <Comments items={comments} />}
      {!!preview.showPreviewImage && !!preview.onClickPDF && (
        <PreviewImage onClick={preview.onClickPDF} />
      )}
      {!!keywords && <Keywords>{keywords}</Keywords>}
      {!!metrics && (
        <Metrics
          citations={metrics.citations}
          tweets={metrics.tweets}
          readers={metrics.readers}
        />
      )}
      <Area
        onClick={handleZoomIn}
        onMouseOver={area.onMouseOver}
        onMouseOut={area.onMouseOut}
      >
        {area.text}
      </Area>
      {(!!citations || parseInt(citations) === 0) && (
        <Citations number={citations} label={baseUnit} />
      )}
    </ListEntry>
    // html template ends here
  );
};

export default StandardListEntry;
