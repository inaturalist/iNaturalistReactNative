import factory, { define } from "factoria";

export default define("LocalTaxon", (faker) => ({
  id: faker.datatype.number(),
  name: faker.name.firstName(),
  rank: "family",
  rank_level: 10,
  preferredCommonName: faker.name.findName(),
  defaultPhoto: factory("LocalPhoto"),
}));
