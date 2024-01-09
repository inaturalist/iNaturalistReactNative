import { define } from "factoria";

import userFactory from "./RemoteUser";

export default define( "RemoteObservation", faker => ( {
  id: faker.number.int( ),
  uuid: faker.string.uuid( ),
  geojson: {
    coordinates: [
      Number( faker.location.longitude( ) ),
      Number( faker.location.latitude( ) )
    ]
  },
  positional_accuracy: 10,
  observed_on_string: "2020-04-03",
  user: userFactory( "RemoteUser" )
} ) );
