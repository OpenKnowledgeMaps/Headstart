// @ts-nocheck

import React from "react";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";

import { closeInfoModal } from "../../actions";
import { STREAMGRAPH_MODE } from "../../reducers/chartType";
import BaseInfo from "./infomodal/BaseInfo";
import DefaultKMInfo from "./infomodal/DefaultKMInfo";
import DefaultSGInfo from "./infomodal/DefaultSGInfo";
import OpenAireInfo from "./infomodal/OpenAireInfo";
import OrcidInfo from "./infomodal/OrcidInfo";
import PubMedInfo from "./infomodal/PubMedInfo";
import TripleKMInfo from "./infomodal/TripleKMInfo";
import TripleSGInfo from "./infomodal/TripleSGInfo";

const getInfoTemplate = (
  service: string,
  isStreamgraph: boolean,
  modalType: string,
) => {
  switch (service) {
    case "base":
      return BaseInfo;
    case "pubmed":
      return PubMedInfo;
    case "openaire":
      return OpenAireInfo;
    case "triple_km":
      return TripleKMInfo;
    case "triple_sg":
      return TripleSGInfo;
    case "orcid":
      return OrcidInfo;
    default:
      return isStreamgraph ? DefaultSGInfo : DefaultKMInfo;
  }
};

const InfoModal = ({
  open,
  onClose,
  params,
  service,
  isStreamgraph,
  modalInfoType,
}) => {
  const InfoTemplate = getInfoTemplate(service, isStreamgraph, modalInfoType);

  return (
    // html template starts here
    <Modal id="info_modal" show={open} onHide={onClose} animation>
      <InfoTemplate params={params} isStreamgraph={isStreamgraph} />
    </Modal>
    // html template ends here
  );
};

const mapStateToProps = (state) => ({
  open: state.modals.openInfoModal,
  params: {
    ...state.modals.infoParams,
    query: state.query.text,
    customTitle: state.heading.customTitle,
    q_advanced: state.q_advanced.text,
    author: state.author,
  },
  service: state.service,
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
  // new parameter from config to render correct type of info modal window
  modalInfoType: state.modalInfoType,
});

const mapDispatchToProps = (dispatch) => ({
  onClose: () => dispatch(closeInfoModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(InfoModal);
