<div align="center" style="flex: auto">
<H1>
<img height="25px" style="border-radius: 10%" src="https://private-user-images.githubusercontent.com/103978193/263557231-d0d4ff85-2308-4baa-b56a-0e99a9faa7dc.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MzIzMjUzNTgsIm5iZiI6MTczMjMyNTA1OCwicGF0aCI6Ii8xMDM5NzgxOTMvMjYzNTU3MjMxLWQwZDRmZjg1LTIzMDgtNGJhYS1iNTZhLTBlOTlhOWZhYTdkYy5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMTIzJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTEyM1QwMTI0MThaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1iYTE4Y2JiN2Y3MGJiMWM5ZDkyOGZjMTI3ZGU3NjM1Njc1NzI2ZDRiYzNkYTJiNTEzMDA5MDhiM2RkNGEwMzNjJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.sfY8MR_Ns-zz2Qb_SQJXp5Cfohym8kY4HMFEt2Z4Rn4">
MangaYouKnow</H1>

https://github.com/user-attachments/assets/5ca8bb1d-dbb1-4c70-88a9-e218499113f9


</div>

# MangaYouKnow desktop

MangaYouKnow is a manga reader that allows you to read manga from multiple sources in one app.


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

## Start a development app



```bash
bun tauri dev
```

## Production

Build the application for production:

```bash
bun tauri build
```
