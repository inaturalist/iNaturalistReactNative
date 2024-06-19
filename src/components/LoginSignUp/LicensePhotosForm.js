// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import classnames from "classnames";
import {
  Body2,
  Button,
  Checkbox,
  TextSheet,
  UnderlinedLink
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";

import {
  registerUser
} from "./AuthenticationService";
import Error from "./Error";

const NONE = "NONE";
const LICENSES = "LICENSES";
const PERSONAL_INFO = "PERSONAL_INFO";
const INFO_TRANSFER = "INFO_TRANSFER";

const LicensePhotosForm = ( ): Node => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { user } = params;
  const [learnSheet, setLearnSheet] = useState( NONE );
  const [error, setError] = useState( null );

  const onTermsPressed = async () => {
    const url = "https://www.inaturalist.org/pages/terms";
    navigation.navigate( "FullPageWebView", {
      title: t( "Terms-of-Use" ),
      initialUrl: url,
      loggedIn: false,
      openLinksInBrowser: true
    } );
  };

  const onPrivacyPressed = async () => {
    const url = "https://www.inaturalist.org/pages/privacy";
    navigation.navigate( "FullPageWebView", {
      title: t( "Privacy-Policy" ),
      initialUrl: url,
      loggedIn: false,
      openLinksInBrowser: true
    } );
  };

  const onCommunityPressed = async () => {
    const url = "https://www.inaturalist.org/pages/community+guidelines";
    navigation.navigate( "FullPageWebView", {
      title: t( "Community-Guidelines" ),
      initialUrl: url,
      loggedIn: false,
      openLinksInBrowser: true
    } );
  };

  const initialCheckboxState = {
    first: {
      text: t( "Yes-license-my-photos" ),
      checked: true,
      links: [
        {
          label: t( "Learn-More" ),
          onPress: () => setLearnSheet( LICENSES )
        }
      ]
    },
    second: {
      text: t( "I-consent-to-allow-iNaturalist-to-store" ),
      checked: false,
      links: [
        {
          label: t( "Learn-More" ),
          onPress: () => setLearnSheet( PERSONAL_INFO )
        }
      ]
    },
    third: {
      text: t( "I-consent-to-allow-my-personal-information" ),
      checked: false,
      links: [
        {
          label: t( "Learn-More" ),
          onPress: () => setLearnSheet( INFO_TRANSFER )
        }
      ]
    },
    fourth: {
      text: t( "I-agree-to-the-Terms-of-Use" ),
      checked: false,
      links: [
        {
          label: t( "Terms-of-Use" ),
          onPress: () => onTermsPressed()
        },
        {
          label: t( "Privacy-Policy" ),
          onPress: () => onPrivacyPressed()
        },
        {
          label: t( "Community-Guidelines" ),
          onPress: () => onCommunityPressed()
        }
      ]
    },
    fifth: {
      text: t( "Agree-to-all-of-the-above" ),
      checked: false
    }
  };
  const [checkboxes, setCheckboxes] = useState( initialCheckboxState );

  const register = async ( ) => {
    user.pi_consent = true;
    user.data_transfer_consent = true;
    if ( checkboxes.first.checked === true ) {
      user.preferred_observation_license = "CC-BY-NC";
      user.preferred_photo_license = "CC-BY-NC";
      user.preferred_sound_license = "CC-BY-NC";
    }
    const registrationError = await registerUser( user );
    if ( registrationError ) {
      setError( registrationError );
    } else {
      navigation.navigate( "SignUpConfirmation" );
    }
  };

  const checkboxRow = row => {
    const { links, text, checked } = checkboxes[row];

    return (
      <View
        className={classnames( "flex-row mb-4", {
          "mt-10 mb-0": row === "fifth",
          "items-start": row !== "fifth",
          "items-center": row === "fifth"
        } )}
        key={row}
      >
        <Checkbox
          transparent
          isChecked={checked}
          onPress={( ) => {
            const updatedCheckboxes = checkboxes;
            if ( row === "fifth" ) {
              updatedCheckboxes.first.checked = true;
              updatedCheckboxes.second.checked = true;
              updatedCheckboxes.third.checked = true;
              updatedCheckboxes.fourth.checked = true;
              updatedCheckboxes.fifth.checked = true;
            } else {
              if ( updatedCheckboxes[row].checked === true ) {
                updatedCheckboxes.fifth.checked = false;
              }
              updatedCheckboxes[row].checked = !checked;
            }

            setCheckboxes( { ...updatedCheckboxes } );
          }}
        />
        <View className="flex-1">
          <Body2 className="flex-wrap color-white">{text}</Body2>
          {links && links.map( link => (
            <UnderlinedLink
              className="color-white mt-[9px]"
              key={link.label}
              onPress={link.onPress}
            >
              {link.label}
            </UnderlinedLink>
          ) )}
        </View>
      </View>
    );
  };

  const renderLearnSheet = ( ) => {
    switch ( learnSheet ) {
      case LICENSES:
        return (
          <TextSheet
            headerText={t( "LICENSES" )}
            texts={[t( "Check-this-box-if-you-want-to-apply-a-Creative-Commons" )]}
            setShowSheet={setLearnSheet}
          />
        );
      case PERSONAL_INFO:
        return (
          <TextSheet
            headerText={t( "PERSONAL-INFO" )}
            texts={[
              t( "We-store-personal-information" ),
              t( "There-is-no-way" )
            ]}
            setShowSheet={setLearnSheet}
          />
        );
      case INFO_TRANSFER:
        return (
          <TextSheet
            headerText={t( "INFO-TRANSFER" )}
            texts={[
              t( "Some-data-privacy-laws" ),
              t( "Using-iNaturalist-requires-the-storage" ),
              t( "To-learn-more-about-what-information" ),
              t( "There-is-no-way" )
            ]}
            setShowSheet={setLearnSheet}
          />
        );
      case NONE:
      default:
        return null;
    }
  };

  return (
    <View className="px-3 mt-[9px] justify-end">
      {Object.keys( checkboxes ).map( row => checkboxRow( row ) )}
      {error && <Error error={error} />}
      <Button
        level="focus"
        text={t( "CREATE-AN-ACCOUNT" )}
        onPress={register}
        className="my-[36px]"
        disabled={
          !checkboxes.second.checked
          || !checkboxes.third.checked
          || !checkboxes.fourth.checked
        }
        testID="LicensePhotos.signupButton"
      />
      {renderLearnSheet( )}
    </View>
  );
};

export default LicensePhotosForm;
