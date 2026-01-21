import { FC } from "react";
import { Modal } from "react-bootstrap";

import { queryConcatenator } from "@/js/utils/data";
import { unescapeHTML } from "@/js/utils/unescapeHTMLentities";

import AboutSoftware from "./AboutSoftware";

interface StandardGeomapInfoProps {
  params: {
    query: string;
    customTitle: string;
    q_advanced: string;
  };
}

export const StandardGeomapInfo: FC<StandardGeomapInfoProps> = ({ params }) => {
  const { query, customTitle, q_advanced: queryAdvanced } = params;

  const queryAfterConcatenate = queryConcatenator([query, queryAdvanced]);
  const saveCustomTitle = customTitle && unescapeHTML(customTitle);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title id="info-title">What's this?</Modal.Title>
      </Modal.Header>
      <Modal.Body id="info-body">
        {(!!saveCustomTitle || !!query || !!queryAdvanced) && (
          <p>
            This geo map presents you with an overview of{" "}
            <strong className="hs-strong">
              {saveCustomTitle ? saveCustomTitle : queryAfterConcatenate}
            </strong>
          </p>
        )}
        {!!saveCustomTitle && (
          <p>
            This map has a custom title and was created using the following
            query:{" "}
            <strong className="hs-strong">{queryAfterConcatenate}</strong>
          </p>
        )}
        <AboutSoftware />
      </Modal.Body>
    </>
  );
};
