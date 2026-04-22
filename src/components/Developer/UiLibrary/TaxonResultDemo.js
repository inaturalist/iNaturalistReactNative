import { faker } from "@faker-js/faker";
import {
  Heading1,
  ScrollViewWrapper,
  TaxonResult,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";

import { makePhoto } from "./ObsListItemDemo";

const AVES = {
  id: 1,
  name: "Aves",
  preferred_common_name: "Birds",
  rank: "class",
  rank_level: 80,
  iconic_taxon_name: "Aves",
  isIconic: true,
};

function makeTaxonWithPhoto( options = {} ) {
  return {
    _synced_at: faker.date.past( ),
    id: faker.number.int( ),
    is_active: true,
    name: faker.person.fullName( ),
    preferred_common_name: faker.person.fullName( ),
    rank: "species",
    rank_level: 10,
    default_photo: makePhoto( ),
    ...options,
  };
}

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
const TaxonResultDemo = ( ) => (
  <ScrollViewWrapper>
    <View className="p-2">
      <Heading1>Remote data loading</Heading1>
      <TaxonResult
        taxon={AVES}
        accessibilityLabel="ui library"
      />
      <Heading1>Taxon w/ photo</Heading1>
      <TaxonResult
        taxon={makeTaxonWithPhoto()}
        fetchRemote={false}
        fromLocal={false}
        accessibilityLabel="ui library"
      />
      <Heading1>Iconic taxon</Heading1>
      <TaxonResult
        taxon={AVES}
        fetchRemote={false}
        fromLocal={false}
        accessibilityLabel="ui library"
      />
    </View>
  </ScrollViewWrapper>
);

export default TaxonResultDemo;
