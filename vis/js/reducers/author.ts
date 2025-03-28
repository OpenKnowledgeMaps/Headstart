const author = (state = {}, action: any) => {
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
        researcher_urls: action.author?.researcher_urls,
        orcid_id: action.author?.orcid_id,
        total_citations: action.author?.total_citations,
        total_neppr: action.author?.total_neppr,
        total_unique_social_media_mentions:
          action.author?.total_unique_social_media_mentions,
        websites: action.author?.websites,
        h_index: action.author?.h_index,
        academic_age: action.author?.academic_age,
        normalized_h_index: action.author?.normalized_h_index,
        // TODO: consider to remove employment?
        employment: action.author?.employment,
        employments: action.author?.employments,
        funds: action.author?.funds,
        educations: action.author?.educations,
        memberships: action.author?.memberships,
        distinctions: action.author?.distinctions,
        services: action.author?.services,
        enable_teaching_mentorship: action.contextObject?.params?.enable_teaching_mentorship === 'true',
        total_supervised_bachelor_students: action.author?.total_supervised_bachelor_students,
        total_supervised_master_students: action.author?.total_supervised_master_students,
        total_supervised_phd_students: action.author?.total_supervised_phd_students
      };
    default:
      return state;
  }
};

export default author;
