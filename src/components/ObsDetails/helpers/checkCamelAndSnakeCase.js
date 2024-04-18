// @flow

const checkCamelAndSnakeCase = ( object: any, camelCaseKey: string ): ?string => {
  if ( !object ) { return ""; }
  const snakeCaseKey = camelCaseKey.replace( /[A-Z]/g, letter => `_${letter.toLowerCase()}` );

  return object[camelCaseKey] || object[snakeCaseKey];
};

export default checkCamelAndSnakeCase;
