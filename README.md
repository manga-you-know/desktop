<div align="center" style="flex: auto">
<H1>
<img height="25px" style="border-radius: 10%" src="/static/icon.png" />
MangaYouKnow</H1>

<img height="450px" src="/docs/assets/demo.gif" />

</div>

# MangaYouKnow desktop

MangaYouKnow is a manga reader that allows you to read, download and keep track manga & comics from multiple sources in one app.

## Download

Download the latest version from [here](https://github.com/manga-you-know/desktop/releases/latest/).

- Windows
  - the best way is with the Msi installer, but if you don't have admin rights you can use the Nsis installer (the .exe file).
- MacOS

  - Unfortunately I don't have a Mac to test the app on MacOS, so if you have any issue with the app please let me know. I don't even know if it will work on MacOS.

- Linux

  - I know it works on Linux, but I didn't test it. Let me know if you have any issue.

- Mobile
  - Its in my plans.

Discord server to contact me: [MangaYouKnow server](https://discord.gg/FK37mJtFD4)

## Dev setup

In this project, I use [Bun](https://bun.sh/) as the JavaScript runtime and I personally recommend it.
If you want to use another runtime, you must change the `src-tauri/tauri.conf.json` file.
There you replace `bun`in the `beforeDevCommand` and `beforeBuildCommand` with the runtime you want to use.

Please don't commit the change of runtime in the `src-tauri/tauri.conf.json` file.

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
