import factory, { define } from "factoria";

export default define( "LocalObservation", faker => ( {
  _synced_at: faker.date.past( ),
  _created_at: faker.date.past( ),
  uuid: faker.datatype.uuid( ),
  comments: [
    factory( "LocalComment" ),
    factory( "LocalComment" ),
    factory( "LocalComment" )
  ],
  identifications: [
    factory( "LocalIdentification" )
  ],
  observationPhotos: [
    factory( "LocalObservationPhoto", {
      photo: {
        id: faker.datatype.number( ),
        attribution: faker.lorem.sentence( ),
        licenseCode: "cc-by-nc",
        url: faker.image.imageUrl( )
      }
    } )
  ],
  placeGuess: "SF",
  taxon: factory( "LocalTaxon", {
    name: faker.name.firstName( ),
    rank: "species",
    rank_level: 10,
    preferred_common_name: faker.name.fullName( ),
    defaultPhoto: {
      id: faker.datatype.number( ),
      attribution: faker.lorem.sentence( ),
      licenseCode: "cc-by-nc",
      url: faker.image.imageUrl( )
    }
  } ),
  user: factory( "LocalUser", {
    login: faker.internet.userName( ),
    iconUrl: faker.image.imageUrl( ),
    locale: "en"
  } ),
  qualityGrade: "research",
  latitude: Number( faker.address.latitude( ) ),
  longitude: Number( faker.address.longitude( ) ),
  description: faker.lorem.paragraph( ),
  // is this the right way to test this?
  needsSync: jest.fn( ),
  wasSynced: jest.fn( ),
  observed_on_string: "2022-12-03T11:14:16",
  // This is a Realm object method that we use to see if a record was deleted or not
  isValid: jest.fn( () => true ),
  comments_viewed: false,
  identifications_view: false
} ) );
