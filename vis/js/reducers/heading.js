const context = (state = {}, action) => {
  if (action.canceled) {
    return state;
  }
  
  switch (action.type) {
    case "INITIALIZE":
      return {
        title: action.contextObject.params
          ? action.contextObject.params.title
          : undefined,
        acronym: action.contextObject.params
          ? action.contextObject.params.acronym
          : undefined,
        projectId: action.contextObject.params
          ? action.contextObject.params.project_id
          : undefined,
        presetTitle: action.configObject.title,
        titleStyle: getTitleStyle(action.configObject),
        titleLabelType: getTitleLabelType(action.configObject),
        customTitle: action.configObject.custom_title,
      };
    default:
      return state;
  }
};

const getTitleStyle = (config) => {
  if (config.create_title_from_context) {
    if (config.create_title_from_context_style) {
      return config.create_title_from_context_style;
    }

    return "standard";
  }

  return null;
};

const getTitleLabelType = (config) => {
  if (config.is_authorview && config.is_streamgraph) {
    return "authorview-streamgraph";
  }

  if (config.is_authorview && !config.is_streamgraph) {
    return "authorview-knowledgemap";
  }

  if (config.is_streamgraph) {
    return "keywordview-streamgraph";
  }

  return "keywordview-knowledgemap";
};

export default context;
