import ActivityTab from "components/ObsDetails/ActivityTab";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30"
} );

const mockUser = factory( "LocalUser" );
jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: () => mockUser
} ) );

const mockNavigate = jest.fn();
jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: () => ( {
      params: {
        uuid: mockObservation.uuid
      }
    } ),
    useNavigation: () => ( {
      navigate: mockNavigate,
      addListener: jest.fn(),
      setOptions: jest.fn()
    } )
  };
} );

jest.mock( "sharedHooks/useAuthenticatedMutation", () => ( {
  __esModule: true,
  default: () => ( {
    mutate: () => null
  } )
} ) );

describe( "ActivityTab", () => {
  test( "renders", async ( ) => {
    renderComponent(
      <ActivityTab
        uuid={mockObservation.uuid}
        observation={mockObservation}
        comments={[]}
        navToTaxonDetails={jest.fn()}
        toggleRefetch={jest.fn()}
        refetchRemoteObservation={jest.fn()}
        openCommentBox={jest.fn()}
        showCommentBox={jest.fn()}
      />
    );
  } );
} );
