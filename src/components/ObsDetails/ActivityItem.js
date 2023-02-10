// @flow

// import { useQueryClient } from "@tanstack/react-query";
// import { isCurrentUser } from "components/LoginSignUp/AuthenticationService";
import ActivityHeader from "components/ObsDetails/ActivityHeader";
import UserText from "components/SharedComponents/UserText";
import {
  Pressable, Text, View
} from "components/styledComponents";
import { t } from "i18next";
import _ from "lodash";
// import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import Taxon from "realmModels/Taxon";
import useIsConnected from "sharedHooks/useIsConnected";
import { textStyles } from "styles/obsDetails/obsDetails";

import TaxonImage from "./TaxonImage";

// const { useRealm } = RealmContext;

type Props = {
  item: Object,
  navToTaxonDetails: Function,
  toggleRefetch: Function,
  refetchRemoteObservation: Function
}

const ActivityItem = ( {
  item, navToTaxonDetails, toggleRefetch, refetchRemoteObservation
}: Props ): Node => {
  // const [currentUser, setCurrentUser] = useState( null );
  // const [kebabMenuVisible, setKebabMenuVisible] = useState( false );
  // const [flagModalVisible, setFlagModalVisible] = useState( false );
  // const [flaggedStatus, setFlaggedStatus] = useState( false );
  const { taxon } = item;
  // const { user } = item;

  // const realm = useRealm( );
  // const queryClient = useQueryClient( );
  // const itemType = item.category ? "Identification" : "Comment";
  // const activityItemClassName = flaggedStatus
  // ? "flex-row border border-borderGray py-1 justify-between bg-flaggedBackground"
  // : "flex-row border border-borderGray py-1 justify-between";
  const isOnline = useIsConnected( );

  // useEffect( ( ) => {
  //   const isActiveUserTheCurrentUser = async ( ) => {
  //     const current = await isCurrentUser( user?.login );
  //     setCurrentUser( current );
  //   };
  //   isActiveUserTheCurrentUser( );

  //   // show flagged activity item right after flag item modal closes
  //   if ( item.flags?.length > 0 ) {
  //     setFlaggedStatus( true );
  //   }
  // }, [user, item] );

  // const closeFlagItemModal = () => {
  //   setFlagModalVisible( false );
  // };

  // const onItemFlagged = () => {
  //   setFlaggedStatus( true );
  //   refetchRemoteObservation();
  // };

  const showNoInternetIcon = accessibilityLabel => (
    <View className="mr-3">
      <IconMaterial
        name="wifi-off"
        size={30}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );

  return (
    <View className={item.temporary && "opacity-50"}>
      <ActivityHeader
        item={item}
        refetchRemoteObservation={refetchRemoteObservation}
        toggleRefetch={toggleRefetch}
      />
      {taxon && (
        <Pressable
          className="flex-row my-3 ml-3 items-center"
          onPress={navToTaxonDetails}
          accessibilityRole="link"
          accessibilityLabel={t( "Navigate-to-taxon-details" )}
        >
          {isOnline
            ? <TaxonImage uri={Taxon.uri( taxon )} />
            : showNoInternetIcon( t( "Taxon-photo-unavailable-without-internet" ) )}
          <View>
            <Text className="text-lg">{taxon.preferred_common_name}</Text>
            <Text className="color-logInGray">
              {taxon.rank}
              {" "}
              {taxon.name}
            </Text>
          </View>
        </Pressable>
      )}
      { !_.isEmpty( item?.body ) && (
        <View className="flex-row my-3 ml-3">
          <UserText baseStyle={textStyles.activityItemBody} text={item.body} />
        </View>
      )}
      {/* {!currentUser
        && (
        <FlagItemModal
          id={item.id}
          showFlagItemModal={flagModalVisible}
          closeFlagItemModal={closeFlagItemModal}
          itemType={itemType}
          onItemFlagged={onItemFlagged}
        />
        )} */}
    </View>
  );
};

export default ActivityItem;
