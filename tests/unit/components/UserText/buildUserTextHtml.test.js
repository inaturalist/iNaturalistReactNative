/* eslint-disable no-useless-escape */
import { buildUserTextHtml } from "components/SharedComponents/UserText";

// Frozen copy of userText fixture.
// Update fixture + snapshot if expanding coverage.
const TEST_USER_TEXT_FIXTURE = `
**bold**
[An observation with id](https://staging.inaturalist.org/observations/350544545)
*italics*

> blockquote
[A project with id](https://staging.inaturalist.org/projects/3545)

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

---

* unordered list
* second item

Normal text before
<p>Paragraph</p>
Normal text after

1. Ordered list
1. Second item

|table|up|top!|
|-|-|-|
|foo|bar|baz|

Choice lines of fine words
Separated by line breaks
Should look just fine, k?

1\. An escaped
13\. List
33\. is possible

<abbr title="Abbreviation abbreviation">HTML</abbr> is still <del>possible</del><ins>probable</ins>!
`;

describe( "building HTML for userText fixture", () => {
  it( "matches HTML snapshot", () => {
    expect( buildUserTextHtml( TEST_USER_TEXT_FIXTURE ) ).toMatchSnapshot( );
  } );
} );
