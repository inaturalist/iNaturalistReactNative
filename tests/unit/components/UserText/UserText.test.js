import { render } from "@testing-library/react-native";
import UserText from "components/SharedComponents/UserText";
import React from "react";
// import { inspect } from "sharedHelpers/logging";

// const alextest = `
// <div>
//   <h2>                       Google Chrome</h2>
//   <p>Google Chrome is a web browser developed by Google, released in 2008          .
//   Chrome is the world's most popular web browser today!        </p>
// </div>
// <script>console.log("this should not rpint)</script>
// <p>Welcome to the     team <a rel="nofollow" href="https://www.inaturalist.org/people/anglantis   ">@anglantis</a> and <a rel="nofollow" href="https://www.inaturalist.org/people/jtklein  ">@jtklein</a> ! Glad to have you here!`;

// const test2 = ( "  <div>  foo\n\nbar  baz  </div>  <div>zzz</div>  " );

// const testmd = ( `# This is Heading 1
// ## This is Heading 2
// 1. List1
// 2. List2
//   This is a \`description\`  for List2 .\n
//   * test
//   * test
// 3. List3
// 4. List4.` );

// const table1 = ( `| # | Name   | Age
//   |---|--------|-----|
//   | 1 | John   | 19  |
//   | 2 | Sally  | 18  |
//   | 3 | Stream | 20  |
//   ` );

describe( "Sanitization", () => {
// No need to test all of them, maybe just a few
  it.todo( "Parse all the HTML tags we support on the web, but not ones we don't, like <script>" );
  // No need to test all of them, maybe just a few
  // eslint-disable-next-line max-len
  it.todo( "Allow all the HTML attributes we support on the web, but not the ones we don't, like style" );
  it.todo( "Link all @ mentions" );
  it.todo( "Link all URLs" );
  it.todo( "Sanitize HTML, e.g. close unclosed tags" );
  it.todo( "Strip leading and trailing whitespace" );
} );

describe( "Basic Rendering", () => {
  it.todo( "Parse Markdown, tables" );
  it.todo( "Parse Markdown, lists" );
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
  } );

  it( "renders html", () => {
    const testText = "<p>Google Chrome is a web browser developed by Google </p>";
    const { queryByText } = render(
      <UserText text={testText} />
    );
    expect( queryByText( testText ) ).toBeFalsy();
  } );
} );
