import React from "react";
import { Modal } from "react-bootstrap";

import AboutSoftware from "./AboutSoftware";
import DataSource from "./DataSource";
import { queryConcatenator } from "../../../../utils/data";
import {unescapeHTML} from "../../../../utils/unescapeHTMLentities.js";


const fieldmapper = {
  relation: "relation",
  identifier: "identifier",
  title: "title",
  paper_abstract: "description",
  published_in: "publisher",
  year: "date",
  authors: "creator",
  link: "link",
  oa_state: "open access",
  resulttype: "type",
  language: "language",
  content_provider: "provider",
  coverage: "coverage"
}


const StandardKMInfo = ({
  serviceName,
  serviceDesc,
  serviceLogo,
                            params: {query, customTitle, sorting, repo_name, q_advanced, custom_clustering},
}) => {
  let queryString = queryConcatenator([query, q_advanced])

    customTitle = customTitle && unescapeHTML(customTitle)
    custom_clustering = custom_clustering && unescapeHTML(custom_clustering)

  return (
    // html template starts here
    <>
      <Modal.Header closeButton>
        <Modal.Title id="info-title">What's this?</Modal.Title>
      </Modal.Header>
      <Modal.Body id="info-body">
        {(!!customTitle || !!query || !!q_advanced) && (
          <p>
            This knowledge map presents you with {!!custom_clustering ? "an overview" : "a topical overview"} of research
            on{" "}
            <strong className="hs-strong">
              {customTitle ? customTitle : queryString}
            </strong>{" "}
            based on the 100{" "}
            {(sorting === "most-relevant") ? (
            <a
              target="_blank"
              rel="noreferrer"
              href="https://openknowledgemaps.org/faq#faq-most-relevant"
            >
              most relevant
            </a> ) : (
            "most recent" )
            }
            {" "}
            documents matching your search query.
              {custom_clustering && (
                  <span>
                  {" "}
                      The knowledge map is clustered by {custom_clustering}.
                </span>
              )}
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
            query: <strong className="hs-strong">{queryString}</strong>
          </p>
        )}
          {!custom_clustering && (
              <p>
                  We use text similarity to create a knowledge map. The algorithm groups
                  those documents together that have many words in common. Area titles
                  are created from subject keywords of documents that have been assigned
                  to the same area. We select those keywords and phrases that appear
                  frequently in one area, and seldom in other areas.
              </p>
          )}
        <p>
          Knowledge maps provide an instant overview of a topic by showing the
          main areas at a glance, and documents related to them. This makes it
          possible to easily identify useful, pertinent information.
            {custom_clustering && (
                <span> {" "}Find out more about knowledge maps in our <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://openknowledgemaps.org/faq"
                >
            FAQs
          </a>.</span>

            )}
        </p>
          {custom_clustering && (
              <p>
                  <strong className="hs-strong">Please note:</strong>
                  {" "}For this knowledge map we do not use topical clustering 
                  as described in our FAQs. In this knowledge map we use the keywords 
                  available in the {custom_clustering in fieldmapper ? fieldmapper[custom_clustering]: "subject"} metadata field for the creation of the area titles.

              </p>
          )}
          {!custom_clustering && (
              <p>
                  Please{" "}
                  <a
                      target="_blank"
                      rel="noreferrer"
                      href="https://openknowledgemaps.org/faq"
                  >
                      read our FAQs
                  </a>{" "}
                  to find out more about knowledge maps.
              </p>
          )}
        {!!serviceName && (
          <DataSource
            source={serviceName}
            contentProvider={repo_name}
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
