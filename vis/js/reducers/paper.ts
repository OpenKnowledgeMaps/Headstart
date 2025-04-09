const paper = (state = {}, action: any) => {
  if (action.canceled) {
    return state;
  }

  const { configObject } = action;

  switch (action.type) {
    case "INITIALIZE":
      return {
        showSocialMedia: !!configObject?.paper?.showSocialMedia,
        showReferences: !!configObject?.paper?.showReferences,
        showCitations: !!configObject?.paper?.showCitations,
        showPubmedCitations: !!configObject?.paper?.showPubmedCitations,
        showReaders: !!configObject?.paper?.showReaders,
        showTweets: !!configObject?.paper?.showTweets,
      };
    default:
      return state;
  }
};

export default paper;
