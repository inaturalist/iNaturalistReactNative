// e2e test data that needs to be referred to from e2e-mock files *and* the
// e2e tests themselves

// Darwin's house. Note that the e2e tests run in a UTC environment, so the
// observed_on_string will be set to a UTC time. If these coordinates fall
// within a time zone west of that (i.e. in the past), observation creation
// will fail during the period of the day when UTC time has crossed into the
// date after the date at these coordinates. The opposite (when local time is
// in a time zone behind the time zone of the coordinates) will not fail, but
// it might make an observation that's a day behind when you were expecting.
// eslint-disable-next-line import/prefer-default-export
export const CHUCKS_PAD = {
  latitude: 51.3313127,
  longitude: 0.0509862,
  accuracy: 5,
  altitude: 120.0234,
  altitudeAccuracy: 2.123,
  heading: null,
  speed: null,
};
