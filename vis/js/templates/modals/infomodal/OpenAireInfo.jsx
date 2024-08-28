import React, {Fragment} from "react";
import {Modal} from "react-bootstrap";

import DataSource from "./subcomponents/DataSource";
import AboutSoftware from "./subcomponents/AboutSoftware";


const OpenAireInfo = ({
                        params: {
                          title,
                          acronym,
                          funder,
                          funding_tree,
                          call_id,
                          project_id,
                          start_date,
                          end_date,
                          oa_mandate,
                          organisations,
                          obj_id,
                        },
                      }) => {

  return (
      // html template starts here
      <>
        <Modal.Header closeButton>
          <Modal.Title id="info-title">What's this?</Modal.Title>
        </Modal.Header>
        <Modal.Body id="info-body">
          <p>
            This knowledge map presents you with a topical overview of research conducted in the following project:
          </p>
          <h3>Project Details</h3>
          <table className="table">
            <tbody>
            <tr>
              <th>Title</th>
              <td>
                <span className="info-modal-title">{title}</span>
              </td>
            </tr>
            <tr>
              <th>Acronym</th>
              <td>
                <span className="info-modal-acronym">{acronym}</span>
              </td>
            </tr>
            <tr>
              <th>Funder</th>
              <td>
                <span className="info-modal-funder">{funder}</span>
              </td>
            </tr>
            <tr>
              <th>Funding program</th>
              <td>
                <span className="info-modal-funding_tree">{funding_tree}</span>
              </td>
            </tr>
            <tr>
              <th>Call</th>
              <td>
                <span className="info-modal-call_id">{call_id}</span>
              </td>
            </tr>
            <tr>
              <th>Contract (GA) number</th>
              <td>
                <span className="info-modal-project_id">{project_id}</span>
              </td>
            </tr>
            <tr>
              <th>Start Date</th>
              <td>
                <span className="info-modal-start_date">{start_date}</span>
              </td>
            </tr>
            <tr>
              <th>End Date</th>
              <td>
                <span className="info-modal-end_date">{end_date}</span>
              </td>
            </tr>
            <tr>
              <th>Open Access mandate</th>
              <td>
                <span className="info-modal-oa_mandate">{oa_mandate}</span>
              </td>
            </tr>
            <tr>
              <th>Organizations</th>
              <td>
                <span className="info-modal-html_organisations">
                  {!!organisations &&
                      organisations.map((org, i) => (
                          <Fragment key={org.url}>
                            {i !== 0 ? ", " : ""}
                            <a
                                href={org.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                              {org.name}
                            </a>
                          </Fragment>
                      ))}
                </span>
              </td>
            </tr>
            <tr>
              <th>OpenAire Link</th>
              <td>
                <span className="info-modal-html_openaire_link">
                  <a
                      href={`https://www.openaire.eu/search/project?projectId=${obj_id}`}
                      target="_blank"
                      rel="noreferrer"
                  >
                    Link
                  </a>
                </span>
              </td>
            </tr>
            </tbody>
          </table>

          <p>
            We use text similarity to create a knowledge map. The algorithm groups those documents together that have
            many words in common. Area titles are created from subject keywords of documents that have been assigned
            to the same area. We select those keywords and phrases that appear frequently in one area, and seldom in
            other areas.
          </p>
          <p>
            Knowledge maps provide an instant overview of a topic by showing the main areas at a glance, and documents
            related to them. This makes it possible to easily identify useful, pertinent information.
          </p>
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

          <DataSource
              source={"OpenAIRE"}
              description={
                <>
                  <a
                      href="https://www.openaire.eu/"
                      target="_blank"
                      rel="noreferrer"
                  >
                    OpenAIRE
                  </a>{" "}is a key infrastructure that enables the European transition to open science. It provides
                  access to 3 million research projects and more than 70 million research outputs from more than 100,000
                  data sources.
                </>
              }
          />
          <AboutSoftware/>
        </Modal.Body>

      </>
      // html template ends here
  );
};

export default OpenAireInfo;
