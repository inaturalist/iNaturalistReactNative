# Stop the script on error
set -e

# Check for dependencies
if ! type fantasticon > /dev/null; then
  echo "You need to npm install --location=global fantasticon for this to work"
  exit
fi

if ! type react-native-asset > /dev/null; then
  echo "You need to npm install --location=global react-native-asset for this to work"
  exit
fi

bundle exec ruby scripts/clean-icon-svgs.rb src/images/icons/*.svg

# Generate the font file and the glyphmap
fantasticon src/images/icons/ \
  --output assets/fonts/ \
  --font-types ttf \
  --name INatIcon \
  --asset-types json

# Move the glyphmap into src
mv assets/fonts/INatIcon.json src/components/SharedComponents/INatIcon/glyphmap.json

# Clean out the build folders
rm -rf ios/build && rm -rf android/app/build

# Re-link the new font file asset
npx react-native-asset

echo "Icons updated! Don't forget to rebuild the app."
