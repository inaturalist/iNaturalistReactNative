// @flow

import { useQueryClient } from "@tanstack/react-query";
import { deleteComments } from "api/comments";
import { isCurrentUser } from "components/LoginSignUp/AuthenticationService";
import KebabMenu from "components/SharedComponents/KebabMenu";
import UserIcon from "components/SharedComponents/UserIcon";
import {
  Image, Pressable, Text, View
} from "components/styledComponents";
import { t } from "i18next";
import _ from "lodash";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import { Menu } from "react-native-paper";
import HTML from "react-native-render-html";
import Comment from "realmModels/Comment";
import Taxon from "realmModels/Taxon";
import User from "realmModels/User";
import { formatIdDate } from "sharedHelpers/dateAndTime";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";
import { textStyles } from "styles/obsDetails/obsDetails";

import SmallSquareImage from "./SmallSquareImage";

const { useRealm } = RealmContext;

type Props = {
  item: Object,
  navToTaxonDetails: Function,
  handlePress: Function,
  toggleRefetch: Function,
  refetchRemoteObservation: Function
}

const ActivityItem = ( {
  item, navToTaxonDetails, handlePress, toggleRefetch, refetchRemoteObservation
}: Props ): Node => {
  const [currentUser, setCurrentUser] = useState( null );
  const { taxon } = item;
  const { user } = item;

  const realm = useRealm( );
  const queryClient = useQueryClient( );
  const { width } = useWindowDimensions( );

  useEffect( ( ) => {
    const isActiveUserTheCurrentUser = async ( ) => {
      const current = await isCurrentUser( user?.login );
      setCurrentUser( current );
    };
    isActiveUserTheCurrentUser( );
  }, [user] );

  const deleteCommentMutation = useAuthenticatedMutation(
    ( uuid, optsWithAuth ) => deleteComments( uuid, optsWithAuth ),
    {
      onSuccess: ( ) => {
        queryClient.invalidateQueries( ["fetchRemoteObservation", item.uuid] );
        refetchRemoteObservation( );
      }
    }
  );

  return (
    <View className={item.temporary && "opacity-50"}>
      <View className="flex-row border border-borderGray py-1 justify-between">
        {user && (
          <Pressable
            onPress={handlePress}
            accessibilityRole="link"
            className="flex-row items-center ml-3"
            testID={`ObsDetails.identifier.${user.id}`}
          >
            <UserIcon uri={User.uri( user )} small />
            <Text className="color-logInGray ml-3">{User.userHandle( user )}</Text>
          </Pressable>
        )}
        <View className="flex-row items-center">
          {item.vision
            && (
            <Image
              className="w-6 h-6"
              source={require( "images/id_rg.png" )}
            />
            )}
          <Text className="color-inatGreen mr-2">
            {item.category ? t( `Category-${item.category}` ) : ""}
          </Text>
          {item.created_at
            && (
            <Text>
              {formatIdDate( item.updated_at || item.created_at, t )}
            </Text>
            )}
          {item.body && currentUser
            ? (
              <KebabMenu>
                <Menu.Item
                  onPress={async ( ) => {
                    // first delete locally
                    Comment.deleteComment( item.uuid, realm );
                    // then delete remotely
                    deleteCommentMutation.mutate( item.uuid );
                    toggleRefetch( );
                  }}
                  title={t( "Delete-comment" )}
                />
              </KebabMenu>
            ) : (
              <KebabMenu>
                {/* TODO: build out this menu */}
                <View />
              </KebabMenu>
            )}
        </View>
      </View>
      {taxon && (
        <Pressable
          className="flex-row my-3 ml-3 items-center"
          onPress={navToTaxonDetails}
          accessibilityRole="link"
          accessibilityLabel="go to taxon details"
        >
          <SmallSquareImage uri={Taxon.uri( taxon )} />
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
          <HTML
            contentWidth={width}
            baseStyle={textStyles.activityItemBody}
            source={{ html: item.body }}
          />
        </View>
      )}
    </View>
  );
};

export default ActivityItem;
