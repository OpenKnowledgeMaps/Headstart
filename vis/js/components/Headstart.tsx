import React, { FC } from "react";
import { connect } from "react-redux";
import LocalizationProvider from "./LocalizationProvider";
import ModalButtons from "./ModalButtons";
import Modals from "./Modals";
import Toolbar from "./Toolbar";
import Loading from "../templates/Loading";
import List from "./List";
import TitleContext from "./TitleContext";
import Footer from "./Footer";
import { getVisualizationComponent } from "../utils/getVisualizationComponent";
import { State, VisualizationTypes } from "../types";
import { Localization } from "../i18n/localization";

interface HeadstartProps {
  renderMap: boolean;
  renderList: boolean;
  visualizationType: VisualizationTypes;
  isLoading: boolean;
  showLoading: boolean;
  localization: Localization;
}

const Headstart: FC<HeadstartProps> = ({
  renderMap,
  renderList,
  visualizationType,
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

  const VisualizationComponent = getVisualizationComponent(visualizationType);

  return (
    <LocalizationProvider localization={localization}>
      <div className="container-headstart">
        {renderMap && (
          <div className="vis-col">
            <TitleContext />
            <ModalButtons />
            {VisualizationComponent}
          </div>
        )}
        {renderList && <List />}
        <Footer />
      </div>
      <Toolbar />
      <Modals />
    </LocalizationProvider>
  );
};

const mapStateToProps = (state: State) => ({
  renderMap: state.misc.renderMap,
  renderList: state.misc.renderList,
  visualizationType: state.chartType,
  isLoading: state.misc.isLoading,
  showLoading: state.misc.showLoading,
  localization: state.localization,
});

export default connect(mapStateToProps)(Headstart);
