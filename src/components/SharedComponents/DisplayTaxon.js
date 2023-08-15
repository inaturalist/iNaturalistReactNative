// @flow

import classnames from "classnames";
import { DisplayTaxonName } from "components/SharedComponents";
import { Image, Pressable, View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

const { useRealm } = RealmContext;

type Props = {
  handlePress: Function,
  taxon: Object,
  testID?: string,
  accessibilityLabel?: string,
  withdrawn?: boolean
}

const DisplayTaxon = ( {
  handlePress, taxon, testID, accessibilityLabel, withdrawn
}: Props ): Node => {
  const realm = useRealm( );
  const { t } = useTranslation( );

  const iconicTaxon = taxon?.iconic_taxon_name && realm?.objects( "Taxon" )
    .filtered( "name CONTAINS[c] $0", taxon?.iconic_taxon_name );

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center"
      onPress={handlePress}
      testID={testID}
      accessibilityLabel={accessibilityLabel || t( "Taxon-photo-and-name" )}
    >
      <Image
        source={{ uri: taxon?.default_photo?.url || iconicTaxon?.[0]?.default_photo?.url }}
        className={classnames(
          "w-[62px] h-[62px] rounded-lg",
          {
            "opacity-50": withdrawn
          }
        )}
        accessibilityIgnoresInvertColors
        testID="DisplayTaxon.image"
      />
      <View className="ml-3">
        <DisplayTaxonName taxon={taxon} withdrawn={withdrawn} />
      </View>
    </Pressable>
  );
};

export default DisplayTaxon;
