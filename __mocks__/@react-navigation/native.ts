// 20240806 amanda - best practice for react navigation
// is actually not to mock navigation at all. I removed
// useFocusEffect so we can test how that actually works in
// components; it requires using the wrapInNavigationContainer
// helper around components with useFocusEffect
// https://reactnavigation.org/docs/testing/#best-practices

const actualNav = jest.requireActual( "@react-navigation/native" );

const useRoute = jest.fn( ( ) => ( { params: {} } ) );

const useNavigation = ( ) => ( {
  addListener: jest.fn( ),
  canGoBack: jest.fn( ( ) => true ),
  goBack: jest.fn( ),
  setOptions: jest.fn( ),
} );

module.exports = {
  ...actualNav,
  useNavigation,
  useRoute,
};
