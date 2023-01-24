import { define } from "factoria";

export default define( "DeviceLocation", faker => ( {
  latitude: Number( faker.address.latitude( ) ),
  longitude: Number( faker.address.longitude( ) )
} ) );
