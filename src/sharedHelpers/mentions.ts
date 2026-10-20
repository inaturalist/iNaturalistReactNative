// Matches an @mention that ends at the end of the string it's run on (the text
// before the cursor).
// \B ensures @ doesn't follow a word char (to prevent matching emails)
// Username must start with a letter; the username is optional so a bare "@"
// also matches
const MENTION_BEFORE_CURSOR = /\B@([A-Za-z][\w-]*)?$/;
// Most users the mention list shows; matches the per_page of the user search
const MENTION_SUGGESTION_LIMIT = 10;

const STARTS_WITH_USERNAME_CHAR = /^[\w-]/;

interface Mention {
  // The part of the username typed before the cursor; "" for a bare "@"
  query: string;
  // Index of the "@"
  start: number;
  // Index of the cursor. Text after the cursor is never part of the mention,
  // so picking a user keeps it
  end: number;
}

function getMentionAtCursor( text: string, cursor: number ): Mention | null {
  const match = text.slice( 0, cursor ).match( MENTION_BEFORE_CURSOR );
  if ( !match || match.index === undefined ) return null;
  const query = match[1] ?? "";
  // A bare "@" only counts when nothing is attached to it after the cursor,
  // e.g. not when the cursor sits between "@" and "kueda" in "@kueda"
  if ( query === "" && STARTS_WITH_USERNAME_CHAR.test( text.slice( cursor ) ) ) {
    return null;
  }
  return { query, start: match.index, end: cursor };
}

// Replaces the mention with "@login", and returns the new text plus where the
// cursor should go. Adds a space after the mention at the end of the text or
// when letters follow it directly, and puts the cursor after the space that
// follows the mention, if there is one
function insertMention(
  text: string,
  mention: Mention,
  login: string,
): { text: string; cursor: number } {
  const before = `${text.slice( 0, mention.start )}@${login}`;
  const after = text.slice( mention.end );
  if ( after === "" || STARTS_WITH_USERNAME_CHAR.test( after ) ) {
    return { text: `${before} ${after}`, cursor: before.length + 1 };
  }
  return {
    text: `${before}${after}`,
    cursor: after.startsWith( " " )
      ? before.length + 1
      : before.length,
  };
}

export type { Mention };
export { getMentionAtCursor, insertMention, MENTION_SUGGESTION_LIMIT };
