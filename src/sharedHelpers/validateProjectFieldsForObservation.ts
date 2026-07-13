import type {
  RealmProjectObservationField,
} from "realmModels/types";

// Machine-readable reason codes. UI layers map these to localized
// strings; membership-rule validation uses a separate module with its
// own error strings.
export const MISSING_REQUIRED = "MISSING_REQUIRED" as const;
export const INVALID_NUMERIC = "INVALID_NUMERIC" as const;

export type ProjectFieldValidationReason =
  | typeof MISSING_REQUIRED
  | typeof INVALID_NUMERIC;

export type ProjectObservationFieldLike = Pick<
  RealmProjectObservationField,
  "required" | "obsField"
>;

interface ObservationFieldToValidate {
  datatype: string;
}

interface ProjectObservationFieldToValidate {
  required: boolean;
  obsField: ObservationFieldToValidate;
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
