<div align="center" style="flex: auto">
<H1>
<img height="25px" style="border-radius: 10%" src="/docs/assets/icon.png" />
MangaYouKnow</H1>

  <img
    src="/docs/assets/overall-demonstration.gif"
    style="width: 100%; object-fit: contain; border-radius: 6px" />
</div>


# MangaYouKnow desktop

MangaYouKnow is a manga reader that allows you to read, download and keep track manga & comics from multiple sources in one app.

## Download and use

You can find the newest version for all platforms [here](https://github.com/manga-you-know/desktop/releases/latest/).


Available platforms:

| OS                                                                                                                                           | Currently status                                                                                    | Working?                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| <p style="display: flex; align-items: center; gap: 0.5rem; white-space: nowrap" > <img src="/docs/assets/windows.png" width="16" />  Windows | most of things are tested so its the most finished version                                          | ✅Yes                                          |
| <p style="display: flex; align-items: center; white-space: nowrap" >  <img src="/docs/assets/apple.png" width="20" />  MacOS <br></p>        | Since I don't own a Mac yet, I don't know the extends of functionalities there                      | ☑️Mostly                                      |
| <p style="display: flex; align-items: center; white-space: nowrap" >  <img src="/docs/assets/linux.png" width="16"/>  Linux <br></p>         | Already tested but needs some fixing in UI, since Linux seems to hate blur effects                  | ☑️ Mostly                                     |
| <p style="display: flex; align-items: center; white-space: nowrap" >  <img src="/docs/assets/android.png" width="16" />  Android </p>        | I need more time and RAM on my device to make it useful                                             | <p style="white-space:nowrap" >⛔Partially</p> |
| <p style="display: flex; align-items: center; white-space: nowrap" >  <img src="/docs/assets/ios.png" width="16" />  iOS </p>                | Doesn't seem possible yet, at least until I figure out how to sign without a Apple dev paid account | ❌No.                                          |
 
<p style="display: flex; align-items: center; gap: 0.5rem" >
    <img src="/docs/assets/discord.png" width="16" />
Discord server to contact me: <a href="https://discord.gg/FK37mJtFD4" target="_blank">MangaYouKnow server</a>
</p> 

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
