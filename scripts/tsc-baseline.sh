#!/bin/sh
#
# Creates a baseline of TypeScript errors and fails if new errors are
# introduced.
#
# When you fix an error, run `npm run lint:tsc:baseline -- -u` to update the
# baseline.

set -e

TSC_ERRORS_FILE="tsc-errors.txt"
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

# Compare the temporary file with the baseline
if ! diff -q "$TSC_ERRORS_FILE" "$TEMP_TSC_ERRORS_FILE" >/dev/null; then
  # Check for new errors (lines in the new file that are not in the baseline)
  NEW_ERRORS=$(grep -F -v -x -f "$TSC_ERRORS_FILE" "$TEMP_TSC_ERRORS_FILE" || true)

  if [ -n "$NEW_ERRORS" ]; then
    echo "New TypeScript errors were introduced. Please fix them or update the baseline by running:"
    echo "npm run lint:tsc:baseline -- -u"
    echo
    echo "$NEW_ERRORS"
  else
    # If there are no new errors, but the files are different, it means errors were resolved.
    REMOVED_ERRORS=$(grep -F -v -x -f "$TEMP_TSC_ERRORS_FILE" "$TSC_ERRORS_FILE" || true)
    echo "Good job! You've resolved some TypeScript errors. To update the baseline, run:"
    echo "npm run lint:tsc:baseline -- -u"
    echo
    echo "Resolved errors:"
    echo "$REMOVED_ERRORS"
  fi
  exit 1
fi

echo "No new TypeScript errors were introduced."
