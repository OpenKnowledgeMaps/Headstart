import React from "react";

import tripleLogo from "../../../../images/logos/triple_logo.png";

import StandardKMInfo from "./subcomponents/StandardKMInfo";

const TripleKMInfo = ({ params }) => {
  return (
    // html template starts here
    <StandardKMInfo
      serviceName="TRIPLE"
      serviceDesc={
        <>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
            vel tincidunt neque, at finibus purus. In purus tellus, gravida in
            velit nec, faucibus pulvinar elit. Nullam odio dui, congue in ex sit
            amet, semper convallis leo. Nulla pellentesque neque massa, in
            vulputate ex accumsan quis. Integer ornare dignissim mi placerat
            convallis.
          </p>
          <p style={{textAlign: "center"}}>
            <img
              src={tripleLogo}
              alt="TRIPLE service logo"
              style={{ width: "50%" }}
            />
          </p>
        </>
      }
      params={params}
    />
    // html template ends here
  );
};

export default TripleKMInfo;
