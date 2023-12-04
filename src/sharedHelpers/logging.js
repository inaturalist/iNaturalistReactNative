// returns string representation of an object, intended for debugging
function inspect( target ) {
  return JSON.stringify( target );
}

// eslint-disable-next-line import/prefer-default-export
export { inspect };
