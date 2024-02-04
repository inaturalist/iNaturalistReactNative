import React, { useState } from "react";
import WebView from "react-native-webview";

// A WebView with custom headers that persist even when moving between pages
const CustomHeadersWebView = ( {
  source
} ) => {
  const [currentURI, setURI] = useState( source.uri );
  const newSource = { ...source, uri: currentURI };

  return (
    <WebView
      source={newSource}
      onShouldStartLoadWithRequest={request => {
        // If we're loading the current URI, allow it to load
        if ( request.url === currentURI ) return true;
        // We're loading a new URL -- change state first
        setURI( request.url );
        return false;
      }}
    />
  );
};
export default CustomHeadersWebView;
