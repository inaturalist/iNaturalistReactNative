import { define } from "factoria";

export default define( "RemoteObservation", faker => ( {
  uuid: faker.string.uuid( ),
  geojson: {
    coordinates: [
      Number( faker.location.longitude( ) ),
      Number( faker.location.latitude( ) )
    ]
  },
  positional_accuracy: 10,
  observed_on_string: "2020-04-03"
} ) );
