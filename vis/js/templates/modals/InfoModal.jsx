import React from "react";
import { connect } from "react-redux";
import { Modal } from "react-bootstrap";

import { closeInfoModal } from "../../actions";
import { STREAMGRAPH_MODE } from "../../reducers/chartType";

import BaseInfo from "./infomodal/BaseInfo";
import CovisInfo from "./infomodal/CovisInfo";
import DefaultKMInfo from "./infomodal/DefaultKMInfo";
import DefaultSGInfo from "./infomodal/DefaultSGInfo";
import GsheetsInfo from "./infomodal/GsheetsInfo";
import PubMedInfo from "./infomodal/PubMedInfo";
import TripleKMInfo from "./infomodal/TripleKMInfo";
import TripleSGInfo from "./infomodal/TripleSGInfo";
import ViperInfo from "./infomodal/ViperInfo";
import OpenAireInfo from "./infomodal/OpenAireInfo";


const getInfoTemplate = (service, isStreamgraph) => {
  switch (service) {
    case "base":
      return BaseInfo;
    case "pubmed":
      return PubMedInfo;
    case "openaire":
      // return  OpenAIRE info modal
      return OpenAireInfo;
      // return ViperInfo;
    case "triple_km":
      return TripleKMInfo;
    case "triple_sg":
      return TripleSGInfo;
    case "gsheets":
      return GsheetsInfo;
    case "covis":
      return CovisInfo;
    default:
      return isStreamgraph ? DefaultSGInfo : DefaultKMInfo;
  }
};

const InfoModal = ({ open, onClose, params, service, isStreamgraph }) => {
  const InfoTemplate = getInfoTemplate(service, isStreamgraph);

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
  },
  service: state.isCovis ? "covis" : state.service,
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
});

const mapDispatchToProps = (dispatch) => ({
  onClose: () => dispatch(closeInfoModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(InfoModal);
