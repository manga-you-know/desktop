import { fetch } from "@/lib/helpers";
import {
  activeExtensionRepos,
  allowedExtensionLanguages,
  allowedSourceLanguages,
  autoUpdateExtensions,
  disableAutoUpdateByExtension,
  repoInfo,
  suwayomiUrl,
} from "@/states";
import { suwayomi } from "@/states";
import { Child, Command } from "@tauri-apps/plugin-shell";
import { getBasePath } from "../utils";
import { delay } from "@/utils";
import type {
  Extension,
  FetchSourceMangaInput,
  FetchSourceMangaResult,
  SourceBrowse,
  SourceSettings,
  UpdateSourcePreferencesInput,
} from "@/types/server";
import { Client, cacheExchange, fetchExchange } from "@urql/svelte";

const client = new Client({
  url: suwayomiUrl.value + "/api/graphql",
  exchanges: [cacheExchange, fetchExchange],
});

const command = Command.sidecar("binaries/suwayomi");
let child: Child = null!;
command.on("error", (err) => {
  console.log("Error in Suwayomi: ", err);
});

export const suwaManager = {
  async startSuwayomi() {
    this.isConnected().then(async (spawned) => {
      if (!spawned) {
        child = await command.spawn();
      }
    });
  },
  async stopSuwayomi(): Promise<boolean> {
    if (child) {
      return child
        .kill()
        .then(() => true)
        .catch(() => false);
    }
    return false;
  },
  async isConnected(): Promise<boolean> {
    return fetch(suwayomiUrl.value)
      .then((r) => {
        if (suwayomi.extensionRepos.length === 0) {
          this.getRepos();
        }
        if (suwayomi.rawExtensions.length === 0) {
          this.getExtensions();
        }
        if (suwayomi.rawSources.length === 0) {
          this.getSources();
        }
        return r.ok;
      })
      .catch(() => false);
  },
  async getRepos() {
    return fetch(suwayomiUrl.value + "/api/graphql", {
      method: "POST",
      bodyC: {
        query: `
          query {
            settings {
              extensionRepos
            }
          }
        `,
      },
    }).then(async (r) => {
      const rJson = await r.json();
      suwayomi.extensionRepos = rJson.data.settings.extensionRepos;
      this.getRepoInfo();
      if (activeExtensionRepos.value.length === 0) {
        activeExtensionRepos.value = suwayomi.extensionRepos.map(getBasePath);
      }
    });
  },
  async getRepoInfo() {
    for (const repo of suwayomi.extensionRepos) {
      if (repoInfo.value[getBasePath(repo)]) continue;
      const infoFile = getBasePath(repo) + "index.json";
      const info = await fetch(infoFile);
      const infoJson = await info.json();
      if (infoJson.badgeLabel) {
        repoInfo.value = {
          ...repoInfo.value,
          [getBasePath(repo)]: {
            name: infoJson.name,
            badgeLabel: infoJson.badgeLabel,
            website: infoJson.contact.website,
            discord: infoJson.contact.discord,
          },
        };
      } else {
        const infoFilefb = getBasePath(repo) + "repo.json";
        const infofb = await fetch(infoFilefb);
        const infofbJson = await infofb.json();
        repoInfo.value = {
          ...repoInfo.value,
          [getBasePath(repo)]: {
            name: infofbJson.meta.name,
            badgeLabel: infofbJson.meta.name.split(" ")[0],
            website: infofbJson.meta.website,
          },
        };
      }
    }
  },
  async setRepos(): Promise<boolean> {
    return fetch(suwayomiUrl.value + "/api/graphql", {
      method: "POST",
      bodyC: {
        query: `
          mutation {
            setSettings(input: {
              settings: {
                extensionRepos: [${suwayomi.extensionRepos.map((rp) => `"${rp}"`)}] 
              }
            }) {
            settings {
              extensionRepos
            }
          }
        }`,
      },
    })
      .then(async (r) => {
        const rJson = await r.json();
        if (!Object.hasOwn(rJson, "errors")) {
          suwayomi.extensionRepos =
            rJson.data.setSettings.settings.extensionRepos;
          activeExtensionRepos.value = suwayomi.extensionRepos.map(getBasePath);
          this.getExtensions().then(async (_) => {
            await delay(10);
            if (
              Object.values(allowedExtensionLanguages.value).filter((e) => e)
                .length === 0
            ) {
              const data: Record<string, boolean> = {};
              for (const lang of suwayomi.availableExtensionLangs) {
                data[lang] = ["all", "en", "pt-br", "es"].includes(lang);
              }
              allowedExtensionLanguages.value = data;
            }
            this.getSources().then(async (_) => {
              await delay(10);
              if (
                Object.values(allowedExtensionLanguages.value).filter((e) => e)
                  .length === 0
              ) {
                const data: Record<string, boolean> = {};
                for (const lang of suwayomi.availableSourceLangs) {
                  data[lang] = ["all", "en", "pt-br", "es"].includes(lang);
                }
                allowedSourceLanguages.value = data;
              }
            });
          });
          this.getRepoInfo();
          return true;
        } else {
          return false;
        }
      })
      .catch(() => false);
  },
  async getExtensions() {
    fetch(suwayomiUrl.value + "/api/graphql", {
      method: "POST",
      bodyC: {
        query: `
          fragment EXTENSION_LIST_FIELDS on ExtensionType {
            pkgName
            name
            lang
            versionCode
            versionName
            iconUrl
            repo
            storeIndexUrl
            isNsfw
            contentWarning
            isInstalled
            isObsolete
            hasUpdate
          }

          mutation GET_EXTENSIONS_FETCH($input: FetchExtensionsInput = {}) {
            fetchExtensions(input: $input) {
              extensions {
                ...EXTENSION_LIST_FIELDS
              }
            }
          }
        `,
      },
    }).then(async (r) => {
      const rJson = await r.json();
      suwayomi.rawExtensions = rJson.data.fetchExtensions.extensions;
      await delay(10);
      if (autoUpdateExtensions.value) this.updateAllExtensions();
      if (
        Object.values(allowedExtensionLanguages.value).filter((e) => e)
          .length === 0
      ) {
        const data: Record<string, boolean> = {};
        for (const lang of suwayomi.availableExtensionLangs) {
          data[lang] = ["all", "en", "pt-br", "es"].includes(lang);
        }
        allowedExtensionLanguages.value = data;
      }
    });
  },
  async updateAllExtensions(excludeNonAuto: boolean = true) {
    let hasUpdated = false;
    for (let extension of suwayomi.rawExtensions) {
      if (
        extension.hasUpdate &&
        (excludeNonAuto
          ? !(disableAutoUpdateByExtension.value[extension.pkgName] ?? false)
          : true)
      ) {
        await this.patchExtension(extension.pkgName, "update", false);
        hasUpdated = true;
      }
    }
    if (hasUpdated) {
      this.getExtensions();
      this.getSources();
    }
  },
  async patchExtension(
    pkgName: string,
    patch: "install" | "uninstall" | "update",
    refreshAfter: boolean = true,
  ): Promise<Extension> {
    return fetch(suwayomiUrl.value + "/api/graphql", {
      method: "POST",
      bodyC: {
        operationName: "UPDATE_EXTENSION",
        variables: {
          input: {
            id: pkgName,
            patch: { [patch]: true },
          },
        },
        query: `
          fragment EXTENSION_LIST_FIELDS on ExtensionType {
            pkgName
            name
            lang
            versionCode
            versionName
            iconUrl
            repo
            isNsfw
            isInstalled
            isObsolete
            hasUpdate
          }

          mutation UPDATE_EXTENSION($input: UpdateExtensionInput!) {
            updateExtension(input: $input) {
              extension {
                ...EXTENSION_LIST_FIELDS
              }
            }
          }
        `,
      },
    })
      .then(async (r) => {
        const rJson = await r.json();
        if (refreshAfter) {
          this.getSources();
          this.getExtensions();
        }
        return rJson.data.updateExtension.extension;
      })
      .catch((e) => {
        console.log(e);
      });
  },
  async installExternalExtension(file: File): Promise<Extension> {
    const formData = new FormData();
    formData.append(
      "operations",
      JSON.stringify({
        operationName: "INSTALL_EXTERNAL_EXTENSION",
        variables: { file: null },
        query: `
      fragment EXTENSION_LIST_FIELDS on ExtensionType {
        pkgName
        name
        lang
        versionCode
        versionName
        iconUrl
        repo
        isNsfw
        isInstalled
        isObsolete
        hasUpdate
      }

      mutation INSTALL_EXTERNAL_EXTENSION($file: Upload!) {
        installExternalExtension(input: { extensionFile: $file }) {
          extension {
            ...EXTENSION_LIST_FIELDS
          }
        }
      }
    `,
      }),
    );
    formData.append(
      "map",
      JSON.stringify({
        "1": ["variables.file"],
      }),
    );
    formData.append("1", file, file.name);
    return fetch(suwayomiUrl.value + "/api/graphql", {
      method: "POST",
      body: formData,
    }).then(async (r) => {
      const rJson = await r.json();
      this.getExtensions();
      return rJson.data.installExternalExtension.extension;
    });
  },
  async getSources() {
    fetch(suwayomiUrl.value + "/api/graphql", {
      method: "POST",
      bodyC: {
        operationName: "GET_SOURCES_LIST",
        variables: {},
        query: `
          fragment SOURCE_BASE_FIELDS on SourceType {
            id
            name
            displayName
            lang
          }

          fragment SOURCE_META_FIELDS on SourceMetaType {
            sourceId
            key
            value
          }

          fragment SOURCE_LIST_FIELDS on SourceType {
            ...SOURCE_BASE_FIELDS
            lang
            iconUrl
            isNsfw
            isConfigurable
            supportsLatest
            meta {
              ...SOURCE_META_FIELDS
            }
            extension {
              pkgName
              repo
            }
          }

          query GET_SOURCES_LIST {
            sources {
              nodes {
                ...SOURCE_LIST_FIELDS
              }
            }
          }
      `,
      },
    }).then(async (r) => {
      const rJson = await r.json();
      suwayomi.rawSources = rJson.data.sources.nodes;
      await delay(10);
      if (
        Object.values(allowedSourceLanguages.value).filter((s) => s).length ===
        0
      ) {
        const data: Record<string, boolean> = {};
        for (const lang of suwayomi.availableSourceLangs) {
          data[lang] = ["all", "en", "pt-br", "es"].includes(lang);
        }
        allowedSourceLanguages.value = data;
      }
    });
  },
  async getSourceSettings(sourceId: string): Promise<SourceSettings> {
    return fetch(suwayomiUrl.value + "/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      bodyC: {
        operationName: "GET_SOURCE_SETTINGS",
        variables: {
          id: sourceId,
        },
        query: `
      fragment SOURCE_BASE_FIELDS on SourceType {
        id
        name
        displayName
        lang
      }

      fragment SOURCE_SETTING_FIELDS on SourceType {
        ...SOURCE_BASE_FIELDS
        preferences {
          ... on CheckBoxPreference {
            type: __typename
            CheckBoxCheckBoxCurrentValue: currentValue
            summary
            CheckBoxDefault: default
            key
            CheckBoxTitle: title
          }
          ... on EditTextPreference {
            type: __typename
            EditTextPreferenceCurrentValue: currentValue
            EditTextPreferenceDefault: default
            EditTextPreferenceTitle: title
            text
            summary
            key
            dialogTitle
            dialogMessage
          }
          ... on SwitchPreference {
            type: __typename
            SwitchPreferenceCurrentValue: currentValue
            summary
            key
            SwitchPreferenceDefault: default
            SwitchPreferenceTitle: title
          }
          ... on MultiSelectListPreference {
            type: __typename
            dialogMessage
            dialogTitle
            MultiSelectListPreferenceTitle: title
            summary
            key
            entryValues
            entries
            MultiSelectListPreferenceDefault: default
            MultiSelectListPreferenceCurrentValue: currentValue
          }
          ... on ListPreference {
            type: __typename
            ListPreferenceCurrentValue: currentValue
            ListPreferenceDefault: default
            ListPreferenceTitle: title
            summary
            key
            entryValues
            entries
          }
        }
      }

      query GET_SOURCE_SETTINGS($id: LongString!) {
        source(id: $id) {
          ...SOURCE_SETTING_FIELDS
        }
      }
    `,
      },
    }).then(async (r) => {
      const rJson = await r.json();
      return rJson.data.source;
    });
  },
  async setSourceSettingPreference(
    input: UpdateSourcePreferencesInput,
  ): Promise<SourceSettings> {
    return fetch(suwayomiUrl.value + "/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      bodyC: {
        operationName: "UPDATE_SOURCE_PREFERENCES",
        variables: { input },
        query: `
        fragment SOURCE_BASE_FIELDS on SourceType {
          id
          name
          displayName
          lang
          iconUrl
        }

        fragment SOURCE_SETTING_FIELDS on SourceType {
          ...SOURCE_BASE_FIELDS
          preferences {
            ... on CheckBoxPreference {
              type: __typename
              CheckBoxCheckBoxCurrentValue: currentValue
              summary
              CheckBoxDefault: default
              key
              CheckBoxTitle: title
            }
            ... on EditTextPreference {
              type: __typename
              EditTextPreferenceCurrentValue: currentValue
              EditTextPreferenceDefault: default
              EditTextPreferenceTitle: title
              text
              summary
              key
              dialogTitle
              dialogMessage
            }
            ... on SwitchPreference {
              type: __typename
              SwitchPreferenceCurrentValue: currentValue
              summary
              key
              SwitchPreferenceDefault: default
              SwitchPreferenceTitle: title
            }
            ... on MultiSelectListPreference {
              type: __typename
              dialogMessage
              dialogTitle
              MultiSelectListPreferenceTitle: title
              summary
              key
              entryValues
              entries
              MultiSelectListPreferenceDefault: default
              MultiSelectListPreferenceCurrentValue: currentValue
            }
            ... on ListPreference {
              type: __typename
              ListPreferenceCurrentValue: currentValue
              ListPreferenceDefault: default
              ListPreferenceTitle: title
              summary
              key
              entryValues
              entries
            }
          }
        }

        mutation UPDATE_SOURCE_PREFERENCES($input: UpdateSourcePreferenceInput!) {
          updateSourcePreference(input: $input) {
            source {
              ...SOURCE_SETTING_FIELDS
            }
          }
        }
      `,
      },
    }).then(async (r) => {
      const rJson = await r.json();
      return rJson.data.updateSourcePreference.source;
    });
  },
  async getSourceBrowse(sourceId: string): Promise<SourceBrowse> {
    return fetch(suwayomiUrl.value + "/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operationName: "GET_SOURCE_BROWSE",
        variables: { id: sourceId },
        query: `
        fragment SOURCE_BASE_FIELDS on SourceType {
          id
          name
          displayName
          lang
          iconUrl
        }

        fragment SOURCE_META_FIELDS on SourceMetaType {
          sourceId
          key
          value
        }

        fragment SOURCE_BROWSE_FIELDS on SourceType {
          ...SOURCE_BASE_FIELDS
          baseUrl
          isConfigurable
          supportsLatest
          meta {
            ...SOURCE_META_FIELDS
          }
          filters {
            ... on CheckBoxFilter {
              type: __typename
              CheckBoxFilterDefault: default
              name
            }
            ... on HeaderFilter {
              type: __typename
              name
            }
            ... on SelectFilter {
              type: __typename
              SelectFilterDefault: default
              name
              values
            }
            ... on TriStateFilter {
              type: __typename
              TriStateFilterDefault: default
              name
            }
            ... on TextFilter {
              type: __typename
              TextFilterDefault: default
              name
            }
            ... on SortFilter {
              type: __typename
              SortFilterDefault: default {
                ascending
                index
              }
              name
              values
            }
            ... on SeparatorFilter {
              type: __typename
              name
            }
            ... on GroupFilter {
              type: __typename
              name
              filters {
                ... on CheckBoxFilter {
                  type: __typename
                  CheckBoxFilterDefault: default
                  name
                }
                ... on HeaderFilter {
                  type: __typename
                  name
                }
                ... on SelectFilter {
                  type: __typename
                  SelectFilterDefault: default
                  name
                  values
                }
                ... on TriStateFilter {
                  type: __typename
                  TriStateFilterDefault: default
                  name
                }
                ... on TextFilter {
                  type: __typename
                  TextFilterDefault: default
                  name
                }
                ... on SortFilter {
                  type: __typename
                  SortFilterDefault: default {
                    ascending
                    index
                  }
                  name
                  values
                }
                ... on SeparatorFilter {
                  type: __typename
                  name
                }
              }
            }
          }
        }

        query GET_SOURCE_BROWSE($id: LongString!) {
          source(id: $id) {
            ...SOURCE_BROWSE_FIELDS
          }
        }
      `,
      }),
    })
      .then(async (r) => {
        const rJson = await r.json();
        return rJson.data.source;
      })
      .catch((r) => console.log(r));
  },
  async fetchSourceManga(
    input: FetchSourceMangaInput,
  ): Promise<FetchSourceMangaResult> {
    return fetch(suwayomiUrl.value + "/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operationName: "GET_SOURCE_MANGAS_FETCH",
        variables: { input },
        query: `
        mutation GET_SOURCE_MANGAS_FETCH($input: FetchSourceMangaInput!) {
          fetchSourceManga(input: $input) {
            hasNextPage
            mangas {
              id
              title
              thumbnailUrl
              thumbnailUrlLastFetched
              inLibrary
              initialized
              sourceId
              genre
              lastFetchedAt
              inLibraryAt
              status
              artist
              author
              description
              realUrl
              meta {
                mangaId
                key
                value
              }
            }
          }
        }
      `,
      }),
    }).then(async (r) => {
      const rJson = await r.json();
      return rJson.data.fetchSourceManga;
    });
  },
};
