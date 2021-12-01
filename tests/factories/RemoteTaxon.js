import factory, { define } from "factoria";

export default define( "RemoteTaxon", faker => ( {
  id: faker.datatype.number( ),
  name: faker.name.firstName( ),
  rank: "genus",
  preferred_common_name: faker.name.findName( ),
  default_photo: {
    square_url: faker.image.imageUrl( )
  },
  ancestors: [{
    id: faker.datatype.number( ),
    preferred_common_name: faker.name.findName( ),
    name: faker.name.findName( ),
    rank: "class"
  }],
  wikipedia_summary: faker.lorem.paragraph( ),
  taxonPhotos: [{
    photo: factory( "RemotePhoto" )
  }]
} ) );
