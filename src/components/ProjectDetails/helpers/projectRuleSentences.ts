import type {
  ApiProjectObservationField,
  ApiProjectObservationRule,
} from "api/types";
import type { TFunction } from "i18next";

const ruleToSentence = (
  rule: ApiProjectObservationRule,
  t: TFunction,
): string | null => {
  switch ( rule.operator ) {
    case "georeferenced?":
      return t( "must-be-georeferenced" );
    case "captive?":
      return t( "must-be-captive-cultivated" );
    case "coordinates_shareable_by_project_curators?":
      return t( "observer-must-allow-project-curators-to-view-coordinates" );
    case "has_a_photo?":
      return t( "must-have-a-photo" );
    case "has_a_sound?":
      return t( "must-have-a-sound" );
    case "has_media?":
      return t( "must-have-media" );
    case "identified?":
      return t( "must-be-identified" );
    case "verifiable?":
      return t( "must-be-verifiable" );
    case "wild?":
      return t( "must-be-wild" );
    case "on_list?":
      return t( "must-be-on-list" );
    default:
      return null;
  }
};

console.log( "ruleToSentence", ruleToSentence );

const buildProjectRuleSentences = (
  rules: ApiProjectObservationRule[] | undefined,
  projectObservationFields: ApiProjectObservationField[] | undefined,
  t: TFunction,
): string[] => {
  if ( !rules?.length ) {
    return [];
  }

  console.log( "projectObservationFields", projectObservationFields );

  return rules.map( rule => {
    const sentence = ruleToSentence( rule, t );
    return sentence;
  } ).filter( text => text !== null );
};

export default buildProjectRuleSentences;
