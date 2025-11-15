#!/bin/sh
#
# Creates a baseline of TypeScript errors and fails if new errors are
# introduced.
#
# When you fix an error, run `npm run lint:tsc:baseline -- -u` to update the
# baseline.

set -e

TSC_ERRORS_FILE="tsc-errors.txt"
# Use mktemp to create a secure temporary file
TEMP_TSC_ERRORS_FILE=$(mktemp)

# Ensure the temp file is removed on exit, even if the script fails
trap 'rm -f "$TEMP_TSC_ERRORS_FILE"' EXIT

# Run tsc, make paths relative, join multi-line errors, sort, and save the
# output to a temporary file
npm run lint:tsc -- --pretty false \
  | sed "s|$(pwd)/||g" \
  | perl -p0e 's/\n\s\s+/ /g' \
  | sort \
  > "$TEMP_TSC_ERRORS_FILE" \
  || true

# If the -u flag is passed, update the baseline and exit
if [ "$1" = "-u" ]; then
  mv "$TEMP_TSC_ERRORS_FILE" "$TSC_ERRORS_FILE"
  echo "TypeScript error baseline updated."
  exit 0
fi

# If the files are the same, we're good.
if cmp -s "$TSC_ERRORS_FILE" "$TEMP_TSC_ERRORS_FILE"; then
  echo "No new TypeScript errors were introduced."
  exit 0
fi

# The files are different, so find out what changed.
# comm is the standard tool for comparing sorted files.
#   -1 suppresses lines unique to the first file
#   -2 suppresses lines unique to the second file
#   -3 suppresses lines common to both files
NEW_ERRORS=$(comm -13 "$TSC_ERRORS_FILE" "$TEMP_TSC_ERRORS_FILE")
REMOVED_ERRORS=$(comm -23 "$TSC_ERRORS_FILE" "$TEMP_TSC_ERRORS_FILE")

if [ -n "$NEW_ERRORS" ]; then
  echo "New TypeScript errors were introduced. Please fix them or update the baseline by running:"
  echo "npm run lint:tsc:baseline -- -u"
  echo
  echo "New errors:"
  echo "$NEW_ERRORS"
  exit 1
fi

if [ -n "$REMOVED_ERRORS" ]; then
  echo "Good job! You've resolved some TypeScript errors. To update the baseline, run:"
  echo "npm run lint:tsc:baseline -- -u"
  echo
  echo "Resolved errors:"
  echo "$REMOVED_ERRORS"
  exit 1
fi
