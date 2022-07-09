import factory from "../../../factory";

const testUser = factory( "RemoteUser" );
const mockExpected = testUser;

jest.mock( "../../../../src/components/LoginSignUp/AuthenticationService", ( ) => ( {
  authenticateUser: async ( ) => {
    this.loggedIn = true;
    return true;
  },
  signOut: async () => {
    this.loggedIn = false;
  },
  getUsername: async () => mockExpected.login,
  isLoggedIn: async () => this.loggedIn
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
    } )
  };
} );

test.todo( "renders login screen (not signed in)" );
// test( "renders login screen (not signed in)", async ( ) => {
//   const {getByTestId} = renderLogin();
//   expect( getByTestId( "Login.loginButton" ) ).toBeTruthy();
// } );

test.todo( "renders login screen and logins" );
// test( "renders login screen and logins", async ( ) => {
//   const {getByTestId, getByText} = renderLogin();
//   await waitFor( () => {
//     fireEvent.changeText( getByTestId( "Login.email" ), testUser.email );
//     fireEvent.changeText( getByTestId( "Login.password" ), EXPECTED_PASSWORD );
//     fireEvent.press( getByTestId( "Login.loginButton" ) );
//     expect( getByTestId( "Login.loggedInAs" ) ).toBeInTheDOM();
//     expect( getByText( `Logged in as: ${testUser.login}` ) ).toBeInTheDOM();
//   } );
// } );
