import { define } from "factoria";

export default define( "RemoteProjectObservationRule", faker => {
  const taxonId = faker.number.int( );
  return {
    id: faker.number.int( ),
    operand_id: taxonId,
    operand_type: "Taxon",
    operator: "in_taxon?",
    taxon: {
      ancestor_ids: [48460, 1, taxonId],
      id: taxonId,
      name: faker.lorem.word( ),
      preferred_common_name: faker.lorem.word( ),
      rank: "phylum",
      rank_level: 60,
    },
  };
} );
