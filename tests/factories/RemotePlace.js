import { define } from "factoria";

export default define( "RemotePlace", faker => ( {
  id: faker.datatype.number( ),
  display_name: faker.address.cityName( ),
  point_geojson: {
    coordinates: [
      Number( faker.address.longitude( ) ),
      Number( faker.address.latitude( ) )
    ]
  }
} ) );
