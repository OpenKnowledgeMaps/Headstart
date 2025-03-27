export interface Context {
  id: string;
  query: string;
  service: string;
  last_update?: string;
  timestamp?: string;
  params: {
    lang_id?: string;
    min_descsize?: string;
    orcid?: string;
    today?: string;
  };
}
