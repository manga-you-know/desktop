
## Dev setup

In this project, I use [Bun](https://bun.sh/) as the JavaScript runtime and I personally recommend it.
If you want to use another runtime, you must change the `src-tauri/tauri.conf.json` file.
There you replace `bun`in the `beforeDevCommand` and `beforeBuildCommand` with the runtime you want to use.

Please don't commit the change of runtime in the `src-tauri/tauri.conf.json` file.

Make sure to install the dependencies:

```bash
bun install
```

## Start a development app



```bash
bun tauri dev
```

## Production

Build the application for production:

```bash
bun tauri build
```
