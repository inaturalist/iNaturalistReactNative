import factory, { define } from "factoria";

export default define( "RemoteTaxon", faker => ( {
  id: faker.datatype.number( ),
  name: faker.name.firstName( ),
  rank: "genus",
  rank_level: 27,
  preferred_common_name: faker.name.fullName( ),
  default_photo: {
    square_url: faker.image.imageUrl( )
  },
  ancestors: [{
    id: faker.datatype.number( ),
    preferred_common_name: faker.name.fullName( ),
    name: faker.name.fullName( ),
    rank: "class"
  }],
  wikipedia_summary: faker.lorem.paragraph( ),
  taxonPhotos: [{
    photo: factory( "RemotePhoto" )
  }],
  wikipedia_url: faker.internet.url( )
} ) );
