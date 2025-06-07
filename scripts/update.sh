#!/bin/sh

TOML_FILE="./src-tauri/Cargo.toml"
TAURI_FILE="./src-tauri/tauri.conf.json"

if [ -z "$1" ]; then
  echo "Usage: ./update.sh <current_version>"
  echo "Example: ./update.sh 1.2.3"
  exit 1
fi

# $1 is the current version — we increment it
new_version="$1"

if ! echo "$new_version" | grep -Eq "^[0-9]+\.[0-9]+\.[0-9]+$"; then
  echo "Invalid version format. Use: 1.2.3"
  exit 1
fi

# Split into major, minor, patch
IFS='.' read -r major minor patch <<EOF
$new_version
EOF

# Increment patch
patch=$((patch + 1))
updated_version="${major}.${minor}.${patch}"

# Update Cargo.toml
sed -i "s/version = \"$new_version\"/version = \"$updated_version\"/" "$TOML_FILE"
echo "$new_version -> $updated_version ($TOML_FILE)"

# Update tauri.conf.json
sed -i "s/\"version\": \"$new_version\"/\"version\": \"$updated_version\"/" "$TAURI_FILE"
echo "$new_version -> $updated_version ($TAURI_FILE)"

# Output
echo "$updated_version"
