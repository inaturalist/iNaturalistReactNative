// ported from https://github.com/i18next/react-i18next/blob/master/example/test-jest/src/__mocks__/react-i18next.js

const React = require( "react" );
// const reactI18next = require( "react-i18next" );

const hasChildren = node => node && ( node.children || ( node.props && node.props.children ) );

const getChildren = node => ( node && node.children
  ? node.children
  : node.props && node.props.children );

const renderNodes = reactNodes => {
  if ( typeof reactNodes === "string" ) {
    return reactNodes;
  }

  return Object.keys( reactNodes ).map( ( key, i ) => {
    const child = reactNodes[key];
    const isElement = React.isValidElement( child );

    if ( typeof child === "string" ) {
      return child;
    }
    if ( hasChildren( child ) ) {
      // eslint-disable-next-line testing-library/render-result-naming-convention
      const inner = renderNodes( getChildren( child ) );
      // eslint-disable-next-line react/no-array-index-key
      return React.cloneElement( child, { ...child.props, key: i }, inner );
    }
    if ( typeof child === "object" && !isElement ) {
      return Object.keys( child ).reduce( ( str, childKey ) => `${str}${child[childKey]}`, "" );
    }

    return child;
  } );
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const useMock = [k => k, { changeLanguage: ( ) => new Promise( ( ) => { } ) }];
useMock.t = k => k;
// eslint-disable-next-line @typescript-eslint/no-empty-function
useMock.i18n = { changeLanguage: ( ) => new Promise( ( ) => { } ) };

module.exports = {
  // this mock makes sure any components using the translate HoC receive the t function as a prop
  withTranslation: () => Component => function ( props ) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Component t={k => k} {...props} />;
  },
  // eslint-disable-next-line no-nested-ternary
  Trans: ( { children, i18nKey } ) => ( !children
    ? i18nKey
    : Array.isArray( children )
      ? renderNodes( children )
      : renderNodes( [children] ) ),
  Translation: ( { children } ) => children( k => k, { i18n: {} } ),
  useTranslation: () => useMock,

  // // mock if needed
  // I18nextProvider: reactI18next.I18nextProvider,
  // initReactI18next: reactI18next.initReactI18next,
  // setDefaults: reactI18next.setDefaults,
  // getDefaults: reactI18next.getDefaults,
  // setI18n: reactI18next.setI18n,
  // getI18n: reactI18next.getI18n
};
