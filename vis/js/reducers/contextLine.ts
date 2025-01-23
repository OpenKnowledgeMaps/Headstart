import { Context } from "../@types/context";
import { Config } from "../default-config";

const exists = (param: any) => {
  return typeof param !== "undefined" && param !== "null" && param !== null;
};

const contextLine = (state = {}, action: any) => {
  if (action.canceled) {
    return state;
  }

  const config = action.configObject;
  const context = action.contextObject;
  const papers = action.papers;

  switch (action.type) {
    case "INITIALIZE":
      return {
        isResearcherDetailsEnabled:
          action.configObject.isResearcherDetailsEnabled,
        isResearcherMetricsEnabled:
          action.configObject.isResearcherMetricsEnabled,
        showLanguage: action.configObject.showLanguage,
        show_h_index: context?.params?.enable_h_index === "true",
        show: !!config.show_context && !!context.params,
        articlesCount: papers.length,
        modifier: getModifier(config, context, papers.length),
        // ? should it be defined 200 by default?
        modifierLimit: context.params?.limit ? context.params.limit : 200,
        openAccessCount: config.show_context_oa_number
          ? papers.filter((p: any) => p.oa).length
          : null,
        showDataSource: !!config.showDataSource,
        showAuthor: !!config.is_authorview,
        author: {
          id: context?.params?.author_id
            ? String(context.params.author_id).replace(/\([^)]*\)/, "")
            : null,
          livingDates: context?.params?.living_dates ?? null,
          imageLink: context?.params?.image_link ?? null,
        },
        documentTypes: getDocumentTypes(config, context),
        dataSource:
          typeof config.service_name !== "undefined"
            ? config.service_name
            : config.service_names[context.service],
        contentProvider: context.params ? context.params.repo_name : null,
        // ! TODO
        paperCount:
          config.create_title_from_context_style === "viper"
            ? papers.filter((p: any) => p.resulttype.includes("publication"))
                .length
            : null,
        datasetCount:
          config.create_title_from_context_style === "viper"
            ? papers.filter((p: any) => p.resulttype.includes("dataset")).length
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
        // documents language used in new search box
        documentLang:
          context.params && context.params.lang_id
            ? getDocumentLanguage(config, context)
            : null,
        service: context.service,
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
export const getModifier = (
  config: Config,
  context: any,
  numOfPapers: number
) => {
  if (context.service === "orcid") {
    return "most-recent";
  }

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

const getDocumentTypes = (config: Config, context: any) => {
  if (!config.options || !context.params) {
    return null;
  }

  const propName = getPropName(context.params);
  if (!propName) {
    return null;
  }

  const documentTypesArray: string[] = [];
  // @ts-ignore
  const documentTypeObj = config.options?.find(
    (obj: any) => obj.id === propName
  );

  context.params[propName].forEach((type: any) => {
    const typeObj = documentTypeObj.fields.find((obj: any) => obj.id == type);
    if (typeof typeObj !== "undefined") {
      documentTypesArray.push(typeObj.text);
    }
  });

  return documentTypesArray;
};

const getPropName = (params: any) => {
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

const getProjectRuntime = (config: Config, context: any) => {
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

const getLegacySearchLanguage = (config: Config, context: Context) => {
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

const getTimestamp = (config: Config, context: Context) => {
  if (!config.show_context_timestamp || !context.last_update) {
    return null;
  }

  return context.last_update;
};

const getMetadataQuality = (config: Config, context: Context) => {
  if (
    !context.params ||
    !context.params.min_descsize ||
    isNaN(parseInt(context.params.min_descsize))
  ) {
    return null;
  }

  let minDescSize =
    typeof context.params.min_descsize === "string"
      ? parseInt(context.params.min_descsize)
      : context.params.min_descsize;

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

// get documents language from context parameters (from response)
const getDocumentLanguage = (config: Config, context: Context) => {
  if (!context.params || !context.params.lang_id) {
    return null;
  }

  const lang = context.params.lang_id;

  if (!lang) {
    return null;
  }

  return lang;
};

export default contextLine;
