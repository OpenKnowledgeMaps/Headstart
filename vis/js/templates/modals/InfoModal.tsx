// @ts-nocheck

import React from "react";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";

import { useVisualizationType } from "@/hooks";

import { closeInfoModal } from "../../actions";
import BaseInfo from "./infomodal/BaseInfo";
import CovisInfo from "./infomodal/CovisInfo";
import DefaultKMInfo from "./infomodal/DefaultKMInfo";
import DefaultSGInfo from "./infomodal/DefaultSGInfo";
import OpenAireInfo from "./infomodal/OpenAireInfo";
import OrcidInfo from "./infomodal/OrcidInfo";
import PubMedInfo from "./infomodal/PubMedInfo";
import TripleKMInfo from "./infomodal/TripleKMInfo";
import TripleSGInfo from "./infomodal/TripleSGInfo";
import ViperInfo from "./infomodal/ViperInfo";

const getInfoTemplate = (
  service: string,
  isStreamgraph: boolean,
  modalType: string,
  isGeomap: boolean,
) => {
  if (isGeomap) {
    return BaseInfo;
  }

  switch (service) {
    case "base":
      return BaseInfo;
    case "pubmed":
      return PubMedInfo;
    case "openaire":
      if (modalType && modalType === "openaire") {
        return OpenAireInfo;
      }
      if (modalType && modalType === "viper") {
        return ViperInfo;
      }
      return OpenAireInfo;
    case "triple_km":
      return TripleKMInfo;
    case "triple_sg":
      return TripleSGInfo;
    case "covis":
      return CovisInfo;
    case "orcid":
      return OrcidInfo;
    default:
      return isStreamgraph ? DefaultSGInfo : DefaultKMInfo;
  }
};

const InfoModal = ({ open, onClose, params, service, modalInfoType }) => {
  const { isStreamgraph, isGeoMap } = useVisualizationType();

  const InfoTemplate = getInfoTemplate(
    service,
    isStreamgraph,
    modalInfoType,
    isGeoMap,
  );

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
  service: state.isCovis ? "covis" : state.service,
  // new parameter from config to render correct type of info modal window
  modalInfoType: state.modalInfoType,
});

const mapDispatchToProps = (dispatch) => ({
  onClose: () => dispatch(closeInfoModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(InfoModal);
