import isValidEmail from "components/LoginSignUp/isValidEmail";

describe( "isValidEmail", ( ) => {
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
    "",
  ] )( "rejects %p", email => {
    expect( isValidEmail( email ) ).toBe( false );
  } );

  it.each( [
    "test@email.com",
    "o'brien@example.com",
    "first.last+tag@example.co.uk",
    "First.Last@Example.COM",
    "user@sub-domain.example.org",
    "user@xn--80ak6aa92e.xn--p1ai",
  ] )( "accepts %p", email => {
    expect( isValidEmail( email ) ).toBe( true );
  } );
} );
