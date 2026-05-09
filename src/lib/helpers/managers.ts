import { fetch } from "@/lib/helpers";
import {
  activeExtensionRepos,
  allowedExtensionLanguages,
  allowedSourceLanguages,
  repoInfo,
  suwayomiUrl,
} from "@/states";
import { suwayomi } from "@/states";
import { Child, Command } from "@tauri-apps/plugin-shell";
import { getBasePath } from "../utils";
import { delay } from "@/utils";

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
        if (suwayomi.rawExtensions.length === 0) {
          this.getExtensions();
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
      const infoFile = getBasePath(repo) + "repo.json";
      const info = await fetch(infoFile);
      const infoJson = await info.json();
      repoInfo.value = {
        ...repoInfo.value,
        [getBasePath(repo)]: {
          name: infoJson.meta.name,
          website: infoJson.meta.website,
        },
      };
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
            const data: Record<string, boolean> = {};
            for (const lang of suwayomi.availableExtensionLangs) {
              data[lang] = true;
            }
            allowedExtensionLanguages.value = data;
            this.getSources().then(async (_) => {
              await delay(10);
              const data: Record<string, boolean> = {};
              for (const lang of suwayomi.availableSourceLangs) {
                data[lang] = true;
              }
              allowedSourceLanguages.value = data;
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
            isNsfw
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
      if (
        Object.values(allowedExtensionLanguages.value).filter((e) => e)
          .length === 0
      ) {
        const data: Record<string, boolean> = {};
        for (const lang of suwayomi.availableExtensionLangs) {
          data[lang] = true;
        }
        allowedExtensionLanguages.value = data;
      }
    });
  },
  async updateExtension(pkgName: string, install: boolean): Promise<boolean> {
    return fetch(suwayomiUrl.value + "/api/graphql", {
      method: "POST",
      bodyC: {
        operationName: "UPDATE_EXTENSION",
        variables: {
          input: {
            id: pkgName,
            patch: install ? { install: true } : { uninstall: true },
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
    }).then(async (r) => {
      const rJson = await r.json();
      this.getSources();
      return rJson.data.updateExtension.extension.isInstalled;
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
          data[lang] = true;
        }
        allowedSourceLanguages.value = data;
      }
    });
  },
};
