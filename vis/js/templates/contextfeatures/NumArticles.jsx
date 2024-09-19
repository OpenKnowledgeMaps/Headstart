import React from "react";

const NumArticles = ({
  articlesCount,
  articlesCountLabel,
  openAccessArticlesCount = null,
  service,
  children,
}) => {
  let displayText = `${articlesCount} ${articlesCountLabel}`;
  
  if (service === 'orcid') {
    if (articlesCount > 200) {
      displayText = <>200 {children} works</>;
    }
  }
  
  if (service === 'pubmed' || service === 'base') {
    if (articlesCount > 100) {
      displayText = <>100 {children} {articlesCountLabel}</>;
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
