<div align="center" style="flex: auto">
<img style="width: 100%" src="/docs/assets/banner-github.png" />
</div>

[![release](https://img.shields.io/github/v/release/manga-you-know/desktop)](https://github.com/manga-you-know/desktop/releases/latest) [![downloads](https://img.shields.io/github/downloads/manga-you-know/desktop/total)](https://github.com/manga-you-know/desktop/releases/latest)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Z8Z31J7YP7)

<div align="center" style="flex: auto">
  <img
    src="/docs/assets/overall-demonstration.gif"
    style="width: 100%; object-fit: contain; border-radius: 6px" />
</div>

# MangaYouKnow desktop

MangaYouKnow is a open-source manga reader under the MIT license. 

## Download and use

You can find the newest version for all platforms [here](https://github.com/manga-you-know/desktop/releases/latest/).


Available platforms:

| OS                                                                                                                                           | Currently status                                                                                    | Working?                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| <p style="display: flex; align-items: center; gap: 0.5rem; white-space: nowrap" > <img src="/docs/assets/windows.png" width="16" />  Windows | The app is developed here, so its supposed to run really smooth with every functionality            | ✅Yes                                          |
| <p style="display: flex; align-items: center; white-space: nowrap" >  <img src="/docs/assets/apple.png" width="20" />  MacOS <br></p>        | Since I don't own a Mac yet, I don't know the extends of functionalities here                       | ☑️Mostly                                      |
| <p style="display: flex; align-items: center; white-space: nowrap" >  <img src="/docs/assets/linux.png" width="16"/>  Linux <br></p>         | Already tested but needs some fixing in UI, since Linux seems to hate blur effects. IDK about Arch  | ☑️ Mostly                                     |
| <p style="display: flex; align-items: center; white-space: nowrap" >  <img src="/docs/assets/android.png" width="16" />  Android </p>        | I need more time and RAM on my device to make it useful                                             | <p style="white-space:nowrap" >⛔Partially</p> |
| <p style="display: flex; align-items: center; white-space: nowrap" >  <img src="/docs/assets/ios.png" width="16" />  iOS </p>                | Doesn't seem possible yet, at least until I figure out how to sign without a Apple dev paid account | ❌No.                                          |
 
<p style="display: flex; align-items: center; gap: 0.5rem" >
    <img src="/docs/assets/discord.png" width="16" />
Discord server to contact me: <a href="https://discord.gg/FK37mJtFD4" target="_blank">MangaYouKnow server</a>
</p> 

## About 

### Stack

- [Rust](https://www.rust-lang.org/pt-BR)
	- [Tauri](https://v2.tauri.app/)
		- [@tauri-apps/plugin-sql](https://v2.tauri.app/plugin/sql/)
		- [@tauri-apps/plugin-http](https://v2.tauri.app/plugin/http/)
		- [@tauri-apps/plugin-store](https://v2.tauri.app/plugin/store/)
		- [@tauri-apps/plugin-fs](https://v2.tauri.app/plugin/file-system/)
		- [@tauri-apps/plugin-updater](https://v2.tauri.app/plugin/updater/)
		- [@tauri-apps/plugin-notification](https://v2.tauri.app/plugin/notification/)
		- [@tauri-apps/plugin-single-instance](https://v2.tauri.app/plugin/single-instance/)
		- [@tauri-apps/plugin-opener](https://v2.tauri.app/plugin/opener/)
		- [@tauri-apps/plugin-autostart](https://v2.tauri.app/plugin/autostart/)  
		- [@tauri-apps/plugin-process](https://v2.tauri.app/plugin/process/)
		- [@tauri-apps/plugin-os](https://v2.tauri.app/plugin/os-info/)
		- [@tauri-apps/plugin-window-state](https://v2.tauri.app/plugin/window-state)
		- [@tauri-apps/plugin-positioner](https://v2.tauri.app/plugin/positioner/)
		- [@tauri-apps/plugin-cli](https://v2.tauri.app/plugin/cli/)
		- [@tauri-apps/plugin-shell](https://v2.tauri.app/plugin/shell/)
	- [@ferreira-tb/tauri-plugin-prevent-default ](https://github.com/ferreira-tb/tauri-plugin-prevent-default)
	- [@CrossCopy/tauri-plugin-clipboard](https://github.com/CrossCopy/tauri-plugin-clipboard)
- [Typescript](https://www.typescriptlang.org/)
	- [Sveltekit](https://svelte.dev/docs/kit/introduction)
	- [TailwindCSS v3](https://v3.tailwindcss.com/)
	- [Shadcn Svelte](https://www.shadcn-svelte.com/)
	- [Svelte UX](https://svelte-ux.techniq.dev/)
	- [Iconify](https://iconify.design/)
	- [Cheerio](https://cheerio.js.org/)
<!--
### Functionalities

<details>
  <summary>Search</summary>
  Here gif for searching
</details>
<details>
  <summary>Read</summary>
  World!
</details>
<details>
  <summary>Download</summary>
  World!
</details>
<details>
  <summary>Favorites</summary>
  World!
</details>
<details>
  <summary>Tags</summary>
  World!
</details>
<details>
  <summary>Save panels</summary>
  World!
</details>
-->

## Contribution

Since this project is made with Tauri, you have to install all of its [prerequisites](https://v2.tauri.app/start/prerequisites/) based on which platform you are on.
In this project, I use [Bun](https://bun.sh/), even though it doesn't really impacts this project as it is rendered by Tauri, I like it.
You can use whichever you like, just don't commit the changes you need to make it work.

There's no other setup, just installing the dependencies with the command below should work.
Dependencies such as SvelteKit, TailwindCSS and so on.


Make sure to install the dependencies:
```bash
bun install
```
### Start a development app

```bash
bun tauri dev
```
### Production

Build the application for production:

```bash
bun tauri build
```
