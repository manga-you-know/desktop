#!/bin/sh

TOML_FILE="./MangaYouKnowDesktop/src-tauri/Cargo.toml"

# Verifica se a nova versão foi fornecida
if [ -z "$1" ]; then
  echo "Erro: Por favor, forneça a nova versão. Exemplo: ./update.sh 1.2.3"
  exit 1
fi

new_version=$1

# Verifica se a versão informada está no formato correto (x.y.z)
if ! echo "$new_version" | grep -Eq "^[0-9]+\.[0-9]+\.[0-9]+$"; then
  echo "Erro: A versão informada deve estar no formato x.y.z. Exemplo: 1.2.3"
  exit 1
fi

# Extrai a versão atual do .toml
current_version=$(grep -E "^version = \"[0-9]+\.[0-9]+\.[0-9]+\"" $TOML_FILE | cut -d '"' -f 2)

# Substitui a versão no arquivo .toml
sed -i "s/version = \"$current_version\"/version = \"$new_version\"/" $TOML_FILE

echo "Versão atualizada de $current_version para $new_version no arquivo $TOML_FILE."