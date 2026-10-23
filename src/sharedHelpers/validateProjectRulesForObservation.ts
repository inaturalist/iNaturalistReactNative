import type { RealmObservationPojo } from "realmModels/types";

export type ProjectRuleStatus = "pass" | "fail" | "unknown";

// The operators traditional project admins can choose from, in display order.
// Others, e.g. the has_observation_field? rule the server adds for a required
// observation field, are skipped.
const DISPLAYED_RULE_OPERATORS = [
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

export type DisplayedRuleOperator = ( typeof DISPLAYED_RULE_OPERATORS )[number];

interface RuleTaxon {
  id: number;
}

interface ProjectRuleToValidate {
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
  operator: DisplayedRuleOperator;
  rules: ProjectRuleToValidate[];
  status: ProjectRuleStatus;
}

const statusFrom = ( passes: boolean ): ProjectRuleStatus => (
  passes
    ? "pass"
    : "fail"
);

// captive_flag is the owner's vote, which the API never returns, so it's only
// known for observations created or edited on this device
const evaluateCaptive = (
  observation: RealmObservationPojo,
  captive: boolean,
): ProjectRuleStatus => {
  if ( observation.captive_flag == null ) return "unknown";
  return statusFrom( observation.captive_flag === captive );
};

const isGeoreferenced = ( observation: RealmObservationPojo ) => (
  typeof observation.latitude === "number" && typeof observation.longitude === "number"
) || (
  typeof observation.privateLatitude === "number"
  && typeof observation.privateLongitude === "number"
);

const photoCount = ( observation: RealmObservationPojo ) => (
  observation.observationPhotos?.length ?? 0
);

const soundCount = ( observation: RealmObservationPojo ) => (
  observation.observationSounds?.length ?? 0
);

const observationTaxonId = ( observation: RealmObservationPojo ) => (
  observation.taxon?.id ?? observation.taxon_id
);

// Rails passes in_taxon? for observations without a taxon, leaving those to
// the identified? rule
const evaluateInTaxon = (
  observation: RealmObservationPojo,
  rule: ProjectRuleToValidate,
): ProjectRuleStatus => {
  const taxonId = observationTaxonId( observation );
  if ( taxonId == null ) return "pass";
  if ( taxonId === rule.operand_id ) return "pass";
  const ancestorIds = observation.taxon?.ancestor_ids;
  if ( !ancestorIds || ancestorIds.length === 0 ) return "unknown";
  return statusFrom( ancestorIds.some( id => id === rule.operand_id ) );
};

const evaluateRule = (
  observation: RealmObservationPojo,
  rule: ProjectRuleToValidate,
): ProjectRuleStatus => {
  switch ( rule.operator ) {
    case "captive?":
      return evaluateCaptive( observation, true );
    case "wild?":
      return evaluateCaptive( observation, false );
    case "georeferenced?":
      return statusFrom( isGeoreferenced( observation ) );
    case "has_a_photo?":
      return statusFrom( photoCount( observation ) > 0 );
    case "has_a_sound?":
      return statusFrom( soundCount( observation ) > 0 );
    case "has_media?":
      return statusFrom( photoCount( observation ) + soundCount( observation ) > 0 );
    case "identified?":
      return statusFrom( observationTaxonId( observation ) != null );
    case "in_taxon?":
      return evaluateInTaxon( observation, rule );
    default:
      // Needs data only the server has, e.g. place geometry, project list
      // taxa, membership settings, or the server-computed quality grade
      return "unknown";
  }
};

// A group fails only if every rule in it fails
const combineGroup = ( statuses: ProjectRuleStatus[] ): ProjectRuleStatus => {
  if ( statuses.includes( "pass" ) ) return "pass";
  if ( statuses.includes( "unknown" ) ) return "unknown";
  return "fail";
};

/**
 * Evaluates one traditional project's membership rules. Rules sharing an operator are
 * combined with OR and different operators with AND, so the observation
 * passes when no group fails. Groups that can't be checked on the device
 * are "unknown" and left to the server.
 */
export default function validateProjectRulesForObservation(
  observation: RealmObservationPojo,
  project: ProjectToValidate,
): ProjectRuleGroup[] {
  return DISPLAYED_RULE_OPERATORS.flatMap( operator => {
    const rules = project.project_observation_rules
      .filter( rule => rule.operator === operator );
    if ( rules.length === 0 ) return [];
    return [{
      operator,
      rules,
      status: combineGroup( rules.map( rule => evaluateRule( observation, rule ) ) ),
    }];
  } );
}
