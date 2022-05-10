import { define } from "factoria";

export default define( "DevicePhoto", faker => ( {

  node: {
    location: {
      latitude: Number( faker.address.latitude( ) ),
      longitude: Number( faker.address.longitude( ) )
    },
    timestamp: faker.time.recent( ),
    image: {
      uri: faker.image.imageUrl( )
    }
  }
} ) );
