// eslint-disable-next-line import/prefer-default-export
export const sleep = ms => new Promise( resolve => {
  setTimeout( resolve, ms );
} );
