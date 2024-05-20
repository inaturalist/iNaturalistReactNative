// Helpers for making factoria modals

// Trivial toJSON implementation. Note that it is import to use the
// `function`` keyword here so that `this` refers to the actual factoria
// object and not the global scope
// eslint-disable-next-line import/prefer-default-export
export function toJSON( ) {
  const json = {};
  Object.keys( this ).forEach( key => {
    if ( typeof ( this[key] ) !== "function" ) {
      json[key] = this[key];
    }
  } );
  return json;
}
