import React from "react";

import baseLogo from "../../../../images/logos/base_logo.png";

import StandardKMInfo from "./subcomponents/StandardKMInfo";
import StandardSGInfo from "./subcomponents/StandardSGInfo";

const BaseInfo = ({ params, isStreamgraph }) => {
  const MainTemplate = isStreamgraph ? StandardSGInfo : StandardKMInfo;

  return (
    // html template starts here
    <MainTemplate
      serviceName="BASE"
      serviceDesc={
        <>
            BASE provides access to over 300 million documents from more than
            10,000 content sources in all disciplines. For more information please{" "}
            <a
                href="http://base-search.net"
                target="_blank"
                rel="noreferrer"
            >
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
    // html template ends here
  );
};

export default BaseInfo;
