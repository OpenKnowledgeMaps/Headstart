const author = (state = null, action) => {
  if (action.canceled || action.isStreamgraph) {
    return state;
  }
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        author_keywords: action.author?.author_keywords,
        author_name: action.author?.author_name,
        biography: action.author?.biography,
        country: action.author?.country,
        external_identifiers: action.author?.external_identifiers,
        orcid_id: action.author?.orcid_id,
        total_citations: action.author?.total_citations,
        total_neppr: action.author?.total_neppr,
        total_unique_social_media_mentions:
          action.author?.total_unique_social_media_mentions,
        websites: action.author?.websites,
        h_index: action.author?.h_index,
        academic_age: action.author?.academic_age,
        normalized_h_index: action.author?.normalized_h_index
      };
    default:
      return state;
  }
};

export default author;
