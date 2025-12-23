import { define } from "factoria";

import userFactory from "./RemoteUser";

export default define( "RemoteObservation", faker => {
  const dateObserved = faker.date.past( );
  const dateCreated = faker.date.between( { from: dateObserved, to: new Date() } );
  const dateUpdated = faker.date.between( { from: dateCreated, to: new Date() } );
  return {
    created_at: dateCreated.toISOString(),
    id: faker.number.int( ),
    uuid: faker.string.uuid( ),
    geojson: {
      coordinates: [
        Number( faker.location.longitude( ) ),
        Number( faker.location.latitude( ) ),
      ],
    },
    positional_accuracy: 10,
    observed_on_string: [
      dateObserved.getFullYear(),
      `0${dateObserved.getMonth() + 1}`.slice( -2 ),
      `0${dateObserved.getDate()}`.slice( -2 ),
    ].join( "-" ),
    time_observed_at: dateObserved.toISOString(),
    update_at: dateUpdated.toISOString(),
    user: userFactory( "RemoteUser" ),
  };
} );
