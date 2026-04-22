export function isObject( value: unknown ) {
  return typeof value === "object" && value !== null;
}

export function isPrimitive( value: unknown ) {
  return typeof value !== "function" && !isObject( value );
}

/**
 * Quick check to see that we just have single depth primitive object
 */
export function isObjectWithPrimitiveValues( value?: unknown ): value is Record<string, unknown> {
  return isObject( value ) && Object.values( value ).every( isPrimitive );
}
