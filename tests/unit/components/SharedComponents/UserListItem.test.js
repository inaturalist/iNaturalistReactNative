import UserListItem from "components/UserList/UserListItem.tsx";
import React from "react";
import factory from "tests/factory";
import faker from "tests/helpers/faker";

const mockUser = factory( "RemoteUser", {
  login: "test123",
  id: faker.number.int( )
} );

describe( "UserListItem", ( ) => {
  it( "should be accessible", ( ) => {
    const userListItem = (
      <UserListItem
        item={{
          user: mockUser
        }}
        count={3}
        countText="X-Observations"
      />
    );
    expect( userListItem ).toBeAccessible();
  } );
} );
