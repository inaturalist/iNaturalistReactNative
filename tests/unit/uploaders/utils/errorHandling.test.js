import { handleUploadError } from "uploaders";

describe( "errorHandling", ( ) => {
  // Mock translation function since we're passing that into the error handler
  const t = jest.fn( key => key );

  describe( "handleUploadError", ( ) => {
    beforeEach( ( ) => {
      jest.clearAllMocks( );
    } );

    test( "should throw basic errors without special handling", ( ) => {
      const error = new Error( "Basic error" );

      expect( ( ) => {
        handleUploadError( error, t );
      } ).toThrow( "Basic error" );
    } );

    test( "should return 'Connection problem' message for network errors", ( ) => {
      const networkError = new Error( "Network request failed" );

      const { message } = handleUploadError( networkError, t );

      expect( message ).toBe( "Connection-problem-Please-try-again-later" );
    } );

    test( "should return a string from an array of iNaturalist API errors", ( ) => {
      const apiError = new Error( "API Upload Error" );
      apiError.json = {
        errors: [
          { message: "First error" },
          { message: "Second error" }
        ]
      };

      const { message } = handleUploadError( apiError, t );

      expect( message ).toBe( "First error, Second error" );
    } );

    test( "should return a string from a nested array of iNaturalist API errors", ( ) => {
      const apiError = new Error( "API Error" );
      apiError.json = {
        errors: [
          { message: { errors: ["Error 1", "Error 2"] } }
        ]
      };

      const { message } = handleUploadError( apiError, t );

      expect( message ).toBe( "Error 1, Error 2" );
    } );

    test( "should return a string from a nested string "
      + "within iNaturalist API error messages", ( ) => {
      const apiError = new Error( "API Error" );
      apiError.json = {
        errors: [
          { message: { errors: "Nested error message string" } }
        ]
      };

      const { message } = handleUploadError( apiError, t );

      expect( message ).toBe( "Nested error message string" );
    } );

    test( "should handle 410 errors for previously deleted observations or evidence", ( ) => {
      const apiError = new Error( "API Error" );
      apiError.json = {
        errors: [
          { message: { error: "Resource was previously deleted" } }
        ]
      };

      const { message } = handleUploadError( apiError, t );

      expect( message ).toBe( "Resource was previously deleted" );
    } );
  } );
} );
