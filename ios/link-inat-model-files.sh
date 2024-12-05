# Hard links the model and taxonomy files specified in .env or .env.staging to the 
# files declared in the xcode project
# https://developer.apple.com/documentation/xcode/running-custom-scripts-during-a-build
if [ $CONFIGURATION = "Debug" ]; then
  source $SRCROOT/../.env.staging
else
  source $SRCROOT/../.env
fi

if ! [ -f $SRCROOT/$IOS_MODEL_FILE_NAME ]; then
  echo "CV model file does not exist at $SRCROOT/$IOS_MODEL_FILE_NAME"
  exit 1
fi

if ! [ -f $SRCROOT/$IOS_TAXONOMY_FILE_NAME ]; then
  echo "CV taxonomy file does not exist at $SRCROOT/$IOS_TAXONOMY_FILE_NAME"
  exit 1
fi

echo "Linking $IOS_MODEL_FILE_NAME to cvmodel.mlmodel..."
ln -f $SRCROOT/$IOS_MODEL_FILE_NAME $SRCROOT/cvmodel.mlmodel
echo "Linking $IOS_TAXONOMY_FILE_NAME to taxonomy.json..."
ln -f $SRCROOT/$IOS_TAXONOMY_FILE_NAME $SRCROOT/taxonomy.json

if [ -f $SRCROOT/$IOS_GEO_MODEL_FILE_NAME ]; then
  echo "Geomodel file does exist at $SRCROOT/$IOS_GEO_MODEL_FILE_NAME"
  echo "Linking $IOS_GEO_MODEL_FILE_NAME to geomodel.mlmodel..."
  ln -f $SRCROOT/$IOS_GEO_MODEL_FILE_NAME $SRCROOT/geomodel.mlmodel
fi
