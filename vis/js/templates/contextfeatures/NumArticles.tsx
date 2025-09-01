import React, { FC, ReactNode } from "react";

interface NumArticlesProps {
  articlesCount: number;
  articlesCountLabel: string;
  openAccessArticlesCount: number | null;
  service: string;
  children: ReactNode;
  modifierLimit: number;
  isStreamgraph?: boolean;
}

export const NumArticles: FC<NumArticlesProps> = ({
  articlesCount,
  articlesCountLabel,
  openAccessArticlesCount,
  service,
  children,
  modifierLimit,
  isStreamgraph,
}) => {
  let displayText:
    | ReactNode
    | string = `${articlesCount} ${articlesCountLabel}`;

  if (service === "orcid") {
    if (articlesCount >= modifierLimit) {
      displayText = (
        <>
          {modifierLimit} {children} works
        </>
      );
    } else {
      displayText = <>{articlesCount} works</>;
    }
  }

  if (service === "pubmed" || service === "base") {
    if (articlesCount >= 100 && !isStreamgraph) {
      displayText = (
        <>
          100 {children} {articlesCountLabel}
        </>
      );
    } else {
      displayText = (
        <>
          {articlesCount} {children} {articlesCountLabel}
        </>
      );
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
