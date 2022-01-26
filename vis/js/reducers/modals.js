const modals = (
  state = { reloadApiProperties: {}, infoParams: {} },
  action
) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        showShareButton: !!action.configObject.share_modal,
        twitterHashtags: action.configObject.hashtags_twitter_card,
        showEmbedButton: !!action.configObject.embed_modal,
        openEmbedModal: false,
        showFAQsButton: !!action.configObject.faqs_button,
        FAQsUrl: action.configObject.faqs_url,
        showViperEditButton: !!action.configObject.viper_edit_modal,
        openViperEditModal: false,
        viperEditObjID: action.contextObject.params
          ? action.contextObject.params.obj_id
          : null,
        showReloadButton: action.contextObject.service === "gsheets",
        reloadLastUpdate: action.contextObject.last_update,
        reloadApiProperties: {
          headstartPath: action.configObject.server_url,
          sheetID: getSheetID(action.configObject, action.contextObject),
          persistenceBackend: action.configObject.persistence_backend,
        },
        openInfoModal:
          state.openInfoModal !== undefined && !!action.configObject.show_intro,
        infoParams: action.contextObject
          ? {
              ...action.contextObject,
              params: undefined,
              ...action.contextObject.params,
            }
          : {},
        showPDFPreview: action.configObject.preview_type === "pdf",
        previewedPaper: null,
        useViewer: action.configObject.use_hypothesis,
        showCitationButton: !!action.configObject.show_cite_button,
        openCitationModal: false,
        citedPaper: null,
      };
    case "OPEN_EMBED_MODAL":
      return {
        ...state,
        openEmbedModal: true,
      };
    case "CLOSE_EMBED_MODAL":
      return {
        ...state,
        openEmbedModal: false,
      };
    case "OPEN_VIPER_EDIT_MODAL":
      return {
        ...state,
        openViperEditModal: true,
      };
    case "CLOSE_VIPER_EDIT_MODAL":
      return {
        ...state,
        openViperEditModal: false,
      };
    case "OPEN_INFO_MODAL":
      return {
        ...state,
        openInfoModal: true,
      };
    case "CLOSE_INFO_MODAL":
      return {
        ...state,
        openInfoModal: false,
      };
    case "SHOW_PREVIEW":
      return {
        ...state,
        previewedPaper: action.paper,
      };
    case "HIDE_PREVIEW":
      return {
        ...state,
        previewedPaper: null,
      };
    case "SHOW_CITE_PAPER":
      return {
        ...state,
        citedPaper: action.paper,
      };
    case "HIDE_CITE_PAPER":
      return {
        ...state,
        citedPaper: null,
      };
    case "OPEN_CITATION_MODAL":
      return {
        ...state,
        openCitationModal: true,
      };
    case "CLOSE_CITATION_MODAL":
      return {
        ...state,
        openCitationModal: false,
      };
    case "ZOOM_IN":
    case "ZOOM_OUT":
      return {
        ...state,
        openInfoModal: false,
        openEmbedModal: false,
        openViperEditModal: false,
        openCitationModal: false,
        previewedPaper: null,
        citedPaper: null,
      };

    default:
      return state;
  }
};

export default modals;

const getSheetID = (config, context) => {
  if (context.service !== "gsheets") {
    return null;
  }

  if (!config.files || !config.files.length) {
    return null;
  }

  return config.files[0].file;
};
