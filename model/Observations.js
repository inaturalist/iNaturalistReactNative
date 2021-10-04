import { Model } from "@nozbe/watermelondb";
import { field, text } from "@nozbe/watermelondb/decorators";

export default class Observations extends Model {
  static table = "observations"

  @text( "uuid" ) uuid
  @text( "user_photo" ) userPhoto
  @text( "common_name" ) commonName
  @text( "location" ) location
  @text( "time_observed_at" ) timeObservedAt
  @field( "identifications" ) identifications
  @field( "comments" ) comments
  @text( "quality_grade" ) qualityGrade
}
