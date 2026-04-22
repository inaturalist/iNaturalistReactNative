import type { UseSuggestionsSuggestion } from "./types";

const PROD_HUMAN_ID = 43584;

export const humanFilter = ( s: UseSuggestionsSuggestion ) => (
  s.taxon.id === PROD_HUMAN_ID
  || s.taxon.name === "Homo"
  || s.taxon.name === "Homo sapiens"
);

// If human is among the suggestions, *only* show human to avoid suggesting a
// photo of a person is not human
export default function isolateHumans( suggestions: UseSuggestionsSuggestion[] ) {
  const humanSuggestion = suggestions.find( humanFilter );

  if ( humanSuggestion ) {
    return [humanSuggestion];
  }
  return suggestions;
}
