export interface Query {
  text: string;
  parsedTerms: string[];
  highlightTerms: boolean;
  useLookBehind: boolean;
}
