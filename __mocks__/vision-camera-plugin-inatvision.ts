export const getPredictionsForImage = jest.fn( () => Promise.resolve( { predictions: [] } ) );
export const getPredictionsForLocation = jest.fn( () => Promise.resolve( { predictions: [] } ) );
export const removeLogListener = jest.fn( );
export const resetStoredResults = jest.fn( );
export const lookUpLocation = jest.fn( location => ( {
  ...location,
  elevation: 12
} ) );
