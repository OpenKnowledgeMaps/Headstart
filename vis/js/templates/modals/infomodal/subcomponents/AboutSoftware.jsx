import React from "react";

import logo from "../../../../../images/okmaps-logo-round.png";

const AboutSoftware = () => {
  return (
    // html template starts here
    <>
      <h3>Software</h3>
      <p>
        The visualization is created with the award winning software{" "}
        <a href="TODO" target="_blank" className="underline">
          Head Start
        </a>{" "}
        provided by{" "}
        <a href="TODO" target="_blank" className="underline">
          Open Knowledge Maps
        </a>
        . Open Knowledge Maps is a non-profit organisation run by a group of
        dedicated team members and volunteers. In order to improve our free and
        open service, we need your support. Please send us your feedback to{" "}
        <a href="mailto:info@openknowledgemaps.org" className="underline">
          info@openknowledgemaps.org
        </a>
        .
      </p>
      <p>If you want to support us financially, you can</p>
      <div>
        <ol>
          <li>
            <a href="TODO" target="_blank" className="underline">
              make a donation
            </a>
            ,
          </li>
          <li>
            <a href="TODO" target="_blank" className="underline">
              become an organisational member
            </a>
            , or
          </li>
          <li>
            <a href="TODO" target="_blank" className="underline">
              become a funder of our roadmap
            </a>
            .
          </li>
        </ol>
      </div>
      <p>
        <a href="TODO" target="_blank" className="underline">
          Sign-up for our newsletter
        </a>{" "}
        to receive occasional updates.
      </p>
      <p style={{ textAlign: "center" }}>
        <img src={logo} alt="OKMaps logo" style={{ width: 130 }} />
      </p>
    </>
    // html template ends here
  );
};

export default AboutSoftware;
