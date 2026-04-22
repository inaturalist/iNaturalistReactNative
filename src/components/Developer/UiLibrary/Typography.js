import {
  Body1,
  Body2,
  Body3,
  Body4,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List2,
  ScrollViewWrapper,
  Subheading1,
  UnderlinedLink,
  UserText,
} from "components/SharedComponents";
import { fontMonoClass, View } from "components/styledComponents";
import React from "react";

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
const Typography = ( ) => {
  const userText = `
    User-generated text should support markdown, like **bold**, *italic*, and [links](https://www.inaturalist.org).
  `.trim();
  return (
    <ScrollViewWrapper>
      <View className="p-4">
        <Heading1 className="my-2">Heading1</Heading1>
        <Heading2 className="my-2">Heading2</Heading2>
        <Heading3 className="my-2">Heading3</Heading3>
        <Heading4 className="my-2">Heading4</Heading4>
        <Heading4 className="my-2 text-inatGreen">
          Heading4 (non-default color)
        </Heading4>
        <Heading5 className="my-2">Heading5</Heading5>
        <Heading6 className="my-2">Heading6</Heading6>
        <Subheading1 className="my-2">Subheading1</Subheading1>
        <Body1 className="my-2">Body1</Body1>
        <Body2 className="my-2">Body2</Body2>
        <Body3 className="my-2">Body3</Body3>
        <Body4 className="my-2">Body4</Body4>
        <List2 className="my-2">List2</List2>
        <Heading3 className="my-2">UserText</Heading3>
        <Heading4 className="my-2">Source</Heading4>
        <Body2 className={fontMonoClass}>{userText}</Body2>
        <Heading4 className="mt-2">Result</Heading4>
        <UnderlinedLink className="my-2">UnderlinedLink</UnderlinedLink>
        <UserText text={userText} />
      </View>
    </ScrollViewWrapper>
  );
};

export default Typography;
