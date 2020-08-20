import React from "react";

const NumArticles = ({
  articlesCount,
  articlesCountLabel,
  openAccessArticlesCount = null,
  children,
}) => (
  // html template starts here
  <span id="num_articles">
    {articlesCount} {children}
    {articlesCountLabel}{" "}
    {openAccessArticlesCount !== null && (
      <>({openAccessArticlesCount} open access)</>
    )}
  </span>
  // html template ends here
);

export default NumArticles;
