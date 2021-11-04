export function APIRequest( who ) {
  if ( who === "google" ) {
    return fetch( "https://google.com" ).then( res => res.json( ) );
  } else {
    return "no argument provided";
  }
}
