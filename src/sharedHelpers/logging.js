import util from "util";

function inspect( target ) {
  return util.inspect( target, false, null, true );
}

// eslint-disable-next-line import/prefer-default-export
export { inspect };
