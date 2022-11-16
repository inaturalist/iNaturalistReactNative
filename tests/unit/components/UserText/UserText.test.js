import { render, waitFor } from "@testing-library/react-native";
import UserText from "components/SharedComponents/UserText";
import React from "react";
import { inspect } from "sharedHelpers/logging";

describe( "Sanitization", () => {
  it( "HTML tags we don't support are not rendered", () => {
    const testText = `<div>
    <p>Welcome to iNaturalist</p>
    <p>Welcome to iNat <q>I should not be here</q></p>
    <script>I should also not be here</script>
    <body>Body</body>
    </div>`;
    const {
      queryByText
    } = render(
      <UserText text={testText} />
    );

    expect( queryByText( "Welcome to iNaturalist" ) ).toBeTruthy();
    // this test passes but it renders but since its in a p tag its ok?
    expect( queryByText( "I should not be here" ) ).toBeFalsy();
    expect( queryByText( "I should also not be here" ) ).toBeFalsy();
  } );

  it( "Allow all the HTML attributes we support on the web, but not the ones we don't", () => {
    const testText = `<div>
    <p style="font-size:100px">Welcome to iNaturalist</p>
    <img src="img_girl.jpg" alt="Girl in a jacket" width="500" height="600">
    </div>`;
    const { getByLabelText, toJSON } = render(
      <UserText text={testText} />
    );
    const json = toJSON( { inspect } );
    const { fontSize } = json.children[0].children[0]
      .children[0].children[0].children[0].props.style[0];
    // alt text renders as accessibilityLabel
    // waitFor gets rid of a warning relating to wrapping in act()
    waitFor( () => expect( getByLabelText( "Girl in a jacket" ) ).toBeTruthy() );

    // default font size is 14, check if no change
    expect( fontSize ).toEqual( 14 );
  } );

  it( "Link all @ mentions", () => {
    const testText = "@anglantis";
    const { getByRole, queryByText } = render(
      <UserText text={testText} />
    );

    expect( getByRole( "link" ) ).toBeTruthy();
    expect( queryByText( testText ) ).toBeTruthy();
  } );

  it( "Link all URLs", () => {
    const testText = "https://www.inaturalist.org";
    const { getByRole, queryByText } = render(
      <UserText text={testText} />
    );

    expect( getByRole( "link" ) ).toBeTruthy();
    expect( queryByText( testText ) ).toBeTruthy();
  } );

  it( "Sanitize HTML, e.g. close unclosed tags", () => {
    const testText = "<p>Welcome to iNat";
    const { queryByText } = render(
      <UserText text={testText} />
    );

    expect( queryByText( "Welcome to iNat" ) ).toBeTruthy();
  } );

  it( "Strip leading and trailing whitespace", () => {
    const testText = "<p>\n\nWelcome to iNat\n\n</p>";
    const { queryByText } = render(
      <UserText text={testText} />
    );

    expect( queryByText( "Welcome to iNat" ) ).toBeTruthy();
    expect( queryByText( "\n\nWelcome to iNat\n\n" ) ).toBeFalsy();
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
  } );

  it( "renders html", () => {
    const testText = "<p>Google Chrome is a web browser developed by Google </p>";
    const { queryByText } = render(
      <UserText text={testText} />
    );

    expect( queryByText( testText ) ).toBeFalsy();
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
  } );

  it( "Parse Markdown, lists", () => {
    const testText = ( `# This is Heading 1
    ## This is Heading 2
    1. List1
    2. List2
      This is a \`description\`  for List2 .\n
      * test
      * test
    3. List3
    4. List4.` );
    const { queryByText } = render(
      <UserText text={testText} />
    );

    expect( queryByText( testText ) ).toBeFalsy();
  } );
} );
