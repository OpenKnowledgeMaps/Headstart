const exists = (param) =>
  typeof param !== "undefined" && param !== "null" && param !== null;

const contextLine = (state = {}, action) => {
  if (action.canceled) {
    return state;
  }

  const config = action.configObject;
  const context = action.contextObject;
  const papers = action.papers;

  switch (action.type) {
    case "INITIALIZE":
      return {
        show: !!config.show_context && !!context.params,
        articlesCount: papers.length,
        modifier: getModifier(config, context, papers.length),
        openAccessCount: config.show_context_oa_number
          ? papers.filter((p) => p.oa).length
          : null,
        showAuthor:
          !!config.is_authorview &&
          !!context.params &&
          exists(context.params.author_id) &&
          exists(context.params.living_dates) &&
          exists(context.params.image_link),
        author: {
          id:
            context.params && context.params.author_id
              ? String(context.params.author_id).replace(/\([^)]*\)/, "")
              : null,
          livingDates: context.params ? context.params.living_dates : null,
          imageLink: context.params ? context.params.image_link : null,
        },
        documentTypes: getDocumentTypes(config, context),
        dataSource:
          typeof config.service_name !== "undefined"
            ? config.service_name
            : config.service_names[context.service],
        paperCount:
          config.create_title_from_context_style === "viper"
            ? papers.filter((p) => p.resulttype.includes("publication")).length
            : null,
        datasetCount:
          config.create_title_from_context_style === "viper"
            ? papers.filter((p) => p.resulttype.includes("dataset")).length
            : null,
        funder:
          config.create_title_from_context_style === "viper" && context.params
            ? context.params.funder
            : null,
        projectRuntime: getProjectRuntime(config, context),
        // probably deprecated, used in base in the past
        legacySearchLanguage: getLegacySearchLanguage(config, context),
        // new language version, used in triple
        searchLanguage:
          context.params && context.params.language
            ? context.params.language
            : null,
        timestamp: getTimestamp(config, context),
        metadataQuality: getMetadataQuality(config, context),
      };
    default:
      return state;
  }
};

/**
 * Returns the search modifier (how the searched papers are selected).
 *
 * @param {Object} config the config object
 * @param {Object} context the context object
 *
 * @returns {string} either most-recent, most-relevant or null
 */
export const getModifier = (config, context, numOfPapers) => {
  if (
    !context.params ||
    !exists(context.params.sorting) ||
    (numOfPapers < config.max_documents &&
      // temporarily allowing most relevant label for fewer documents
      // (after a backend change this should be removed and refactored)
      context.params.sorting !== "most-relevant")
  ) {
    return null;
  }

  return context.params.sorting;
};

const getDocumentTypes = (config, context) => {
  if (!config.options || !context.params) {
    return null;
  }

  const propName = getPropName(context.params);
  if (!propName) {
    return null;
  }

  const documentTypesArray = [];
  const documentTypeObj = config.options.find((obj) => obj.id === propName);

  context.params[propName].forEach((type) => {
    const typeObj = documentTypeObj.fields.find((obj) => obj.id == type);
    if (typeof typeObj !== "undefined") {
      documentTypesArray.push(typeObj.text);
    }
  });

  return documentTypesArray;
};

const getPropName = (params) => {
  if (Object.prototype.hasOwnProperty.call(params, "document_types")) {
    return "document_types";
  }
  if (Object.prototype.hasOwnProperty.call(params, "include_content_type")) {
    return "include_content_type";
  }
  if (Object.prototype.hasOwnProperty.call(params, "article_types")) {
    return "article_types";
  }

  return null;
};

const getProjectRuntime = (config, context) => {
  if (
    config.create_title_from_context_style !== "viper" ||
    !context.params ||
    !context.params.start_date ||
    !context.params.end_date
  ) {
    return null;
  }

  return `${context.params.start_date.slice(
    0,
    4
  )}–${context.params.end_date.slice(0, 4)}`;
};

const getLegacySearchLanguage = (config, context) => {
  if (
    !context.params ||
    !context.params.lang_id ||
    !config.options ||
    !config.options.languages
  ) {
    return null;
  }

  const lang = config.options.languages.find(
    (lang) => lang.code === context.params.lang_id
  );

  if (!lang) {
    return null;
  }

  return "Language: " + lang.lang_in_lang + " (" + lang.lang_in_eng + ") ";
};

const getTimestamp = (config, context) => {
  if (!config.show_context_timestamp || !context.last_update) {
    return null;
  }

  return context.last_update;
};

const getMetadataQuality = (config, context) => {
  if (!context.params || isNaN(context.params.min_descsize)) {
    return null;
  }

  let minDescSize = parseInt(context.params.min_descsize);

  if (context.service === "base") {
    if (minDescSize < 300) {
      return "low";
    }

    return "high";
  }

  if (context.service === "pubmed") {
    if (minDescSize === 0) {
      return "low";
    }

    return "high";
  }

  return null;
};

export default contextLine;
