import React from "react";

import logo from "../../../../../images/okmaps-logo-web-whitebg.png";

const AboutSoftware = () => {
  return (
    // html template starts here
    <>
      <h3>Open source software</h3>
      <p>
        The visualization is created with the award winning open source software{" "}
        <a
          href="https://github.com/OpenKnowledgeMaps/Headstart"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Head Start
        </a>{" "}
        provided by{" "}
        <a
          href="https://openknowledgemaps.org/"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
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
      <p>If you want to support us financially, you can:</p>
      <div>
        <ol className="pop-up-list">
          <li>
            <a
              href="https://openknowledgemaps.org/donate-now"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              make a donation
            </a>
            ,
          </li>
          <li>
            <a
              href="https://openknowledgemaps.org/supporting-membership"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              become an organisational member
            </a>
            , or
          </li>
          <li>
            <a
              href="https://openknowledgemaps.org/faq#faq-funding"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              become a funder of our roadmap
            </a>
            .
          </li>
        </ol>
      </div>
      <p>
        <a
          href="https://openknowledgemaps.us13.list-manage.com/subscribe?u=c399f89442d6aa733a9896515&id=f9d9e47566"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Sign-up for our newsletter
        </a>{" "}
        to receive occasional updates.
      </p>
      <p className="okmaps-logo">
        <img src={logo} alt="OKMaps logo" />
      </p>
    </>
    // html template ends here
  );
};

export default AboutSoftware;
