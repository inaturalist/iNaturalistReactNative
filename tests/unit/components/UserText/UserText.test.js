import { getDefaultNormalizer, render, screen } from "@testing-library/react-native";
import UserText from "components/SharedComponents/UserText.tsx";
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

    render(
      <UserText text={testText} />
    );
    expect( screen.getByText( paragraphTagContent ) ).toBeTruthy();
    expect( screen.queryByText( quoteTagContent ) ).toBeFalsy();
    expect( screen.queryByText( scriptTagContent ) ).toBeFalsy();
  } );

  it( "only allows the HTML attributes we support on the web", async () => {
    const pTagText = "Welcome to iNaturalist";
    const altText = "Girl in a jacket";
    const testText = `<div>
      <p style="font-size:100px">${pTagText}</p>
      <img src="img_girl.jpg" alt="${altText}" width="500" height="600">
      <p>fontSize</p>
      </div>`;
    render(
      <UserText text={testText} />
    );

    // alt text renders as accessibilityLabel
    expect( await screen.findByLabelText( altText ) ).toBeTruthy();

    // default font size is 14, check if no change
    expect( screen.queryByText( pTagText ) ).toHaveProperty( "props.style.0.fontSize", 16 );
  } );

  it( "links all @ mentions", () => {
    const testText = "@anglantis";
    render(
      <UserText text={testText} />
    );

    expect( screen.queryByText( testText ) ).toHaveProperty( "props.accessibilityRole", "link" );
  } );

  it( "links all URLs", () => {
    const testText = "https://www.inaturalist.org";
    render(
      <UserText text={testText} />
    );

    expect( screen.getByRole( "link" ) ).toBeTruthy();
    expect( screen.getByText( testText ) ).toBeTruthy();
  } );

  it( "closes unclosed tags", () => {
    const testText = "<p>Welcome to iNat";
    render(
      <UserText text={testText} />
    );

    expect( screen.getByText( "Welcome to iNat" ) ).toBeTruthy();
  } );

  it( "strips leading and trailing whitespace", () => {
    const testText = " This is a single line with a lloooooot of whitespace   \n\n\n\n\n\n\n      ";
    render(
      <UserText text={testText} />
    );

    // By default, the ByText queries will strip the text used to find
    // elements, so since we want to test that UserText is performing that
    // stripping, we need to tell the query methods not to do that.
    // https://callstack.github.io/react-native-testing-library/docs/api-queries/#normalization
    const normalizer = getDefaultNormalizer( { trim: false } );

    expect( screen.getByText( trim( testText ), { normalizer } ) ).toBeTruthy();
    expect( screen.queryByText( testText, { normalizer } ) ).toBeFalsy();
  } );
} );

describe( "Basic Rendering", () => {
  it( "should not have accessibility errors", () => {
    // const testText = "foo bar baz";
    // const userText = <UserText text={testText} />;

    // Disabled during the update to RN 0.78
    // expect( userText ).toBeAccessible();
  } );

  it( "renders text", () => {
    const testText = "foo bar baz";
    render(
      <UserText text={testText} />
    );

    expect( screen.getByText( testText ) ).toBeTruthy();
    expect( screen.queryByText( "asdfgh" ) ).toBeFalsy();
  } );

  it( "renders markdown", () => {
    const testText = "# This is Heading 1";
    render(
      <UserText text={testText} />
    );

    expect( screen.queryByText( testText ) ).toBeFalsy();
    expect( screen.queryByText( "This is Heading 1" ) )
      .toHaveProperty( "props.style.0.fontWeight", "bold" );
  } );

  it( "renders html", () => {
    const testText = "<p>Welcome to <b>iNaturalist</b></p>";
    render(
      <UserText text={testText} />
    );

    expect( screen.queryByText( testText ) ).toBeFalsy();
    expect( screen.queryByText( "Welcome to" ) )
      .not.toHaveProperty( "props.style.0.fontWeight", "bold" );
    expect( screen.queryByText( "iNaturalist" ) )
      .toHaveProperty( "props.style.0.fontWeight", "bold" );
  } );

  // Cannot test table and list rendering, at least using this type of test.
  // Cannot tell if tables and lists are rendered successfully from component hierachy.
  // Possibly because of the components being rendered with an internal renderer in native module.
} );
