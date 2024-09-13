import React from "react";
import { connect } from "react-redux";
import { Modal } from "react-bootstrap";

import { closeResearcherModal } from "../../actions";
import { STREAMGRAPH_MODE } from "../../reducers/chartType";

import ResearcherMetricsInfo from "./researcher-modal/OrcidResearcherMetricsInfo";

const getResearcherInfoTemplate = (service, isStreamgraph, modalType) => {
  switch (service) {
    case "orcid":
      return ResearcherMetricsInfo;
    default:
      return null;  
  }
};

const ResearcherMetricsInfoModal = ({open, onClose, params, service, isStreamgraph, modalInfoType}) => {
  const ResearcherInfoTemplate = getResearcherInfoTemplate(service, isStreamgraph, modalInfoType);

  return (
    // html template starts here
    <Modal id="info_modal" show={open} onHide={onClose} animation>
      <ResearcherInfoTemplate params={params} isStreamgraph={isStreamgraph} />
    </Modal>
    // html template ends here
  );
};


const mapStateToProps = (state) => ({
  open: state.modals.openResearcherModal,
  params: {
    ...state.modals.infoParams,
    query: state.query.text,
    customTitle: state.heading.customTitle,
    q_advanced: state.q_advanced.text,

    author_name: state.author.author_name,
    author_keywords: state.author.author_keywords,
    biography: state.author.biography,
    country: state.author.country,
    external_identifiers: state.author.external_identifiers,
    orcid_id: state.author.orcid_id,
    total_citations: state.author.total_citations,
    total_neppr: state.author.total_neppr,
    total_unique_social_media_mentions:
      state.author.total_unique_social_media_mentions,
    websites: state.author.websites,
  },
  service: state.isCovis ? "covis" : state.service,
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
  // new parameter from config to render correct type of info modal window
  modalInfoType: state.modalInfoType,
});

const mapDispatchToProps = (dispatch) => ({
  onClose: () => dispatch(closeResearcherModal()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResearcherMetricsInfoModal);
