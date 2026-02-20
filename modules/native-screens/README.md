Init following:
https://reactnative.dev/docs/next/legacy/local-library-setup

News View was copied over as is. One change was to comment out functionalities related to Realm because
the app crashed with a conflict between our own Realm and the one used in legacy app codebase. Another
change was to comment out functionalities related to Firebase analytics because again we have our own Firebase analytics setup and I was not keen on trying out two different Firebase pods in the same app.
Another change was to remove the import of ExploreObservation in INatAPI.m because I didn't want to include
the entire dependency tree of it if it is not really used in the one API we are calling.
