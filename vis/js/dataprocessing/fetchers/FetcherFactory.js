import Fetcher from "./Fetcher";
import GsheetsFetcher from "./GsheetsFetcher";
import LocalFetcher from "./LocalFetcher";
import ServerFetcher from "./ServerFetcher";

class FetcherFactory {
  static getInstance(type, config) {
    switch (type) {
      case "local_files":
        return new LocalFetcher(config);
      case "gsheets":
        return new GsheetsFetcher(config);
      case "search_repos":
        return new ServerFetcher(config);
      default:
        return new Fetcher(config);
    }
  }
}

export default FetcherFactory;
