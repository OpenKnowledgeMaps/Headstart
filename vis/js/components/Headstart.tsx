import { FC } from "react";
import { connect } from "react-redux";

import { Localization } from "../i18n/localization";
import Loading from "../templates/Loading";
import { State, VisualizationTypes } from "../types";
import { getVisualizationComponent } from "../utils/getVisualizationComponent";
import Footer from "./Footer";
import List from "./List";
import LocalizationProvider from "./LocalizationProvider";
import ModalButtons from "./ModalButtons";
import Modals from "./Modals";
import TitleContext from "./TitleContext";
import Toolbar from "./Toolbar";

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
