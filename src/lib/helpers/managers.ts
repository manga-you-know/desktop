import { fetch } from "@/lib/helpers";
import { suwayomiUrl } from "@/states";
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
        if (suwayomi.extensions.length === 0) {
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
                extensionRepos: [${suwayomi.extensionRepos.map((ex) => `"${ex}"`)}] 
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
        console.log(rJson);
        if (!Object.hasOwn(rJson, "errors")) {
          suwayomi.extensionRepos =
            rJson.data.setSettings.settings.extensionRepos;
          this.getExtensions();
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
      suwayomi.extensions = rJson.data.fetchExtensions.extensions;
    });
  },
};
