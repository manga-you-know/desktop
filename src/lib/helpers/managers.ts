import { fetch } from "@/lib/helpers";
import { suwayomiUrl } from "@/states";
import { suwayomi } from "@/states";

export const suwaManager = {
  setRepos: async () => {
    suwayomi.extensionRepos = [
      "https://github.com/t/r",
      "https://github.com/reilokos/r",
    ];
    console.log(`${suwayomi.extensionRepos}`);
    fetch(suwayomiUrl.value + "/api/graphql", {
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
        console.log(await r.text());
      })
      .catch((e) => console.log(e));
  },
};
