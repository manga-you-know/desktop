<div align="center" style="flex: auto">
<img style="width: 100%" src="/docs/assets/banner-github.png" />
</div>

[![](https://dcbadge.limes.pink/api/server/EVqHFtP2r8?style=flat)](https://discord.gg/EVqHFtP2r8) [![release](https://img.shields.io/github/v/release/manga-you-know/desktop)](https://github.com/manga-you-know/desktop/releases/latest) [![downloads](https://img.shields.io/github/downloads/manga-you-know/desktop/total?color=red)](https://github.com/manga-you-know/desktop/releases/latest) [![](https://img.shields.io/badge/human-coded-purple?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1wZXJzb24tc3RhbmRpbmctaWNvbiBsdWNpZGUtcGVyc29uLXN0YW5kaW5nIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjUiIHI9IjEiLz48cGF0aCBkPSJtOSAyMCAzLTYgMyA2Ii8+PHBhdGggZD0ibTYgOCA2IDIgNi0yIi8+PHBhdGggZD0iTTEyIDEwdjQiLz48L3N2Zz4=)](https://github.com/ReiLoko4) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/manga-you-know/desktop) ![GitHub Repo stars](https://img.shields.io/github/stars/manga-you-know/desktop)


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
| <b style="width: 100%; display: flex; justify-content: center">Windows</b> | The app is developed here, so its supposed to run really smooth with every functionality            | ✅Yes                                          |
| <b style="width: 100%; display: flex; justify-content: center">macOS</b>   | Since I don't own a Mac yet, I don't know the extends of functionalities here                       | ☑️Mostly                                      |
| <b style="width: 100%; display: flex; justify-content: center">Linux</b>   | Already tested but needs some fixing in UI, since Linux seems to hate blur effects. IDK about Arch  | ☑️ Mostly                                     |
| <b style="width: 100%; display: flex; justify-content: center">Android</b> | I need more time and RAM on my device to make it useful                                             | <p style="white-space:nowrap" >⛔Partially</p> |
| <b style="width: 100%; display: flex; justify-content: center">iOS</b>     | Doesn't seem possible yet, at least until I figure out how to sign without a Apple dev paid account | ❌No.                                          |
 

## About 

### Stack

- [Rust](https://www.rust-lang.org/pt-BR)
  - [Tauri](https://v2.tauri.app/)
    <details>
      <summary>Tauri Official Plugins</summary>
	  <ul>
	    <li><a href="https://v2.tauri.app/plugin/sql/">@tauri-apps/plugin-sql</a></li>
	    <li><a href="https://v2.tauri.app/plugin/http/">@tauri-apps/plugin-http</a></li>
	    <li><a href="https://v2.tauri.app/plugin/store/">@tauri-apps/plugin-store</a></li>
	    <li><a href="https://v2.tauri.app/plugin/file-system/">@tauri-apps/plugin-fs</a></li>
	    <li><a href="https://v2.tauri.app/plugin/updater/">@tauri-apps/plugin-updater</a></li>
	    <li><a href="https://v2.tauri.app/plugin/notification/">@tauri-apps/plugin-notification</a></li>
	    <li><a href="https://v2.tauri.app/plugin/single-instance/">@tauri-apps/plugin-single-instance</a></li>
	    <li><a href="https://v2.tauri.app/plugin/opener/">@tauri-apps/plugin-opener</a></li>
	    <li><a href="https://v2.tauri.app/plugin/autostart/">@tauri-apps/plugin-autostart</a></li>
	    <li><a href="https://v2.tauri.app/plugin/process/">@tauri-apps/plugin-process</a></li>
	    <li><a href="https://v2.tauri.app/plugin/os-info/">@tauri-apps/plugin-os</a></li>
	    <li><a href="https://v2.tauri.app/plugin/window-state">@tauri-apps/plugin-window-state</a></li>
	    <li><a href="https://v2.tauri.app/plugin/positioner/">@tauri-apps/plugin-positioner</a></li>
	    <li><a href="https://v2.tauri.app/plugin/cli/">@tauri-apps/plugin-cli</a></li>
	    <li><a href="https://v2.tauri.app/plugin/shell/">@tauri-apps/plugin-shell</a></li>
	  </ul>
    </details>
  - [@ferreira-tb/tauri-plugin-prevent-default](https://github.com/ferreira-tb/tauri-plugin-prevent-default)  
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

### Stars

<a href="https://star-history.com/#manga-you-know/desktop&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=manga-you-know/desktop&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=manga-you-know/desktop&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=manga-you-know/desktop&type=Date" />
  </picture>
</a>

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
