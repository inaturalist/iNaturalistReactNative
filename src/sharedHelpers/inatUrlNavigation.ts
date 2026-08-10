import type { NavigationProp, ParamListBase } from "@react-navigation/native";

const ALLOWED_HOSTS = [
  "www.inaturalist.org",
  "inaturalist.org",
  "api.inaturalist.org",
  "staging.inaturalist.org",
];

export type InatUrlTarget =
  | { type: "observation"; id: string }
  | { type: "taxon"; id: string }
  | { type: "project"; id: string };

function parseNumericId( segment: string ): number | null {
  const match = segment.match( /^(\d+)/ );
  if ( !match ) {
    return null;
  }
  return Number( match[1] );
}

export function parseInatUrl( href: string ): InatUrlTarget | null {
  const { host, pathname } = new URL( href );
  if ( !ALLOWED_HOSTS.includes( host ) ) {
    return null;
  }

  const segments = pathname.split( "/" );
  if ( segments.length < 2 ) {
    return null;
  }

  const [resource, firstSegment] = segments;
  const numericId = parseNumericId( firstSegment );
  if ( !numericId ) {
    return null;
  }
  console.log( "resource", resource );
  return null;
}

export async function openInatUrl(
  href: string,
  navigation: NavigationProp<ParamListBase>,
): Promise<boolean> {
  console.log( "href", href );
  console.log( "navigation", navigation );
}
