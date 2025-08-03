<div align="center" style="flex: auto">
<H1>
<img height="25px" style="border-radius: 10%" src="/static/icon.png" />
MangaYouKnow</H1>

<img height="450px" src="/docs/assets/demo.gif" />

</div>

# MangaYouKnow desktop

MangaYouKnow is a manga reader that allows you to read, download and keep track manga & comics from multiple sources in one app.

## Download

You can find the newest version [here](https://github.com/manga-you-know/desktop/releases/latest/).

Avaible for:

- Windows
  - This is where most of things are tested so its the most finished version 
- MacOS
  - Since I don't own a Mac yet, I don't know the extends of functionatilities there
- Linux
  - Already tested but needs some fixing in UI, since Linux seems to hate blur effects.
- Android
  - I need more time and RAM on my device to make it useful
- iOS
  - Doesn't seem possible yet, at least until I figure out how to sign without a Apple dev paid account

Discord server to contact me: [MangaYouKnow server](https://discord.gg/FK37mJtFD4)

## Contribuition

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
