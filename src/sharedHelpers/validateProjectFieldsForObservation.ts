import ObservationFieldValue from "realmModels/ObservationFieldValue";
import type { RealmObservationPojo } from "realmModels/types";

// Machine-readable reason codes. UI layers map these to localized
// strings; membership-rule validation uses a separate module with its
// own error strings.
export const MISSING_REQUIRED = "MISSING_REQUIRED" as const;
export const INVALID_NUMERIC = "INVALID_NUMERIC" as const;

export type ProjectFieldValidationReason =
  | typeof MISSING_REQUIRED
  | typeof INVALID_NUMERIC;

export interface ProjectFieldValidationError {
  projectId: number;
  projectTitle: string;
  obsFieldId: number;
  fieldName: string;
  reason: ProjectFieldValidationReason;
}

export interface ProjectFieldValidationResult {
  valid: boolean;
  errors: ProjectFieldValidationError[];
}

interface ObservationFieldToValidate {
  datatype?: string;
  id: number;
  name?: string;
}

interface ProjectObservationFieldToValidate {
  obsField: ObservationFieldToValidate | null;
  required: boolean;
}

/**
 * Validates a single value param against a POF.
 *
 * Rules (parity with Android Legacy ProjectFieldViewer.isValid()):
 * - required: value must be non-empty after trim
 * - numeric datatype: a non-empty value must parse as a float, whether or
 *   not the field is required
 *
 * Returns null when valid.
 */
export function validateProjectFieldValue(
  pof: ProjectObservationFieldToValidate,
  value?: string | null,
): ProjectFieldValidationReason | null {
  const trimmed = ( value ?? "" ).trim( );
  if ( pof.required && trimmed === "" ) {
    return MISSING_REQUIRED;
  }
  if (
    pof.obsField?.datatype === "numeric"
    && trimmed !== ""
    // Number( ), unlike parseFloat( ), rejects things like
    // "1.5abc", matching Android Legacy's Float.valueOf
    && !Number.isFinite( Number( trimmed ) )
  ) {
    return INVALID_NUMERIC;
  }
  return null;
}

interface ProjectToValidate {
  id: number;
  projectObservationFields: ProjectObservationFieldToValidate[];
  title?: string;
}

/**
 * Validates an observation's OFVs against the observation fields (POFs) of
 * the given projects.
 *
 * OFVs are global per observation and keyed by obsFieldId, so two projects
 * sharing a field read the same OFV; when a shared required field is empty,
 * each project reports its own error.
 */
export default function validateProjectFieldsForObservation(
  // currentObservation in zustand is typed as RealmObservationPojo
  observation: RealmObservationPojo,
  projects: ProjectToValidate[],
): ProjectFieldValidationResult {
  const errors: ProjectFieldValidationError[] = [];
  projects.forEach( project => {
    project.projectObservationFields.forEach( pof => {
      const { obsField } = pof;
      if ( !obsField ) { return; }
      const ofv = ObservationFieldValue.findForObsField( observation, obsField.id );
      const reason = validateProjectFieldValue( pof, ofv?.value );
      if ( reason ) {
        errors.push( {
          projectId: project.id,
          projectTitle: project.title ?? "",
          obsFieldId: obsField.id,
          fieldName: obsField.name ?? "",
          reason,
        } );
      }
    } );
  } );
  return { valid: errors.length === 0, errors };
}
