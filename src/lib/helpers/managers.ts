import { fetch } from "@/lib/helpers";
import { activeExtensionRepos, suwayomiUrl } from "@/states";
import { suwayomi } from "@/states";
import { Child, Command } from "@tauri-apps/plugin-shell";

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
      if (activeExtensionRepos.value.length === 0) {
        activeExtensionRepos.value = suwayomi.extensionRepos;
        console.log(activeExtensionRepos.value);
      }
    });
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
          activeExtensionRepos.value = suwayomi.extensionRepos;
          // this.getExtensions();
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
      return rJson.data.updateExtension.extension.isInstalled;
    });
  },
};
