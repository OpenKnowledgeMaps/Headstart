// @ts-nocheck

import React from "react";

type NumArticlesProps = {
  articlesCount: number;
  articlesCountLabel: string;
  openAccessArticlesCount?: number;
  service: string;
  children: string;
  modifierLimit: number;
  isStreamgraph?: boolean;
};

const NumArticles = ({
  articlesCount,
  articlesCountLabel,
  openAccessArticlesCount = null,
  service,
  children,
  modifierLimit,
  isStreamgraph
}: NumArticlesProps) => {
  let displayText = `${articlesCount} ${articlesCountLabel}`;

  if (service === "orcid") {
    if (articlesCount >= modifierLimit) {
      displayText = <>{modifierLimit} {children} works</>;
    } else {
      displayText = <>{articlesCount} works</>
    }
  }

  if (service === "pubmed" || service === "base") {
    if (articlesCount >= 100 && !isStreamgraph) {
      displayText = (
        <>
          100 {children} 
        </>
      );
    } else {
      displayText = <>{articlesCount} {children} {articlesCountLabel}</>
    }
  }

  return (
    <span id="num_articles" className="context_item">
      {displayText}{" "}
      {openAccessArticlesCount !== null && (
        <>({openAccessArticlesCount} open access)</>
      )}
    </span>
  );
};

export default NumArticles;
