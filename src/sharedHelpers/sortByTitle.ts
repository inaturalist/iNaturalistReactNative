interface Titled {
  id: number;
  title?: string | null;
}

function titleCollator( locale: string | undefined ): Intl.Collator {
  const options = { sensitivity: "accent" as const };
  try {
    if ( !locale ) return new Intl.Collator( undefined, options );
    const [supportedLocale] = Intl.Collator.supportedLocalesOf( locale );
    return new Intl.Collator( supportedLocale, options );
  } catch {
    return new Intl.Collator( undefined, options );
  }
}

function compareByTitle( left: Titled, right: Titled, collator: Intl.Collator ): number {
  const leftTitle = left.title?.trim() ?? "";
  const rightTitle = right.title?.trim() ?? "";
  if ( !leftTitle && !rightTitle ) return left.id - right.id;
  if ( !leftTitle ) return 1;
  if ( !rightTitle ) return -1;
  const byTitle = collator.compare( leftTitle, rightTitle );
  if ( byTitle === 0 ) return left.id - right.id;
  return byTitle;
}

export default function sortByTitle<T extends Titled>(
  items: readonly T[],
  locale: string | undefined,
): T[] {
  const collator = titleCollator( locale );
  return items.slice( ).sort( ( left, right ) => compareByTitle( left, right, collator ) );
}
