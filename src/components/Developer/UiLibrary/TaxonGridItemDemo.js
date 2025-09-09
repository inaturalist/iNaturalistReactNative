import { faker } from "@faker-js/faker";
import {
  Heading1,
  Heading2,
  ScrollViewWrapper
} from "components/SharedComponents";
import TaxonGridItem from "components/SharedComponents/TaxonGridItem";
import { View } from "components/styledComponents";
import { ExploreProvider } from "providers/ExploreContext";
import React from "react";

import { makePhoto } from "./ObsListItemDemo";

function makeTaxon( options = {} ) {
  return {
    uuid: faker.string.uuid( ),
    id: faker.number.int( ),
    name: faker.person.fullName(),
    preferred_common_name: faker.person.fullName(),
    rank: "species",
    rank_level: 10,
    ...options
  };
}

export function makeTaxonPhoto( options = {} ) {
  return {
    uuid: faker.string.uuid( ),
    photo: makePhoto( ),
    ...options
  };
}

const STYLE = {
  width: 200,
  height: 200
};

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
const TaxonGridItemDemo = ( ) => (
  <ExploreProvider>
    <ScrollViewWrapper>
      <View className="p-2">
        <Heading1>Media Preview</Heading1>
        <Heading2 className="my-2">Photo</Heading2>
        <TaxonGridItem
          taxon={makeTaxon( {
            default_photo: makePhoto( )
          } )}
          style={STYLE}
        />
        <Heading2 className="my-2">No Media</Heading2>
        <TaxonGridItem taxon={makeTaxon()} style={STYLE} />
        <Heading2 className="my-2">No Media w/ Iconic Taxon</Heading2>
        <TaxonGridItem
          taxon={makeTaxon( {
            iconic_taxon_name: "Arachnida"
          } )}
          style={STYLE}
        />
        <Heading2 className="my-2">Species Seen</Heading2>
        <TaxonGridItem
          taxon={makeTaxon( {
            default_photo: makePhoto( )
          } )}
          showSpeciesSeenCheckmark
          style={STYLE}
        />
        <Heading2 className="my-2">w/ Count</Heading2>
        <TaxonGridItem
          taxon={makeTaxon()}
          count={9999}
          style={STYLE}
        />
      </View>
    </ScrollViewWrapper>
  </ExploreProvider>
);

export default TaxonGridItemDemo;
