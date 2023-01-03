import { render } from "@testing-library/react-native";
import ObsCardDetails from "components/Observations/ObsCardDetails";
import React from "react";

import factory from "../../../factory";

const testObservation = factory("LocalObservation");

test("renders correct taxon and observation details", () => {
  const { getByText } = render(
    <ObsCardDetails view="list" item={testObservation} />
  );

  expect(getByText(testObservation.taxon.preferredCommonName)).toBeTruthy();
  expect(getByText(testObservation.placeGuess)).toBeTruthy();
});
