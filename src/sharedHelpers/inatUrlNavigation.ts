import type { NavigationProp, ParamListBase } from "@react-navigation/native";

export type InatUrlTarget =
  | { type: "observation"; id: string }
  | { type: "taxon"; id: string }
  | { type: "project"; id: string }
export function parseInatUrl( href: string ): InatUrlTarget | null {
  console.log( "href", href );
}

export async function openInatUrl(
  href: string,
  navigation: NavigationProp<ParamListBase>,
): Promise<boolean> {
  console.log( "href", href );
  console.log( "navigation", navigation );
}
