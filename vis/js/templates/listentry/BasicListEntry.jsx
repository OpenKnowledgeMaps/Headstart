import React from "react";
import { connect } from "react-redux";

import { useLocalizationContext } from "../../components/LocalizationProvider";
import {
  getPaperPDFClickHandler,
  getPaperPreviewImage,
  getPaperPreviewLink,
} from "../../utils/data";
import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";
import { shorten } from "../../utils/string";

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
  paper,
  abstractSize,
  baseUnit,
  handlePDFClick,
  handleAreaMouseover,
  handleAreaMouseout,
  handleAreaClick,
  // deprecated
  showPreviewImage,
  showRealPreviewImage,
}) => {
  const loc = useLocalizationContext();

  const id = paper.safe_id;
  const access = {
    isOpenAccess: !!paper.oa,
    isFreeAccess: !!paper.free_access,
    isDataset: paper.resulttype === "dataset",
  };
  const preview = {
    link: getPaperPreviewLink(paper),
    onClickPDF: getPaperPDFClickHandler(paper, handlePDFClick),
    showPreviewImage,
    previewImage: showRealPreviewImage ? getPaperPreviewImage(paper) : null,
  };
  const abstract = abstractSize
    ? shorten(paper.paper_abstract, abstractSize)
    : paper.paper_abstract;
  const area = {
    text: paper.area,
    onMouseOver: () => handleAreaMouseover(paper),
    onMouseOut: () => handleAreaMouseout(),
  };
  const readers = paper.num_readers;

  return (
    // html template starts here
    <ListEntry anchorId={id}>
      <div className="list_metadata">
        <AccessIcons
          isOpenAccess={access.isOpenAccess}
          isFreeAccess={access.isFreeAccess}
          isDataset={access.isDataset}
        />
        <Title paper={paper} />
        <PreviewIcons link={preview.link} onClickPDF={preview.onClickPDF} />
        <Details
          authors={
            paper.authors_string ? paper.authors_string : loc.default_authors
          }
          source={paper.published_in}
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
        onClick={handleAreaClick}
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

const mapStateToProps = (state) => ({
  abstractSize: state.selectedPaper ? null : state.list.abstractSize,
  baseUnit: state.list.baseUnit,
  showPreviewImage: !!state.selectedPaper,
  showRealPreviewImage: state.list.showRealPreviewImage,
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps
)(BasicListEntry);
