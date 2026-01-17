const checkCamelAndSnakeCase = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  object: Record<string, any>,
  camelCaseKey: string,
): any => { // eslint-disable-line @typescript-eslint/no-explicit-any
  if ( !object ) { return ""; }
  const snakeCaseKey = camelCaseKey.replace( /[A-Z]/g, letter => `_${letter.toLowerCase()}` );

  return object[camelCaseKey] || object[snakeCaseKey];
};

export default checkCamelAndSnakeCase;
