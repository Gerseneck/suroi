<div align="center">
  <img src="client/public/img/backgrounds/github_background.png" alt="Suroi">
  <hr>
</div>


<div align="center">
  <img src="https://img.shields.io/badge/node.js%20-%23339933.svg?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img src="https://img.shields.io/badge/typescript-%233178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/pixijs%20-%23e22162.svg?style=for-the-badge">
  <img src="https://img.shields.io/badge/uwebsockets.js%20-%23000000.svg?style=for-the-badge">
  <img src="https://img.shields.io/badge/html-%23E34F26?style=for-the-badge&logo=html5&logoColor=white">
  <img src="https://img.shields.io/badge/css-%231572B6?style=for-the-badge&logo=css3">
  <img src="https://img.shields.io/badge/sass-%23CC6699?style=for-the-badge&logo=sass&logoColor=white">
  <img src="https://img.shields.io/badge/vite-%235468FF.svg?style=for-the-badge&logo=vite&logoColor=white">
</div>

## About
Suroi is an open-source 2D battle royale game inspired by [surviv.io](https://survivio.fandom.com/wiki/Surviv.io_Wiki). It is currently a work in progress.

## Play the game!
[suroi.io](https://suroi.io)

## Donate!
Any amount helps! All donation money goes towards the game directly.

[ko-fi.com/suroi](https://ko-fi.com/suroi)

## Join the Discord!
[discord.suroi.io](https://discord.suroi.io)

## Installation and setup
Start by installing [Node.js](https://nodejs.org). If you're running macOS or Linux, [nvm](https://github.com/nvm-sh/nvm) is recommended for ease of installation.

Once Node is installed, pnpm can be installed using the following command:
```sh
npm i -g pnpm
```
Alternatively, pnpm can be installed from [the official website](https://pnpm.io).


Next, install [Git](https://git-scm.com/), and use the following command to clone the repo:
```sh
git clone https://github.com/HasangerGames/suroi.git
```
You can also [click here to download the repo](https://github.com/HasangerGames/suroi/archive/refs/heads/master.zip) and extract the files.

If you used Git, enter the newly created `suroi` directory with this command:
```sh
cd suroi
```

Finally, run this command in the project root to install dependencies:
```sh
pnpm install
```

## Development
To start the game locally, run the following command in the project root:

```sh
pnpm dev
```
Or, to see output from the server and client separately, you can use the `pnpm dev:server` and `pnpm dev:client` commands. (Both must be running simultaneously for the game to work.)

To open the game, go to http://127.0.0.1:3000 in your browser.

## Production
To build for production, run this command in the project root:
```sh
pnpm build
```
The server and client can be built separately using the `pnpm build:server` and `pnpm build:client` commands.

To start the game server, run this command:
```sh
pnpm start
```

Production builds are served using [NGINX](https://nginx.org). Visit [the wiki](https://github.com/HasangerGames/suroi/wiki/Self%E2%80%90hosting) for details on how to self-host.
