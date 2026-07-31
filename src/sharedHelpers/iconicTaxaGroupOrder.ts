export enum ICONIC_TAXA_GROUP {
  PLANTAE = "plantae",
  AVES = "aves",
  INSECTA = "insecta",
  ARACHNIDA = "arachnida",
  FUNGI = "fungi",
  MOLLUSCA = "mollusca",
  MAMMALIA = "mammalia",
  AMPHIBIA = "amphibia",
  REPTILIA = "reptilia",
  ACTINOPTERYGII = "actinopterygii",
  CHROMISTA = "chromista",
  PROTOZOA = "protozoa",
  ANIMALIA = "animalia",
  OTHER = "other",
}

// This is the tie-break order for the grouped-by-iconic-taxa view: when two or more
// categories have the same observation count, they'll be ordered as they appear here.
// This order is relevant to the myobs view only; IconicTaxonChooser.tsx has a different
// order. Maybe someday we'll unify them, but for now they're separate.
//
// OTHER is the same as Explore's iconic taxon filter "unknown" (will include bacteria, fungi,
// and anything else that doesn't fit elsewhere, as well as Unknowns).
export const ICONIC_TAXA_GROUP_ORDER: ICONIC_TAXA_GROUP[] = [
  ICONIC_TAXA_GROUP.PLANTAE,
  ICONIC_TAXA_GROUP.AVES,
  ICONIC_TAXA_GROUP.INSECTA,
  ICONIC_TAXA_GROUP.ARACHNIDA,
  ICONIC_TAXA_GROUP.FUNGI,
  ICONIC_TAXA_GROUP.MOLLUSCA,
  ICONIC_TAXA_GROUP.MAMMALIA,
  ICONIC_TAXA_GROUP.AMPHIBIA,
  ICONIC_TAXA_GROUP.REPTILIA,
  ICONIC_TAXA_GROUP.ACTINOPTERYGII,
  ICONIC_TAXA_GROUP.CHROMISTA,
  ICONIC_TAXA_GROUP.PROTOZOA,
  ICONIC_TAXA_GROUP.ANIMALIA,
  ICONIC_TAXA_GROUP.OTHER,
];
