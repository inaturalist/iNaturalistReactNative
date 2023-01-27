import { getDefaultNormalizer, render } from "@testing-library/react-native";
import UserText from "components/SharedComponents/UserText";
import { trim } from "lodash";
import React from "react";

describe( "Sanitization", () => {
  it( "does not render HTML tags we don't support", () => {
    const paragraphTagContent = "Welcome to iNaturalist";
    const quoteTagContent = "quote tag";
    const scriptTagContent = "javascript tag";

    const testText = `<div>
    <p>${paragraphTagContent}</p>
    <p>They said <q>${quoteTagContent}</q></p>
    <script>${scriptTagContent}</script>
    </div>`;

    const {
      queryByText
    } = render(
      <UserText text={testText} />
    );
    expect( queryByText( paragraphTagContent ) ).toBeTruthy();
    expect( queryByText( quoteTagContent ) ).toBeFalsy();
    expect( queryByText( scriptTagContent ) ).toBeFalsy();
  } );

  it( "only allows the HTML attributes we support on the web", () => {
    const pTagText = "Welcome to iNaturalist";
    const altText = "Girl in a jacket";
    const testText = `<div>
      <p style="font-size:100px">${pTagText}</p>
      <img src="img_girl.jpg" alt=${altText} width="500" height="600">
      <p>fontSize</p>
      </div>`;
    const { queryByText, findByLabelText } = render(
      <UserText text={testText} />
    );

    // alt text renders as accessibilityLabel
    expect( findByLabelText( altText ) ).toBeTruthy();

    // default font size is 14, check if no change
    expect( queryByText( pTagText ) ).toHaveProperty( "props.style.0.fontSize", 14 );
  } );

  it( "links all @ mentions", () => {
    const testText = "@anglantis";
    const {
      queryByText
    } = render(
      <UserText text={testText} />
    );

    expect( queryByText( testText ) ).toHaveProperty( "props.accessibilityRole", "link" );
  } );

  it( "links all URLs", () => {
    const testText = "https://www.inaturalist.org";
    const { getByRole, queryByText } = render(
      <UserText text={testText} />
    );

    expect( getByRole( "link" ) ).toBeTruthy();
    expect( queryByText( testText ) ).toBeTruthy();
  } );

  it( "closes unclosed tags", () => {
    const testText = "<p>Welcome to iNat";
    const { queryByText } = render(
      <UserText text={testText} />
    );

    expect( queryByText( "Welcome to iNat" ) ).toBeTruthy();
  } );

  it( "strips leading and trailing whitespace", () => {
    const testText = " This is a single line with a lloooooot of whitespace   \n\n\n\n\n\n\n      ";
    const { queryByText } = render(
      <UserText text={testText} />
    );

    // By default, the ByText queries will strip the text used to find
    // elements, so since we want to test that UserText is performing that
    // stripping, we need to tell the query methods not to do that.
    // https://callstack.github.io/react-native-testing-library/docs/api-queries/#normalization
    const normalizer = getDefaultNormalizer( { trim: false } );

    expect( queryByText( trim( testText ), { normalizer } ) ).toBeTruthy();
    expect( queryByText( testText, { normalizer } ) ).toBeFalsy();
  } );
} );

describe( "Basic Rendering", () => {
  it( "should not have accessibility errors", () => {
    const testText = "foo bar baz";
    const userText = <UserText text={testText} />;

    expect( userText ).toBeAccessible();
  } );

  it( "renders text", () => {
    const testText = "foo bar baz";
    const { queryByText, getByText } = render(
      <UserText text={testText} />
    );

    expect( getByText( testText ) ).toBeTruthy();
    expect( queryByText( "asdfgh" ) ).toBeFalsy();
  } );

  it( "renders markdown", () => {
    const testText = "# This is Heading 1";
    const { queryByText } = render(
      <UserText text={testText} />
    );

    expect( queryByText( testText ) ).toBeFalsy();
    expect( queryByText( "This is Heading 1" ) )
      .toHaveProperty( "props.style.0.fontWeight", "bold" );
  } );

  it( "renders html", () => {
    const testText = "<p>Welcome to <b>iNaturalist</b></p>";
    const { queryByText } = render(
      <UserText text={testText} />
    );

    expect( queryByText( testText ) ).toBeFalsy();
    expect( queryByText( "Welcome to" ) ).not.toHaveProperty( "props.style.0.fontWeight", "bold" );
    expect( queryByText( "iNaturalist" ) ).toHaveProperty( "props.style.0.fontWeight", "bold" );
  } );

  // Cannot test table and list rendering, at least using this type of test.
  // Cannot tell if tables and lists are rendered successfully from component hierachy.
  // Possibly because of the components being rendered with an internal renderer in native module.
} );
