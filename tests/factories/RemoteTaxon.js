import { define } from "factoria";

export default define( "RemoteTaxon", faker => ( {
  id: faker.datatype.number( ),
  name: faker.name.firstName( ),
  rank: "genus",
  preferred_common_name: faker.name.findName( ),
  default_photo: {
    square_url: faker.image.imageUrl( )
  }
} ) );
