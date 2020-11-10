import React from "react";
import Abstract from "./Abstract";
import AccessIcons from "./AccessIcons";
import Area from "./Area";
import Classification from "./Classification";
import Details from "./Details";
import EntryBacklink from "./EntryBacklink";
import Keywords from "./Keywords";
import Link from "./Link";
import ListEntry from "./ListEntry";
import PreviewIcons from "./PreviewIcons";
import Title from "./Title";

/**
 * List entry template used in LinkedCat.
 * @param {Object} props
 */
const ClassificationListEntry = ({
  id,
  access = {}, // TODO remove the default values
  title,
  preview = {},
  details = {},
  link = {},
  classification,
  abstract,
  keywords,
  area,
  handleTitleClick,
  handleZoomIn,
  backlink = {},
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
        <Details authors={details.authors} year={details.year} />
        <Link address={link.address} isDoi={link.isDoi} />
      </div>
      <Classification>{classification}</Classification>
      <Keywords>{keywords}</Keywords>
      <Abstract text={abstract} />
      {!!area && (
        <Area
          onClick={handleZoomIn}
          onMouseOver={area.onMouseOver}
          onMouseOut={area.onMouseOut}
        >
          {area.text}
        </Area>
      )}
      {!!backlink.show && (
        <EntryBacklink
          onClick={backlink.onClick}
          isInStream={backlink.isInStream}
        />
      )}
    </ListEntry>
    // html template ends here
  );
};

export default ClassificationListEntry;
