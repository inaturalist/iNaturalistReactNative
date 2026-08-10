import type { NavigationProp, ParamListBase } from "@react-navigation/native";

const ALLOWED_HOSTS = [
  "www.inaturalist.org",
  "inaturalist.org",
  "api.inaturalist.org",
  "staging.inaturalist.org",
];

export type InatUrlTarget =
  | { type: "observation"; id: number }
  | { type: "taxon"; id: number }
  | { type: "project"; id: number };

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

  const segments = pathname.split( "/" ).filter( Boolean );
  if ( segments.length < 2 ) {
    return null;
  }

  const [resource, firstSegment] = segments;
  const numericId = parseNumericId( firstSegment );
  if ( !numericId ) {
    return null;
  }

  switch ( resource ) {
    case "observations":
      return { type: "observation", id: numericId };
    case "taxa":
      return { type: "taxon", id: numericId };
    case "projects":
      return { type: "project", id: numericId };
    default:
      return null;
  }
}

export async function openInatUrl(
  parsed: InatUrlTarget,
  navigation: NavigationProp<ParamListBase>,
): Promise<boolean> {
  const { type, id } = parsed;
  switch ( type ) {
    case "taxon": {
      navigation.push( "TaxonDetails", { id } );
      return true;
    }
    default:
      return false;
  }
}
