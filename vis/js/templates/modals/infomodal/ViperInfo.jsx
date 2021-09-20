import React, { Fragment } from "react";
import { Modal } from "react-bootstrap";

const ViperInfo = ({
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
          VIPER, the Visual Project Explorer, is a unique open science
          application developed by{" "}
          <a
            href="https://openknowledgemaps.org"
            target="_blank"
            rel="noreferrer"
          >
            Open Knowledge Maps
          </a>{" "}
          that focuses on the discovery of research project results. VIPER
          enables you to systematically explore a project's output and to
          understand its impact in different areas.
        </p>

        <h3>Acknowledgements</h3>
        <p>
          VIPER is made possible thanks to funding received from{" "}
          <a href="https://openaire.eu" target="_blank" rel="noreferrer">
            OpenAIRE
          </a>
          , a key infrastructure that enables the European transition to open
          science. We would also like to thank our data providers{" "}
          <a href="https://openaire.eu" target="_blank" rel="noreferrer">
            OpenAIRE
          </a>{" "}
          (all metadata),{" "}
          <a href="https://crossref.org" target="_blank" rel="noreferrer">
            CrossRef
          </a>{" "}
          (all citation data), and{" "}
          <a href="https://altmetric.com" target="_blank" rel="noreferrer">
            Altmetric
          </a>{" "}
          (all other metrics data).
        </p>

        <h3>Note on the use of metrics</h3>
        <p className="metric-info">
          Metrics are provided for indicative purposes only and cannot be used
          as-is in an evaluation. If you intend to use the metrics provided for
          evaluative purposes, consider relevant guidelines such as the{" "}
          <a
            href="http://www.leidenmanifesto.org/"
            target="_blank"
            rel="noreferrer"
          >
            Leiden Manifesto for Research Metrics
          </a>
          .
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
                        <a href={org.url} target="_blank" rel="noreferrer">
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
      </Modal.Body>
    </>
    // html template ends here
  );
};

export default ViperInfo;
