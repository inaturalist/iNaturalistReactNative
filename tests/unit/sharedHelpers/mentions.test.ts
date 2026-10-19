import { getMentionAtCursor, insertMention } from "sharedHelpers/mentions";

describe( "getMentionAtCursor", () => {
  it( "finds a mention at the end of the text", () => {
    const text = "hello @kue";
    expect( getMentionAtCursor( text, text.length ) ).toEqual( {
      query: "kue",
      start: 6,
      end: 10,
    } );
  } );

  it( "finds a mention in the middle of the text", () => {
    const text = "hello @kue and goodbye";
    expect( getMentionAtCursor( text, 10 ) ).toEqual( {
      query: "kue",
      start: 6,
      end: 10,
    } );
  } );

  it( "includes the rest of the username after the cursor", () => {
    const text = "hello @kueda and goodbye";
    expect( getMentionAtCursor( text, 9 ) ).toEqual( {
      query: "ku",
      start: 6,
      end: 12,
    } );
  } );

  it( "matches a bare @", () => {
    expect( getMentionAtCursor( "@", 1 ) ).toEqual( { query: "", start: 0, end: 1 } );
    expect( getMentionAtCursor( "hi @ there", 4 ) ).toEqual( { query: "", start: 3, end: 4 } );
  } );

  it( "does not match a bare @ with text attached after the cursor", () => {
    expect( getMentionAtCursor( "@kueda", 1 ) ).toBeNull( );
    expect( getMentionAtCursor( "@1", 1 ) ).toBeNull( );
  } );

  it( "does not match email addresses", () => {
    const text = "me@example";
    expect( getMentionAtCursor( text, text.length ) ).toBeNull( );
  } );

  it( "does not match @ followed by a digit", () => {
    const text = "@1abc";
    expect( getMentionAtCursor( text, text.length ) ).toBeNull( );
  } );

  it( "does not match once a space follows the username", () => {
    const text = "@kueda ";
    expect( getMentionAtCursor( text, text.length ) ).toBeNull( );
  } );

  it( "allows hyphens and underscores in the username", () => {
    const text = "@a_b-c";
    expect( getMentionAtCursor( text, text.length )?.query ).toBe( "a_b-c" );
  } );
} );

describe( "insertMention", () => {
  const mentionAt = ( text: string, cursor: number ) => {
    const mention = getMentionAtCursor( text, cursor );
    if ( !mention ) throw new Error( `No mention in "${text}" at ${cursor}` );
    return mention;
  };

  it( "adds a trailing space at the end of the text", () => {
    const text = "hello @ku";
    const mention = mentionAt( text, text.length );
    expect( insertMention( text, mention, "kueda" ) ).toEqual( {
      text: "hello @kueda ",
      cursor: 13,
    } );
  } );

  it( "replaces a partially typed username in the middle of the text", () => {
    const text = "hello @kuxx and goodbye";
    const mention = mentionAt( text, 9 );
    expect( insertMention( text, mention, "kueda" ) ).toEqual( {
      text: "hello @kueda and goodbye",
      cursor: 13,
    } );
  } );

  it( "does not add a space before punctuation", () => {
    const text = "@ku, hi";
    const mention = mentionAt( text, 3 );
    expect( insertMention( text, mention, "kueda" ) ).toEqual( {
      text: "@kueda, hi",
      cursor: 6,
    } );
  } );

  it( "does not add a space before a newline", () => {
    const text = "@ku\nnext line";
    const mention = mentionAt( text, 3 );
    expect( insertMention( text, mention, "kueda" ) ).toEqual( {
      text: "@kueda\nnext line",
      cursor: 6,
    } );
  } );

  it( "replaces a bare @", () => {
    const text = "hi @ there";
    const mention = mentionAt( text, 4 );
    expect( insertMention( text, mention, "kueda" ) ).toEqual( {
      text: "hi @kueda there",
      cursor: 10,
    } );
  } );
} );
