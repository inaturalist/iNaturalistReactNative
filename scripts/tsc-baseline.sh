#!/bin/sh
#
# Creates a baseline of TypeScript errors and fails if new errors are
# introduced.
#
# When you fix an error, run `npm run lint:tsc:baseline -- -u` to update the
# baseline.

set -e

TSC_ERRORS_FILE="tsc-errors.txt"
TEMP_TSC_ERRORS_FILE="tsc-errors.txt.tmp"

# Run tsc, make paths relative, and save the output to a temporary file
npm run lint:tsc -- --pretty false | sed "s|$(pwd)/||g" > "$TEMP_TSC_ERRORS_FILE" || true

# If the -u flag is passed, update the baseline and exit
if [ "$1" = "-u" ]; then
  mv "$TEMP_TSC_ERRORS_FILE" "$TSC_ERRORS_FILE"
  echo "TypeScript error baseline updated."
  exit 0
fi

# If the baseline file doesn't exist, create it and exit
if [ ! -f "$TSC_ERRORS_FILE" ]; then
  mv "$TEMP_TSC_ERRORS_FILE" "$TSC_ERRORS_FILE"
  echo "TypeScript error baseline created."
  exit 0
fi

# Compare the temporary file with the baseline
if ! diff -q "$TSC_ERRORS_FILE" "$TEMP_TSC_ERRORS_FILE" >/dev/null; then
  # Check for new errors (lines in the new file that are not in the baseline)
  NEW_ERRORS=$(grep -F -v -x -f "$TSC_ERRORS_FILE" "$TEMP_TSC_ERRORS_FILE" || true)

  if [ -n "$NEW_ERRORS" ]; then
    echo "New TypeScript errors were introduced. Please fix them or update the baseline by running:"
    echo "npm run lint:tsc:baseline -- -u"
    echo
    diff --unified=0 "$TSC_ERRORS_FILE" "$TEMP_TSC_ERRORS_FILE" | tail -n +6
    rm "$TEMP_TSC_ERRORS_FILE"
    exit 1
  else
    # If there are no new errors, but the files are different, it means errors were resolved.
    echo "Good job! You've resolved some TypeScript errors. To update the baseline, run:"
    echo "npm run lint:tsc:baseline -- -u"
    rm "$TEMP_TSC_ERRORS_FILE"
    exit 0
  fi
fi

rm "$TEMP_TSC_ERRORS_FILE"
echo "No new TypeScript errors were introduced."