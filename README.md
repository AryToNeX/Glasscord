# ![Glasscord](images/glasscord_banner.png)
Providing composition effects to Electron applications.

[![ko-fi](https://www.ko-fi.com/img/donate_sm.png)](https://ko-fi.com/K3K3D0E0)
[![patreon](https://c5.patreon.com/external/logo/become_a_patron_button.png)](https://patreon.com/arytonex)

[Chat with us on our Discord support server!](https://discord.gg/SftnByN)

[![Chat with us on Discord](https://discordapp.com/api/guilds/696696149301657640/embed.png)](https://discord.gg/SftnByN)

![Glasscord + Discord](images/preview_discord.png)
![Glasscord + VSCode](images/preview_vscode.png)

### What is it?
Glasscord is a really simple tool that enables window composition effects (transparency and frosted glass effects) on Electron apps,
such as Discord and Visual Studio Code; however it can be expanded to work with *almost any* Electron app.

It is compatible with Windows, Linux and macOS.

### So, is it a theme?
Glasscord is NOT a theme. It's a tool that enables themes to request composition effects.

To put it in other, more simple words, you will need a theme that supports Glasscord to be able to see it in action.

### But why?
I was bored and I made an early proof of concept to post on [r/unixporn](https://www.reddit.com/r/unixporn/comments/fu0bqh/kde_stop_blurry_discord/).
It seemed that a few people liked the idea, so I made that into an actual tool for themers.

_TL;DR: Help me I have no purpose in this life anymore_

## How do I install it?
Well, glad you asked!

### Visual Studio Code (+ potentially any other Electron app) instructions

- ~~Look in the Releases section for the latest released version of Glasscord. Download the `glasscord.asar` file from there.~~
  **VSCODE+ SUPPORT IS STILL UNDER HEAVY DEVELOPMENT -- NO RELEASES ARE PLANNED! YOU MUST PACKAGE YOUR OWN `glasscord.asar` TO USE IT**
- Locate your Electron app installation folder. We will assume it being the root directory from now on.
- Locate the `resources` folder. Inside it you'll likely have an `app.asar` file OR an `app` folder.

#### Case 1: you have an `app.asar` file
- Create an `app` folder.
- Now you need to get the `package.json` file from the `app.asar` file.
  The best and quickest way to extract it via the `asar` command line tool.
  
  If you don't have it, install it via `sudo npm install -g --engine-strict asar`.
  
  Run this script where the `app.asar` file is:
  ```
  asar ef app.asar package.json
  ```
- Place your newly extracted `package.json` inside the `app` folder.

#### Case 2: you already have an `app` folder
- Make a duplicate copy of the `package.json` file and name it `package.original.json`.

#### Finishing up
- Place your `glasscord.asar` file inside the `app` folder.
- Now, your target `package.json` should be extracted. Modify it so that its `main` property points to `./glasscord.asar`.
  ```json
  {
    [...]
      "main": "./glasscord.asar",
    [...]
  }
  ```
- If everything was done correctly, the Electron app should start and Glasscord should be injected.


### Discord instructions

- First of all, you need to download and install a CSS loader of your choice.
  We can recommend (and we've tested) those client mods/CSS loaders:
  - [BandagedBD](https://github.com/rauenzi/BetterDiscordApp)
  - [BeautifulDiscord](https://github.com/leovoel/BeautifulDiscord)
  - [EnhancedDiscord](https://github.com/joe27g/EnhancedDiscord)

  Keep in mind that Glasscord may work with other CSS loaders and client mods too.
  
  After you installed the CSS loader properly, you can continue following this guide.
  
  **Note:** Glasscord's own CSS loader was forcefully disabled on Discord to avoid conflicts with other client mods.
- Look in the Releases section for the latest released version of Glasscord. Download the `glasscord.asar` file from there.
- Locate your Discord Desktop Core module folder. In the respective file paths, `x.x.x` corresponds to the version number.
  - On Windows, it is `%AppData%\discord\x.x.x\modules\discord_desktop_core\`
  - On macOS, it is `~/Library/Application Support/discord/x.x.x/modules/discord_desktop_core/`
  - On Linux we must make distinction between three main cases:
    - If you installed Discord via .tar.gz, .deb or the AUR on Arch/Manjaro, it is `$HOME/.config/discord/x.x.x/modules/discord_desktop_core/`
    - If you installed it via Snap package, it is `$HOME/snap/discord/current/.config/discord/x.x.x/modules/discord_desktop_core/`
    - If you installed it via Flatpak, it is `$HOME/.var/app/com.discordapp.Discord/config/discord/x.x.x/modules/discord_desktop_core/`

    Everything said here assumes that you're using the stable release.
    If you are using Public Test Beta (`discordptb`) or Canary (`discordcanary`), please look for the according configuration path.
    Also, please note that if you installed Discord via Snap/Flatpak, the blur behind effect will most likely fail to load
    (that's because the `xprop` tool is not available to the app container).
- Put the `glasscord.asar` file inside that folder.
- If you are on Linux, you should make sure that you have the `xprop` package installed.
- Edit the `index.js` file which was already in that folder.
  
  The text inside that file
  ```js
  // THE TEXT BELOW IS JUST AN EXAMPLE OF WHAT CAN BE INSIDE THE INDEX.JS FILE -- DO NOT COPY
  module.exports = require('your other awesome mods or the core.asar from Discord');
  ```
  should become
  ```js
  require('./glasscord.asar');
  // THE TEXT BELOW IS JUST AN EXAMPLE OF WHAT CAN BE INSIDE THE INDEX.JS FILE -- DO NOT COPY
  module.exports = require('your other awesome mods or the core.asar from Discord');
  ```
  so you really have to write `require('./glasscord.asar');` at the **absolute beginning** of that file.
- **If you forgot to install a CSS loader and you've noticed it now because of this sentence written in bold, please do it and then repeat the previous step!**
- You can now start Discord and Glasscord would be running!
  Please read the paragraph below to know more about how to use this tool.

## How do I USE it?
Assuming you already installed everything correctly, you will need to load a custom CSS theme which supports Glasscord.

If you want to just try Glasscord on Discord, you can load the `discord_example.theme.css` (which is in the `extras` folder of the repository for you to download).

If you're using a third-party CSS loader, please refer to your CSS loader's documentation to know how to load CSS stylesheets.

If you're using Glasscord's own CSS loader, you can configure it easily by editing the `glasscord_config.json` file which sits right where `glasscord.asar` is:
```json
{
  "modules": {
    "CSSLoader": {
      "enabled": true,
      "config": {
        "cssPath": "/path/to/your.css"
      }
    }
  }
}
```

## Is it compatible with _[name of random Discord plugin loader here]_?
If installed properly, Glasscord won't interfere with any modern plugin loaders.
In fact, I tested it with EnhancedDiscord and BandagedBD and it works flawlessly!

## Is it compatible with _[name of random Electron app here]_?
Try it for yourself and let us know!

## Hey buddy, I am a theme creator; how should I support Glasscord in my own themes?
Glasscord will look for some CSS properties defined in the `:root` CSS selector.
Please take a look at the `glasscord_example.theme.css` file to better understand how they are used.

Here's a straightforward CSS properties explaination. Let's go through them one by one; shall we?

### `--glasscord-win-blur` (Windows)
#### accepts a value between those ones: `acrylic`, `blurbehind`, `transparent`; defaults to `acrylic`
Sets the blur type on Windows.
- `acrylic` refers to the strong blur used in Microsoft's Fluent Design. Note: it can be slow when
dragging/resizing on some Windows versions.
- `blurbehind` is a weaker blur than the other one, and it kinda resembles the good old Aero Glass effect.
- `transparent` means no blur at all, so the window is just transparent.

### `--glasscord-win-performance-mode` (Windows)
#### accepts a `bool`; defaults to `true`
If you're using `acrylic` as the blur type used on Windows, setting this property will use the `blurbehind` blur type
when you're resizing or moving a window.

This is lame, but since some Windows versions are affected by an annoying bug causing a slowdown upon
resizing/moving the Discord window,
there was really no other choice but to implement it.

Let's hope for Microsoft to fix this bug in upcoming Windows releases.

### `--glasscord-macos-vibrancy` (macOS)
#### accepts a value between those ones: `titlebar`, `selection`, `menu`, `popover`, `sidebar`, `header`, `sheet`, `window`, `hud`, `fullscreen-ui`, `tooltip`, `content`, `under-window`, `under-page`, `none`; defaults to `none`
Sets the vibrancy effects to be used with the Discord window.

If set to `none`, the vibrancy effect will not be applied but the window will be blurred anyway.

@Giovix92 did some testing for you guys, and he made this handy dandy chart to pick vibrancy effects

| Vibrancy mode                                 | Slight description                                           |
|-----------------------------------------------|--------------------------------------------------------------|
| fullscreen-ui, titlebar, menu, popover, sheet | Reference vibrancy, works in maximized and minimized windows |
| selection                                     | Has kind of a bright tint to it                              |
| hud                                           | The one with the most contrast and vibrancy                  |
| header                                        | It won't work in fullscreen, and it's slightly darker        |
| tooltip, sidebar                              | Darker than the reference vibrancy                           |
| under-window                                  | The darkest of them all                                      |
| under-page, window, content                   | Won't show any sign of blurring                              |

### `--glasscord-linux-blur` (Linux)
#### accepts a `bool`; defaults to `true`
Tells the window compositor whether to blur behind Discord or not.

**Note:** for this setting to work, you should be running an X session. Wayland support is not possible at this stage.
You should also be running a supported window compositor, and Glasscord currently only supports KWin.

You can still manually blur Discord's window via Compiz, Compton and similar compositors which support blurring windows manually.

### `--glasscord-titlebar` (Discord only - courtesy of [Zack senpai](https://github.com/rauenzi))
#### accepts a value between those ones: `native`, `windows`, `linux`, `osx`; defaults to `native`
Changes Discord's titlebar to the one specified.
- `native` is the default one for your platform.
- `windows` is the Windows-style titlebar (buttons on the right side, full titlebar)
- `osx` is the macOS-style hidden titlebar with the minimal semaphore-style window buttons on the left.
- `linux` is the Linux-style Discord titlebar, aka the native one of your system.
Linux didn't get any of the fancy titlebars Discord has, which is sad.

**Note:** for this setting to work, you should restart Discord after loading your custom CSS!
But don't worry, Glasscord will remind you of that.

#### Deprecated CSS variables
- `--glasscord-enable` was deprecated: it only really worked on Windows.
- `--glasscord-tint` was deprecated: it was basically a super buggy alias to `body { background-color: [...]; }`.

## I want to contribute to this madness!
Did you find a bug? File it in the issues section!
Do you know how to fix stuff? Make a pull request!
Or perhaps you want to send me a hug and a coffee? You can do so [here](https://ko-fi.com/arytonex)!

## License

### Glasscord is licensed under the Apache 2.0 License

```
Copyright 2020 AryToNeX

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
