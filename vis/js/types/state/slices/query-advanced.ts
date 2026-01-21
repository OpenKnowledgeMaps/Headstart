export interface QueryAdvanced {
  text: string | null;
  parsedTerms: string[];
  highlightTerms: boolean;
  useLookBehind: boolean;
}
