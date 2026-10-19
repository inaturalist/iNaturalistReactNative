// Matches an @mention that ends at the end of the string it's run on (the text
// before the cursor).
// \B ensures @ doesn't follow a word char (to prevent matching emails)
// Username must start with a letter; the username is optional so a bare "@"
// also matches
const MENTION_BEFORE_CURSOR = /\B@([A-Za-z][\w-]*)?$/;
// The rest of a username the cursor is in the middle of
const USERNAME_AFTER_CURSOR = /^[\w-]*/;

interface Mention {
  // The part of the username typed before the cursor; "" for a bare "@"
  query: string;
  // Index of the "@"
  start: number;
  // Index just past the end of the username, including any part of it after
  // the cursor
  end: number;
}

function getMentionAtCursor( text: string, cursor: number ): Mention | null {
  const match = text.slice( 0, cursor ).match( MENTION_BEFORE_CURSOR );
  if ( !match || match.index === undefined ) return null;
  const query = match[1] ?? "";
  const rest = text.slice( cursor ).match( USERNAME_AFTER_CURSOR )?.[0] ?? "";
  // A bare "@" only counts when nothing is attached to it after the cursor,
  // e.g. not when the cursor sits between "@" and "1" in "@1"
  if ( query === "" && rest !== "" ) return null;
  return { query, start: match.index, end: cursor + rest.length };
}

// Replaces the mention with "@login", and returns the new text plus where the
// cursor should go. Adds a trailing space only at the end of the text, and
// puts the cursor after the space that follows the mention, if there is one
function insertMention(
  text: string,
  mention: Mention,
  login: string,
): { text: string; cursor: number } {
  const before = `${text.slice( 0, mention.start )}@${login}`;
  const after = text.slice( mention.end );
  if ( after === "" ) {
    return { text: `${before} `, cursor: before.length + 1 };
  }
  return {
    text: `${before}${after}`,
    cursor: after.startsWith( " " )
      ? before.length + 1
      : before.length,
  };
}

export type { Mention };
export { getMentionAtCursor, insertMention };
