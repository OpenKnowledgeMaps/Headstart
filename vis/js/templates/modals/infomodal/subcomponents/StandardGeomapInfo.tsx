import { FC, PropsWithChildren } from "react";
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

  const hasQuery = queryAfterConcatenate.length > 0;
  const hasCustomTitle = Boolean(saveCustomTitle);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title id="info-title">What's this?</Modal.Title>
      </Modal.Header>
      <Modal.Body id="info-body">
        {hasQuery && !hasCustomTitle && (
          <OverviewParagraph>{queryAfterConcatenate}</OverviewParagraph>
        )}
        {!hasQuery && hasCustomTitle && (
          <OverviewParagraph>{saveCustomTitle}</OverviewParagraph>
        )}
        {!hasQuery && !hasCustomTitle && (
          <OverviewParagraph>{null}</OverviewParagraph>
        )}
        {hasQuery && hasCustomTitle && (
          <>
            <OverviewParagraph>{saveCustomTitle}</OverviewParagraph>
            <CustomTitleParagraph>{queryAfterConcatenate}</CustomTitleParagraph>
          </>
        )}
        <AboutSoftware />
      </Modal.Body>
    </>
  );
};

const OverviewParagraph: FC<PropsWithChildren> = ({ children }) => (
  <p>
    This geo map presents you with an overview of{" "}
    <strong className="hs-strong">{children}</strong>.
  </p>
);

const CustomTitleParagraph: FC<PropsWithChildren> = ({ children }) => (
  <p>
    This map has a custom title and was created using the following query:{" "}
    <strong className="hs-strong">{children}</strong>
  </p>
);
