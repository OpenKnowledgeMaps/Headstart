import React from "react";
import { connect } from "react-redux";

import BasicListEntries from "./listentries/BasicListEntries";
import ClassificationListEntries from "./listentries/ClassificationListEntries";
import StandardListEntries from "./listentries/StandardListEntries";
import EntriesWrapper from "./listentries/EntriesWrapper";

import { useLocalizationContext } from "./LocalizationProvider";

const ListEntries = ({ show, service, displayedData, zoom }) => {
  const localization = useLocalizationContext();

  if (!show) {
    return null;
  }

  if (zoom && displayedData.length === 0) {
    return (
      <EntriesWrapper>
        <div className="empty-area-warning">
          {localization.empty_area_warning}
        </div>
      </EntriesWrapper>
    );
  }

  if (service === null || typeof service === "undefined") {
    return <BasicListEntries displayedData={displayedData} />;
  }

  if (service.startsWith("linkedcat")) {
    return <ClassificationListEntries displayedData={displayedData} />;
  }

  return <StandardListEntries displayedData={displayedData} />;
};

const mapStateToProps = (state) => ({
  show: state.list.show,
  service: state.service,
  zoom: state.zoom,
});

export default connect(mapStateToProps)(ListEntries);
