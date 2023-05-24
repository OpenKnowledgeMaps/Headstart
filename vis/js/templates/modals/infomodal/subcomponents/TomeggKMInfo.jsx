import React from "react";
import { Modal } from "react-bootstrap";

import AboutSoftware from "./AboutSoftware";
import DataSource from "./DataSource";
import { queryConcatenator } from "../../../../utils/data";

const TomeggKMInfo = ({
  serviceName,
  serviceDesc,
  serviceLogo,
  params: { query, customTitle, repo_name, q_advanced },
}) => {
  let queryString = queryConcatenator([query, q_advanced])
  return (
    // html template starts here
    <>
      <Modal.Header closeButton>
        <Modal.Title id="info-title">What's this?</Modal.Title>
      </Modal.Header>
      <Modal.Body id="info-body">
        {(!!customTitle || !!query || !!q_advanced) && (
          <p>
            This knowledge map presents you with a topical overview of blog articles and research journals
            on{" "}
            <strong className="hs-strong">
              {customTitle ? customTitle : queryString}
            </strong>{" "}
            based on the 100{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://docs.tome.gg/faq#faq-most-relevant"
            >
              most relevant
            </a>{" "}
            documents matching your search query.
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
          possible to easily identify useful, pertinent information. This knowledge map
          is based on <a href="https://github.com/OpenKnowledgeMaps/Headstart">OpenKnowledgeMap's Headstart</a> project.
        </p>
        <p>
          Please{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://docs.tome.gg/faq"
          >
            read our FAQs
          </a>{" "}
          to find out more about knowledge maps curated by Tome.gg.
        </p>
        {!!serviceName && (
          <DataSource
            source={serviceName}
            contentProvider={repo_name}
            description={serviceDesc}
            logo={serviceLogo}
          />
        )}
      </Modal.Body>
    </>
    // html template ends here
  );
};

export default TomeggKMInfo;
