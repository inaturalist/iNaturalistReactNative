class Observations { }
Observations.schema = {
  name: "Observations",
  primaryKey: "uuid",
  properties: {
    uuid: "string",
    userPhoto: "string",
    commonName: "string",
    location: "string",
    timeObservedAt: "string",
    identifications: "int",
    comments: "int",
    qualityGrade: "string"
  }
};

export default Observations;
