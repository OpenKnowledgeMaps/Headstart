import React from "react";

import baseLogo from "../../../../images/logos/base_logo.png";

import StandardKMInfo from "./subcomponents/StandardKMInfo";

const BaseInfo = ({ params }) => {
  return (
    // html template starts here
    <StandardKMInfo
      serviceName="BASE"
      serviceDesc={
        <>
          BASE provides access to over 270 million documents from more than
          8,900 content sources in all disciplines. For more information please{" "}
          <a
            className="underline"
            href="http://base-search.net"
            target="_blank "
          >
            visit the BASE website
          </a>
          .
        </>
      }
      serviceLogo={<img src={baseLogo} alt="BASE service logo" />}
      params={params}
    />
    // html template ends here
  );
};

export default BaseInfo;
