import React from "react";
import { connect } from "react-redux";
import { STREAMGRAPH_MODE } from "../reducers/chartType";

import LocalizationProvider from "./LocalizationProvider";

import SubdisciplineTitle from "../templates/SubdisciplineTitle";
import AuthorImage from "./AuthorImage";
import Streamgraph from "./Streamgraph";
import KnowledgeMap from "./KnowledgeMap";
import ModalButtons from "./ModalButtons";
import Modals from "./Modals";
import Toolbar from "./Toolbar";
import CreatedBy from "../templates/CreatedBy";
import Loading from "../templates/Loading";
import List from "./List";

const Headstart = ({
  renderMap,
  renderList,
  isAuthorview,
  isStreamgraph,
  isLoading,
  showLoading,
  localization,
}) => {
  if (isLoading) {
    if (!showLoading) {
      return null;
    }
    return (
      <LocalizationProvider localization={localization}>
        <div className="container-headstart">
          <Loading />
        </div>
      </LocalizationProvider>
    );
  }

  const Map = isStreamgraph ? Streamgraph : KnowledgeMap;

  return (
    <LocalizationProvider localization={localization}>
      <div className="container-headstart">
        {renderMap && (
          <div className="vis-col">
            <div id="mvp_container" style={{ minHeight: 54 }}>
              {isAuthorview && <AuthorImage />}
              <SubdisciplineTitle />
            </div>
            <ModalButtons />
            <Map />
          </div>
        )}
        {renderList && <List />}
      </div>
      <CreatedBy />
      <Toolbar />
      <Modals />
    </LocalizationProvider>
  );
};

const mapStateToProps = (state) => ({
  renderMap: state.misc.renderMap,
  renderList: state.misc.renderList,
  isAuthorview: state.misc.isAuthorview,
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
  isLoading: state.misc.isLoading,
  showLoading: state.misc.showLoading,
  localization: state.localization,
});

export default connect(mapStateToProps)(Headstart);
