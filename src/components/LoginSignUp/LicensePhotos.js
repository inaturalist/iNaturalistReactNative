// @flow

import { ScrollView } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";

import Header from "./Header";
import LicensePhotosForm from "./LicensePhotosForm";
import LoginSignUpWrapper from "./LoginSignUpWrapper";

const LicensePhotos = ( ): Node => (
  <LoginSignUpWrapper backgroundSource={require( "images/background/plants.jpg" )}>
    <ScrollView
      keyboardShouldPersistTaps="always"
    >
      <Header headerText={t( "Almost-done" )} />
      <LicensePhotosForm />
    </ScrollView>
  </LoginSignUpWrapper>
);

export default LicensePhotos;
