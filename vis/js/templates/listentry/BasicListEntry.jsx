import React from "react";
import Abstract from "./Abstract";
import AccessIcons from "./AccessIcons";
import Area from "./Area";
import Details from "./Details";
import ListEntry from "./ListEntry";
import PreviewIcons from "./PreviewIcons";
import PreviewImage from "./PreviewImage";
import Readers from "./Readers";
import Title from "./Title";

/**
 * List entry template used in local files example.
 * @param {Object} props
 */
const BasicListEntry = ({
  id,
  access,
  title,
  preview,
  details,
  abstract,
  area,
  handleZoomIn,
  readers,
  baseUnit,
  handleTitleClick,
}) => {
  return (
    // html template starts here
    <ListEntry anchorId={id}>
      <div className="list_metadata">
        <AccessIcons
          isOpenAccess={access.isOpenAccess}
          isFreeAccess={access.isFreeAccess}
          isDataset={access.isDataset}
        />
        <Title onClick={handleTitleClick}>{title}</Title>
        <PreviewIcons link={preview.link} onClickPDF={preview.onClickPDF} />
        <Details
          authors={details.authors}
          source={details.source}
          year={details.year}
        />
      </div>
      <Abstract text={abstract} />
      {!!preview.showPreviewImage && !!preview.onClickPDF && (
        <PreviewImage
          imageURL={preview.previewImage}
          onClick={preview.onClickPDF}
        />
      )}
      <Area
        onClick={handleZoomIn}
        onMouseOver={area.onMouseOver}
        onMouseOut={area.onMouseOut}
      >
        {area.text}
      </Area>
      <Readers number={readers} label={baseUnit} />
    </ListEntry>
    // html template ends here
  );
};

export default BasicListEntry;
