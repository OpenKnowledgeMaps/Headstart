import dateFormat from "dateformat";

const exists = (param) =>
  typeof param !== "undefined" && param !== "null" && param !== null;

const contextLine = (state = {}, action) => {
  if (action.canceled) {
    return state;
  }

  const config = action.configObject;
  const context = action.contextObject;

  switch (action.type) {
    case "INITIALIZE":
      return {
        show: !!config.show_context && !!context.params,
        articlesCount: context.num_documents,
        modifier: getModifier(config, context),
        showModifierPopover:
          !!context.params &&
          context.params.sorting === "most-relevant" &&
          !!config.context_most_relevant_tooltip,
        openAccessCount: config.show_context_oa_number
          ? context.share_oa
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
        timespan: getTimespan(config, context),
        paperCount:
          config.create_title_from_context_style === "viper"
            ? context.num_papers
            : null,
        datasetCount:
          config.create_title_from_context_style === "viper"
            ? context.num_datasets
            : null,
        funder:
          config.create_title_from_context_style === "viper" && context.params
            ? context.params.funder
            : null,
        projectRuntime: getProjectRuntime(config, context),
        searchLanguage: getSearchLanguage(config, context),
        timestamp: getTimestamp(config, context),
        metadataQuality: getMetadataQuality(config, context),
      };
    default:
      return state;
  }
};

const getModifier = (config, context) => {
  if (
    !context.params ||
    !exists(context.params.sorting) ||
    context.num_documents < config.max_documents
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

const getTimespan = (config, context) => {
  if (!context.params || !context.params.from || !context.params.to) {
    return null;
  }

  const displayFormat = config.service === "doaj" ? "yyyy" : "d mmm yyyy";
  const hyphenFormat = config.service === "doaj" ? "yyyy" : "yyyy-mm-dd";

  let today = new Date();
  let from = new Date(context.params.from);
  let to = new Date(context.params.to);

  today.setTime(today.getTime() + today.getTimezoneOffset() * 60 * 1000);
  from.setTime(from.getTime() + from.getTimezoneOffset() * 60 * 1000);
  to.setTime(to.getTime() + to.getTimezoneOffset() * 60 * 1000);

  const defaultFromHyphenated = (function (service) {
    switch (service) {
      case "doaj":
        return "1809";
      case "pubmed":
        return "1809-01-01";
      case "base":
        return "1665-01-01";
      default:
        return "1970-01-01";
    }
  })(config.service);

  const fromHyphenated = dateFormat(from, hyphenFormat);
  const fromFormatted = dateFormat(from, displayFormat);
  const toFormatted = dateFormat(to, displayFormat);

  if (fromHyphenated !== defaultFromHyphenated) {
    return fromFormatted + " - " + toFormatted;
  }

  const toHyphenated = dateFormat(to, hyphenFormat);
  const todayHyphenated = dateFormat(today, hyphenFormat);

  if (toHyphenated === todayHyphenated) {
    return "All time";
  }

  return "Until " + toFormatted;
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

const getSearchLanguage = (config, context) => {
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
