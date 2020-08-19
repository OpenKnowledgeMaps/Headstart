import React from "react";

const NumArticles = ({
  articlesCount,
  articlesCountLabel,
  openAccessArticlesCount = null,
  modifier,
}) => (
  // html template starts here
  <span id="num_articles">
    {articlesCount} {modifier}
    {articlesCountLabel}{" "}
    {openAccessArticlesCount !== null && (
      <>({openAccessArticlesCount} open access)</>
    )}
  </span>
  // html template ends here
);

export default NumArticles;
