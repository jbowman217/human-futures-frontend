#!/bin/bash

# Ensure target directory exists
mkdir -p public/materials

# Define extensions to move
EXTENSIONS=("png" "svg" "md" "docx" "xlsx" "pdf")

# Move matching files
for ext in "${EXTENSIONS[@]}"; do
  for file in *.$ext; do
    # Skip if no match
    [[ -e "$file" ]] || continue

    # Normalize filename to lowercase
    lowercase=$(echo "$file" | tr '[:upper:]' '[:lower:]')

    # Move and rename
    mv "$file" "public/materials/$lowercase"
    echo "✅ Moved $file → public/materials/$lowercase"
  done
done

echo "🎯 All materials moved and normalized."
