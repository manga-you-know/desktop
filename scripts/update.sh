#!/bin/sh

TOML_FILE="./src-tauri/Cargo.toml"

if [ -z "$1" ]; then
  echo "Use: ./update.sh 1.2.3"
  exit 1
fi

new_version=$1

if ! echo "$new_version" | grep -Eq "^[0-9]+\.[0-9]+\.[0-9]+$"; then
  echo "Use: 1.2.3"
  exit 1
fi

current_version=$(grep -E "^version = \"[0-9]+\.[0-9]+\.[0-9]+\"" $TOML_FILE | cut -d '"' -f 2)
sed -i "s/version = \"$current_version\"/version = \"$new_version\"/" $TOML_FILE

echo "$current_version -> $new_version ($TOML_FILE)"