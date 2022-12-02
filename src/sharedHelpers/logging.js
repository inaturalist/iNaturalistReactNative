import util from "util";

// returns string representation of an object, intended for debugging
function inspect( target ) {
  return util.inspect( target, false, null, true );
}

// eslint-disable-next-line import/prefer-default-export
export { inspect };
