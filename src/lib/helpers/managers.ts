import { fetch } from "@/lib/helpers";
import {
  activeExtensionRepos,
  allowedExtensionLanguages,
  allowedSourceLanguages,
  autoUpdateExtensions,
  disableAutoUpdateByExtension,
  repoInfo,
  crEvent,
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
  Source,
  SourceBrowse,
  SourceSettings,
  MangaScreen,
  UpdateSourcePreferencesInput,
} from "@/types/server";
import { gqlMutation, gqlQuery } from "@/lib/gql/client";
import {
  getExtensionRepos,
  getMangaScreenQuery,
  getSourceBrowse as getSourceBrowseQuery,
  getSourceSettings as getSourceSettingsQuery,
  getSources as getSourcesQuery,
} from "@/lib/gql/Queries";
import {
  fetchExtensions as fetchExtensionsMutation,
  fetchMangaMutation,
  fetchSourceManga as fetchSourceMangaMutation,
  setExtensionRepos,
  updateExtension as updateExtensionMutation,
  updateSourcePreference as updateSourcePreferenceMutation,
} from "@/lib/gql/Mutations";

const command = Command.sidecar("binaries/suwayomi");
let child: Child = null!;
command.on("error", (err) => {
  console.log("Error in Suwayomi: ", err);
});

let cacheTTL: Record<
  string,
  {
    expiresAt: Date;
    data: any;
  }
> = {};

const CACHE_TTL_MS = 0.5 * 60 * 60 * 1000; // 1h, or 4 * 60 * 60 * 1000 for 4h

const setCache = (input: any, data: any) => {
  cacheTTL[JSON.stringify(input)] = {
    expiresAt: new Date(Date.now() + CACHE_TTL_MS),
    data,
  };
};

const getCache = (input: FetchSourceMangaInput): any | undefined => {
  const key = JSON.stringify(input);
  const item = cacheTTL[key];
  if (item) {
    if (item.expiresAt.getTime() > Date.now()) {
      return item.data;
    } else {
      delete cacheTTL[key];
    }
  }
};

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
  async clearCache(key?: string) {
    if (key) {
      delete cacheTTL[key];
    } else {
      cacheTTL = {};
    }
  },
  async getRepos() {
    return gqlQuery<
      { settings: { extensionRepos: string[] } },
      Record<string, never>
    >(getExtensionRepos, {}).then((data) => {
      suwayomi.extensionRepos = data.settings.extensionRepos;
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
    return gqlMutation<
      { setSettings: { settings: { extensionRepos: string[] } } },
      { repos: string[] }
    >(setExtensionRepos, { repos: suwayomi.extensionRepos })
      .then(async (data) => {
        suwayomi.extensionRepos = data.setSettings.settings.extensionRepos;
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
              Object.values(allowedSourceLanguages.value).filter((e) => e)
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
      })
      .catch(() => false);
  },
  async getExtensions() {
    gqlMutation<
      { fetchExtensions: { extensions: Extension[] } },
      { input: Record<string, never> }
    >(fetchExtensionsMutation, { input: {} }).then(async (data) => {
      suwayomi.rawExtensions = data.fetchExtensions.extensions;
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
    if (crEvent.val["ext-" + patch + pkgName])
      throw new Error("already doinnggg");
    crEvent.val["ext-" + patch + pkgName] = true;
    return gqlMutation<
      { updateExtension: { extension: Extension } },
      {
        input: {
          id: string;
          patch: Record<"install" | "uninstall" | "update", boolean | null>;
        };
      }
    >(updateExtensionMutation, {
      input: {
        id: pkgName,
        patch: {
          install: patch === "install" ? true : null,
          uninstall: patch === "uninstall" ? true : null,
          update: patch === "update" ? true : null,
        },
      },
    })
      .then((data) => {
        crEvent.val["ext-update" + pkgName] = false;
        if (refreshAfter) {
          this.getSources();
          this.getExtensions();
        }
        return data.updateExtension.extension;
      })
      .catch((e) => {
        throw e;
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
    gqlQuery<{ sources: { nodes: Source[] } }, Record<string, never>>(
      getSourcesQuery,
      {},
    )
      .then(async (data) => {
        suwayomi.rawSources = data.sources.nodes;
        await delay(10);
        if (
          Object.values(allowedSourceLanguages.value).filter((s) => s)
            .length === 0
        ) {
          const data: Record<string, boolean> = {};
          for (const lang of suwayomi.availableSourceLangs) {
            data[lang] = ["all", "en", "pt-br", "es"].includes(lang);
          }
          allowedSourceLanguages.value = data;
        }
      })
      .then((e) => {
        console.log(e);
      });
  },
  async getSourceSettings(sourceId: string): Promise<SourceSettings> {
    return gqlQuery<{ source: SourceSettings }, { id: string }>(
      getSourceSettingsQuery,
      { id: sourceId },
    ).then((data) => data.source);
  },
  async setSourceSettingPreference(
    input: UpdateSourcePreferencesInput,
  ): Promise<SourceSettings> {
    return gqlMutation<
      { updateSourcePreference: { source: SourceSettings } },
      { input: UpdateSourcePreferencesInput }
    >(updateSourcePreferenceMutation, { input }).then(
      (data) => data.updateSourcePreference.source,
    );
  },
  async getSourceBrowse(sourceId: string): Promise<SourceBrowse> {
    return gqlQuery<{ source: SourceBrowse }, { id: string }>(
      getSourceBrowseQuery,
      { id: sourceId },
    ).then((data) => data.source);
  },
  async fetchSourceManga(
    input: FetchSourceMangaInput,
  ): Promise<FetchSourceMangaResult> {
    const cached = getCache(input);
    if (cached) return cached;
    const data = await gqlMutation<
      { fetchSourceManga: FetchSourceMangaResult },
      { input: FetchSourceMangaInput }
    >(fetchSourceMangaMutation, { input }).then(
      (data) => data.fetchSourceManga,
    );
    setCache(input, data);
    return data;
  },
  async getMangaScreen(id: number): Promise<MangaScreen> {
    return gqlQuery<{ manga: MangaScreen }, { id: number }>(
      getMangaScreenQuery,
      { id },
    ).then((data) => data.manga);
  },

  async fetchManga(id: number): Promise<MangaScreen> {
    return gqlMutation<{ fetchManga: { manga: MangaScreen } }, { id: number }>(
      fetchMangaMutation,
      { id },
    ).then((data) => data.fetchManga.manga);
  },
};
