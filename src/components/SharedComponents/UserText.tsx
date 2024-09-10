import { useNavigation } from "@react-navigation/native";
import { fontRegular } from "appConstants/fontFamilies.ts";
import linkifyHtml from "linkify-html";
import { Opts } from "linkifyjs";
import { isEqual, trim } from "lodash";
import MarkdownIt from "markdown-it";
import * as React from "react";
import { Linking, useWindowDimensions } from "react-native";
import HTML, { defaultSystemFonts } from "react-native-render-html";
import WebView from "react-native-webview";
import sanitizeHtml, { IOptions } from "sanitize-html";
import colors from "styles/tailwindColors";

const ALLOWED_TAGS = ( `
  a
  abbr
  acronym
  b
  blockquote
  br
  cite
  code
  del
  div
  dl
  dt
  em
  h1
  h2
  h3
  h4
  h5
  h6
  hr
  i
  img
  ins
  li
  ol
  p
  pre
  s
  small
  strike
  strong
  sub
  sup
  table
  tbody
  td
  t
  th
  thead
  tr
  tt
  ul
` ).split( /\s+/m ).filter( e => e !== "" );

const ALLOWED_ATTRIBUTES_NAMES = (
  "href src width height alt cite title class name abbr value align target rel"
).split( " " );

const ALLOWED_ATTRIBUTES = { a: ["href"] };
ALLOWED_TAGS.filter( tag => tag !== "a" )
  .forEach( tag => { ALLOWED_ATTRIBUTES[tag] = ALLOWED_ATTRIBUTES_NAMES; } );

const SANITIZE_HTML_CONFIG: IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: ALLOWED_ATTRIBUTES,
  allowedSchemes: ["http", "https"]
};

const LINKIFY_OPTIONS: Opts = {
  rel: "nofollow noopener",
  ignoreTags: ["a", "code", "pre"]
};

function hyperlinkMentions( text: string ) {
  return text.replace( /(\B)@([a-z][\\\w\\\-_]*)/g, "$1<a href='https://www.inaturalist.org/people/$2'>@$2</a>" );
}

interface Props extends React.PropsWithChildren {
  text: string,
  htmlStyle?: Object,
}

const UserText = ( {
  children,
  htmlStyle,
  text: textProp
} : Props ) => {
  const navigation = useNavigation( );

  // Allow stringified children to serve as text if no prop provided
  const text = textProp || children.toString( );
  const { width } = useWindowDimensions( );
  let html = trim( text );

  // replace ampersands in URL params with entities so they don't get
  // interpretted by safeHtml
  html = html.replace( /&(\w+=)/g, "&amp;$1" );

  const md = new MarkdownIt( {
    html: true,
    breaks: true
  } );

  md.renderer.rules.table_open = ( ) => "<table class=\"table\">\n";

  html = md.render( html );

  html = sanitizeHtml( hyperlinkMentions( html ), SANITIZE_HTML_CONFIG );
  // Note: markdown-it has a linkifier option too, but it does not allow you
  // to specify attributes like nofollow, so we're using linkifyjs, but we
  // are ignoring URLs in the existing tags that might have them like <a> and
  // <code>

  html = linkifyHtml( html, LINKIFY_OPTIONS );
  const baseStyle = {
    fontFamily: fontRegular,
    fontSize: 16,
    lineHeight: 22,
    color: colors.darkGray,
    ...htmlStyle
  };
  const fonts = [fontRegular, ...defaultSystemFonts];

  const renderersProps = {
    a: {
      onPress: ( event, href ) => {
        const peopleURL = "https://www.inaturalist.org/people/";
        if ( href.includes( peopleURL ) ) {
          // This is a mention, so we want to navigate to user profile screen
          event.preventDefault( );
          const login = href.replace( peopleURL, "" );
          navigation.navigate( "UserProfile", { login } );
          return;
        }
        // This is any other regular link
        Linking.openURL( href );
      }
    }
  };

  return (
    <HTML
      baseStyle={baseStyle}
      contentWidth={width}
      source={{ html }}
      WebView={WebView}
      systemFonts={fonts}
      renderersProps={renderersProps}
    />
  );
};

// Memoize to prevent excessive re-renders when HTML component is in a list
export default React.memo( UserText, ( oldProps, newProps ) => isEqual( oldProps, newProps ) );
