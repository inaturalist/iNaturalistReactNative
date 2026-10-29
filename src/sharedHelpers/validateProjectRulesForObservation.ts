import type { RealmObservationPojo } from "realmModels/types";

// Validates an observation against the membership rules
// (project_observation_rules) of traditional projects

export type ProjectRuleStatus = "pass" | "fail" | "unknown";

// The operators traditional project admins can choose from, in display
// order. Rules with any other operator, e.g. the has_observation_field? rule
// the server adds for a required observation field, are not displayed or
// validated here.
export const DISPLAYED_RULE_OPERATORS = [
  "captive?",
  "wild?",
  "coordinates_shareable_by_project_curators?",
  "georeferenced?",
  "observed_in_place?",
  "has_a_photo?",
  "has_a_sound?",
  "has_media?",
  "verifiable?",
  "identified?",
  "in_taxon?",
  "on_list?",
] as const;

interface RuleTaxon {
  ancestor_ids?: number[];
  id: number;
}

export interface ProjectRuleToValidate {
  id: number;
  operand_id?: number | null;
  operator: string;
  taxon?: RuleTaxon;
}

interface ProjectToValidate {
  id: number;
  project_observation_rules: ProjectRuleToValidate[];
}

export interface ProjectRuleGroup {
  operator: string;
  projectId: number;
  rules: ProjectRuleToValidate[];
  status: ProjectRuleStatus;
}

export interface ProjectRulesValidationResult {
  valid: boolean;
  // Every displayed rule group in display order, including unknown ones
  groups: ProjectRuleGroup[];
  errors: ProjectRuleGroup[];
}

const statusFrom = ( passes: boolean ): ProjectRuleStatus => (
  passes
    ? "pass"
    : "fail"
);

// captive_flag is the owner's vote and captive the server's result. Rails
// ignores an uploaded captive_flag of false, so a local "wild" can't
// override a captive result
const isCaptive = ( observation: RealmObservationPojo ) => (
  observation.captive_flag === true || observation.captive === true
);

const isGeoreferenced = ( observation: RealmObservationPojo ) => (
  typeof observation.latitude === "number" && typeof observation.longitude === "number"
) || (
  typeof observation.privateLatitude === "number"
  && typeof observation.privateLongitude === "number"
);

const hasPhoto = ( observation: RealmObservationPojo ) => !!observation.observationPhotos?.length;

const hasSound = ( observation: RealmObservationPojo ) => !!observation.observationSounds?.length;

const hasMedia = ( observation: RealmObservationPojo ) => (
  hasPhoto( observation ) || hasSound( observation )
);

const hasDate = ( observation: RealmObservationPojo ) => (
  !Number.isNaN( Date.parse( observation.observed_on_string ?? "" ) )
  || !!observation.time_observed_at
  || !!observation.observed_on
);

// Matches Rails Observation#human?, which makes an observation casual
const isHuman = ( observation: RealmObservationPojo ) => {
  const name = observation.taxon?.name;
  return name === "Homo" || !!name?.startsWith( "Homo " );
};

const isVerifiable = ( observation: RealmObservationPojo ) => !isCaptive( observation )
  && !isHuman( observation )
  && hasMedia( observation )
  && isGeoreferenced( observation )
  && hasDate( observation );

const observationTaxonId = ( observation: RealmObservationPojo ) => (
  observation.taxon?.id ?? observation.taxon_id
);

// Rails passes in_taxon? for observations without a taxon, leaving those to
// the identified? rule
const evaluateInTaxon = (
  observation: RealmObservationPojo,
  rule: ProjectRuleToValidate,
): ProjectRuleStatus => {
  const ruleTaxonId = rule.taxon?.id ?? rule.operand_id;
  if ( ruleTaxonId == null ) return "unknown";
  const taxonId = observationTaxonId( observation );
  if ( taxonId == null ) return "pass";
  if ( taxonId === ruleTaxonId ) return "pass";
  const ancestorIds = observation.taxon?.ancestor_ids;
  if ( !ancestorIds || ancestorIds.length === 0 ) return "unknown";
  return statusFrom( ancestorIds.includes( ruleTaxonId ) );
};

const evaluateRule = (
  observation: RealmObservationPojo,
  rule: ProjectRuleToValidate,
): ProjectRuleStatus => {
  switch ( rule.operator ) {
    case "captive?":
      return statusFrom( isCaptive( observation ) );
    case "wild?":
      return statusFrom( !isCaptive( observation ) );
    case "georeferenced?":
      return statusFrom( isGeoreferenced( observation ) );
    case "has_a_photo?":
      return statusFrom( hasPhoto( observation ) );
    case "has_a_sound?":
      return statusFrom( hasSound( observation ) );
    case "has_media?":
      return statusFrom( hasMedia( observation ) );
    case "verifiable?":
      return statusFrom( isVerifiable( observation ) );
    case "identified?":
      return statusFrom( observationTaxonId( observation ) != null );
    case "in_taxon?":
      return evaluateInTaxon( observation, rule );
    case "observed_in_place?":
      return isGeoreferenced( observation )
        ? "unknown"
        : "fail";
    case "on_list?":
      return observationTaxonId( observation ) == null
        ? "fail"
        : "unknown";
    default:
      // Needs data only the server has, e.g. membership settings
      return "unknown";
  }
};

// Within a group of rules sharing an operator only one needs to pass
const combineGroup = ( statuses: ProjectRuleStatus[] ): ProjectRuleStatus => {
  if ( statuses.includes( "pass" ) ) return "pass";
  if ( statuses.includes( "unknown" ) ) return "unknown";
  return "fail";
};

/**
 * Evaluates one project's membership rules. Rules sharing an operator are
 * combined with OR and different operators with AND, so the observation
 * passes when no group fails. Groups that can't be checked on the device
 * are "unknown" and left to the server.
 */
export function validateProjectRules(
  observation: RealmObservationPojo,
  project: ProjectToValidate,
): ProjectRuleGroup[] {
  return DISPLAYED_RULE_OPERATORS.flatMap( operator => {
    const rules = project.project_observation_rules
      .filter( rule => rule.operator === operator );
    if ( rules.length === 0 ) return [];
    return [{
      operator,
      projectId: project.id,
      rules,
      status: combineGroup( rules.map( rule => evaluateRule( observation, rule ) ) ),
    }];
  } );
}

export default function validateProjectRulesForObservation(
  observation: RealmObservationPojo | null,
  projects: ProjectToValidate[],
): ProjectRulesValidationResult {
  if ( !observation ) return { valid: true, errors: [], groups: [] };
  const groups = projects.flatMap( project => validateProjectRules( observation, project ) );
  const errors = groups.filter( group => group.status === "fail" );
  return { valid: errors.length === 0, errors, groups };
}
