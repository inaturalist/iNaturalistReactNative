import parseEmail from "components/LoginSignUp/parseEmail";

describe( "parseEmail", ( ) => {
  it.each( [
    "lindasonn@yahoo.comv?b!'mm",
    "test@@email.com",
    "test@email",
    "test@email.",
    "test@email..com",
    "test@email.?com",
    "test@.email.com",
    "test @email.com",
    "test@-email.com",
    "@email.com",
    "test.email.com",
    "josé@example.com",
    "test@bü cher.de",
    "",
  ] )( "rejects %p", email => {
    expect( parseEmail( email ) ).toBeNull( );
  } );

  it.each( [
    "test@email.com",
    "o'brien@example.com",
    "first.last+tag@example.co.uk",
    "First.Last@Example.COM",
    "user@sub-domain.example.org",
    "user@xn--80ak6aa92e.xn--p1ai",
  ] )( "accepts %p unchanged", email => {
    expect( parseEmail( email ) ).toBe( email );
  } );

  it( "trims surrounding whitespace", ( ) => {
    expect( parseEmail( "  test@email.com \n" ) ).toBe( "test@email.com" );
  } );

  it.each( [
    ["anna@bücher.de", "anna@xn--bcher-kva.de"],
    ["Anna@BÜCHER.de", "Anna@xn--bcher-kva.de"],
    ["anna@bücher.de", "anna@xn--bcher-kva.de"],
    ["user@пример.рф", "user@xn--e1afmkfd.xn--p1ai"],
  ] )( "converts the internationalized domain in %p to punycode", ( email, expected ) => {
    expect( parseEmail( email ) ).toBe( expected );
  } );
} );
