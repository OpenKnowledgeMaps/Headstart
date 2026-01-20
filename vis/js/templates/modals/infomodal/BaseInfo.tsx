// @ts-nocheck

import React from "react";

import { useVisualizationType } from "@/hooks";

import baseLogo from "../../../../images/logos/base_logo.png";
import { StandardGeomapInfo } from "./subcomponents/StandardGeomapInfo";
import StandardKMInfo from "./subcomponents/StandardKMInfo";
import StandardSGInfo from "./subcomponents/StandardSGInfo";

const BaseInfo = ({ params }) => {
  const { isGeoMap, isStreamgraph } = useVisualizationType();

  let MainTemplate = StandardKMInfo;

  if (isStreamgraph) {
    MainTemplate = StandardSGInfo;
  }

  if (isGeoMap) {
    MainTemplate = StandardGeomapInfo;
  }

  return (
    <MainTemplate
      serviceName="BASE"
      serviceDesc={
        <>
          BASE provides access to over 400 million documents from more than
          10,000 content sources in all disciplines. For more information please{" "}
          <a href="http://base-search.net" target="_blank" rel="noreferrer">
            visit the BASE website
          </a>
          .
        </>
      }
      serviceLogo={
        <a href="http://base-search.net" target="_blank" rel="noreferrer">
          <img src={baseLogo} alt="BASE service logo" />
        </a>
      }
      params={params}
    />
  );
};

export default BaseInfo;
