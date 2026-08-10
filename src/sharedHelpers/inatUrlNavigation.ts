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

  const segments = pathname.split( "/" ).filter( Boolean );
  if ( segments.length < 2 ) {
    return null;
  }

  const [resource, firstSegment] = segments;

  switch ( resource ) {
    case "observations":
      return { type: "observation", id: firstSegment };
    case "taxa":
      return { type: "taxon", id: firstSegment };
    case "projects":
      return { type: "project", id: firstSegment };
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
      const taxonID = parseNumericId( id );
      if ( taxonID ) {
        navigation.push( "TaxonDetails", { id: taxonID } );
        return true;
      }
      return true;
    }
    default:
      return false;
  }
}
