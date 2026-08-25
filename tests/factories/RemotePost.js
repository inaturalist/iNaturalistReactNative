import { define } from "factoria";

export default define( "RemotePost", faker => ( {
  body: `<p>${faker.lorem.paragraph( )}</p>`,
  id: faker.number.int( ),
  parent: {
    icon_url: faker.image.url( ),
    id: faker.number.int( ),
  },
  published_at: faker.date.past( ).toISOString( ),
  title: faker.lorem.sentence( ),
} ) );
