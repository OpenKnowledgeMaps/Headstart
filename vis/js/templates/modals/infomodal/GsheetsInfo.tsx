// @ts-nocheck

import React from "react";
import { Modal } from "react-bootstrap";
import AboutSoftware from "./subcomponents/AboutSoftware";

const GsheetsInfo = ({
  params: {
    sheet_id,
    main_curator_email,
    main_curator_name,
    project_website,
    project_name,
  },
}) => {
  return (
    // html template starts here
    <>
      <Modal.Header closeButton>
        <Modal.Title id="info-title">About this knowledge map</Modal.Title>
      </Modal.Header>
      <Modal.Body id="info-body">
        <p>
          Knowledge maps provide an instant overview of a topic by showing the
          main areas at a glance and resources related to each area. This makes
          it possible to easily identify useful, pertinent information.
        </p>
        <p>
          Research areas are displayed as bubbles. By clicking on one of the
          bubbles, you can inspect the resources assigned to it. The size of the
          bubbles is relative to the number of resources assigned to it.
          Closeness of bubbles implies subject similarity. The closer two
          bubbles, the closer they are subject-wise. Centrality of bubbles
          implies subject similarity with the rest of the map, not importance.
          The closer a bubble is to the center, the closer it is subject-wise to
          all the other bubbles in the map.{" "}
        </p>
        <h3>Content</h3>
        <p>
          The content of this knowledge map is curated by{" "}
          <a className="link-popup" href={`mailto:${main_curator_email}`}>
            {main_curator_name}
          </a>{" "}
          as part of{" "}
          {project_website ? (
            <a
              href={project_website}
              className="link-popup"
              target="_blank"
              rel="noreferrer"
            >
              {project_name}
            </a>
          ) : (
            project_name
          )}
          . Resources are collected and annotated in{" "}
          <a
            href={`https://docs.google.com/spreadsheets/d/${sheet_id}/edit#gid=0`}
            className="link-popup"
            target="_blank"
            rel="noreferrer"
          >
            a spreadsheet
          </a>
          , which is then transformed into the knowledge map.
        </p>
        <h3>Rights</h3>
        <p>
          The curator(s) are solely responsible for the content of the knowledge
          map. Unless otherwise noted, all content is licensed under a{" "}
          <a
            className="link-popup"
            href="http://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noreferrer"
          >
            Creative Commons Attribution 4.0 International License
          </a>
          . The spreadsheet is made available under{" "}
          <a
            target="_blank"
            rel="noreferrer"
            className="link-popup"
            href="https://creativecommons.org/share-your-work/public-domain/cc0/"
          >
            CC0 (Public Domain Dedication)
          </a>
          . The knowledge mapping software is open source and hosted on{" "}
          <a
            className="link-popup"
            href="https://github.com/OpenKnowledgeMaps/Headstart"
            target="_blank"
            rel="noreferrer"
          >
            Github
          </a>
          .
        </p>
        <AboutSoftware />
      </Modal.Body>
    </>
    // html template ends here
  );
};

export default GsheetsInfo;
