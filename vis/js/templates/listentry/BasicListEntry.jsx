import React from "react";
import { connect } from "react-redux";

import {
  getPaperPDFClickHandler,
  getPaperPreviewImage,
  getPaperPreviewLink,
} from "../../utils/data";
import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";

import Abstract from "./Abstract";
import AccessIcons from "./AccessIcons";
import Area from "./Area";
import Citations from "./Citations";
import Details from "./Details";
import ListEntry from "./ListEntry";
import SidePreviewIcons from "./SidePreviewIcons";
import PreviewImage from "./PreviewImage";
import Title from "./Title";

/**
 * List entry template used in local files example.
 * @param {Object} props
 */
const BasicListEntry = ({
  paper,
  baseUnit,
  handlePDFClick,
  // deprecated
  showPreviewImage,
  showRealPreviewImage,
}) => {
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
        <SidePreviewIcons link={preview.link} onClickPDF={preview.onClickPDF} />
        <Details authors={paper.authors} source={paper.published_in} />
      </div>
      <Abstract text={paper.paper_abstract} />
      {!!preview.showPreviewImage && !!preview.onClickPDF && (
        <PreviewImage
          imageURL={preview.previewImage}
          onClick={preview.onClickPDF}
        />
      )}
      <Area paper={paper} isShort />
      <Citations number={readers} label={baseUnit} />
    </ListEntry>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  baseUnit: state.list.baseUnit,
  showPreviewImage: !!state.selectedPaper,
  showRealPreviewImage: state.list.showRealPreviewImage,
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps
)(BasicListEntry);
