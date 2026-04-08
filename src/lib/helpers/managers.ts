import { fetch } from "@/lib/helpers";
import { suwayomiUrl } from "@/states";
import { suwayomi } from "@/states";
import { Command } from "@tauri-apps/plugin-shell";

const command = Command.sidecar("binaries/suwayomi");
command.on("error", (err) => {
  console.log("Error in Suwayomi: ", err);
});

export const suwaManager = {
  async startSuwayomi() {
    this.isConnected().then((spawned) => {
      if (!spawned) {
        command.spawn();
      }
    });
  },
  async isConnected(): Promise<boolean> {
    return fetch(suwayomiUrl.value)
      .then((r) => r.ok)
      .catch(() => false);
  },
  async getRepos() {
    fetch(suwayomiUrl.value + "/api/graphql", {
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
        return !Object.hasOwn(rJson, "errors");
      })
      .catch(() => false);
  },
};
