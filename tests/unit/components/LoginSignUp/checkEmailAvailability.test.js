import { emailAvailable } from "components/LoginSignUp/AuthenticationService";
import checkEmailAvailability from "components/LoginSignUp/checkEmailAvailability";

jest.mock( "components/LoginSignUp/AuthenticationService", ( ) => ( {
  emailAvailable: jest.fn( ),
} ) );

describe( "checkEmailAvailability", ( ) => {
  it.each( [
    ["available", true, "available"],
    ["taken", false, "taken"],
    ["an error when the response has no answer", undefined, "error"],
  ] )( "is %s", async ( _description, available, expected ) => {
    emailAvailable.mockResolvedValueOnce( available );
    expect( await checkEmailAvailability( "someone@example.com" ) ).toBe( expected );
  } );

  it( "is an error when the request fails", async ( ) => {
    emailAvailable.mockRejectedValueOnce( new Error( "Network request failed" ) );
    expect( await checkEmailAvailability( "someone@example.com" ) ).toBe( "error" );
  } );
} );
