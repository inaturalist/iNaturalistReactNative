import { render } from "@testing-library/react-native";
import UserText from "components/SharedComponents/UserText";
import React from "react";
import { inspect } from "sharedHelpers/logging";

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
    const testMention = "@anglantis";
    const testText = `<a href='not a URL'>${testMention}</a>`;
    const {
      getByRole, queryByText, toJSON
    } = render(
      <UserText text={testText} />
    );

    console.log( inspect( toJSON() ) );

    expect( getByRole( "link" ) ).toBeTruthy();
    expect( queryByText( testMention ) ).toBeTruthy();
    expect( queryByText( testMention ) ).toHaveProperty( "props.accessibilityRole", "link" );
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

    expect( queryByText( "This is a single line with a lloooooot of whitespace" ) ).toBeTruthy();
    expect( queryByText( testText ) ).toBeFalsy();
  } );
} );

describe( "Basic Rendering", () => {
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
    expect( queryByText( "This is Heading 1" ) ).toBeTruthy();
    // eslint-disable-next-line max-len
    expect( queryByText( "This is Heading 1" ) ).toHaveProperty( "props.style.0.fontWeight", "bold" );
  } );

  it( "renders html", () => {
    const testText = "<p>Welcome to <b>iNaturalist</b></p>";
    const { queryByText } = render(
      <UserText text={testText} />
    );

    expect( queryByText( testText ) ).toBeFalsy();
    expect( queryByText( "Welcome to" ) ).toBeTruthy();
    expect( queryByText( "iNaturalist" ) ).toBeTruthy();
    expect( queryByText( "Welcome to" ) ).not.toHaveProperty( "props.style.0.fontWeight", "bold" );
    expect( queryByText( "iNaturalist" ) ).toHaveProperty( "props.style.0.fontWeight", "bold" );
  } );

  it( "Parse Markdown, tables", () => {
    const testText = ( `| # | Name   | Age
      |---|--------|-----|
      | 1 | John   | 19  |
      | 2 | Sally  | 18  |
      | 3 | Stream | 20  |` );
    const { queryByText } = render(
      <UserText text={testText} />
    );

    expect( queryByText( testText ) ).toBeFalsy();
    expect( queryByText( "| # | Name | Age" ) ).toBeTruthy();
  } );

  it( "Parse Markdown, lists", () => {
    const testText = ( `
    1. List1
    2. List2
    3. List3
    4. List4.` );
    const { queryByText } = render(
      <UserText text={testText} />
    );
    expect( queryByText( testText ) ).toBeFalsy();
  } );
} );
