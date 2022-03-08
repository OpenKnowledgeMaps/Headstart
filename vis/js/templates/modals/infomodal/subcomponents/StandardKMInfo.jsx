import React from "react";
import { Modal } from "react-bootstrap";

import AboutSoftware from "./AboutSoftware";
import DataSource from "./DataSource";

const StandardKMInfo = ({
  serviceName,
  serviceDesc,
  serviceLogo,
  params: { query, customTitle },
}) => {
  return (
    // html template starts here
    <>
      <Modal.Header closeButton>
        <Modal.Title id="info-title">What's this?</Modal.Title>
      </Modal.Header>
      <Modal.Body id="info-body">
        {(!!customTitle || !!query) && (
          <p>
            This knowledge map presents you with a topical overview of research
            on <strong class="hs-strong">{customTitle ? customTitle : query}</strong> based on the
            100{" "}
            <a
              className="underline"
              target="_blank"
              rel="noreferrer"
              href="https://openknowledgemaps.org/faq#faq-most-relevant"
            >
              most relevant
            </a>{" "}
            documents matching your search query.
          </p>
        )}
        {!customTitle && !query && (
          <p>
            This knowledge map presents you with a topical overview of research
            based on 100 documents.
          </p>
        )}
        {!!customTitle && (
          <p>
            This map has a custom title and was created using the following
            query: <strong class="hs-strong">{query}</strong>
          </p>
        )}
        <p>
          We use text similarity to create a knowledge map. The algorithm groups
          those documents together that have many words in common. Area titles
          are created from subject keywords of documents that have been assigned
          to the same area. We select those keywords and phrases that appear
          frequently in one area, and seldom in other areas.
        </p>
        <p>
          Knowledge maps provide an instant overview of a topic by showing the
          main areas at a glance, and documents related to them. This makes it
          possible to easily identify useful, pertinent information.
        </p>
        <p>
          Please{" "}
          <a
            target="_blank"
            rel="noreferrer"
            className="underline"
            href="https://openknowledgemaps.org/faq"
          >
            read our FAQs
          </a>{" "}
          to find out more about knowledge maps.
        </p>
        {!!serviceName && (
          <DataSource
            source={serviceName}
            description={serviceDesc}
            logo={serviceLogo}
          />
        )}
        <AboutSoftware />
      </Modal.Body>
    </>
    // html template ends here
  );
};

export default StandardKMInfo;
