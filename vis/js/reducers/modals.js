const modals = (state = {}, action) => {
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
    default:
      return state;
  }
};

export default modals;
