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
export function parseInatUrl( href: string ): InatUrlTarget | null {
  const { host, pathname } = new URL( href );
  if ( !ALLOWED_HOSTS.includes( host ) ) {
    return null;
  }
  const segments = pathname.split( "/" );
  if ( segments.length < 2 ) {
    return null;
  }
  console.log( "segments", segments );
  return null;
}

export async function openInatUrl(
  href: string,
  navigation: NavigationProp<ParamListBase>,
): Promise<boolean> {
  console.log( "href", href );
  console.log( "navigation", navigation );
}
