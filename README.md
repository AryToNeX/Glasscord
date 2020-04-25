# ![Glasscord](images/glasscord_banner.png)
Providing composition effects to the Discord client.

[![ko-fi](https://www.ko-fi.com/img/donate_sm.png)](https://ko-fi.com/K3K3D0E0)
[![patreon](https://c5.patreon.com/external/logo/become_a_patron_button.png)](https://patreon.com/arytonex)

[Chat with us on our Discord support server!](https://discord.gg/SftnByN)

[![Chat with us on Discord](https://discordapp.com/api/guilds/696696149301657640/embed.png)](https://discord.gg/SftnByN)

![Preview](images/preview.png)

### What is it?
Glasscord is a really simple tool that enables window composition effects (transparency and frosted glass effects) on Discord.

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

- First of all, you need to download and install a CSS loader of your choice.
  We can recommend (and we've tested) those client mods/CSS loaders:
  - [BandagedBD](https://github.com/rauenzi/BetterDiscordApp)
  - [BeautifulDiscord](https://github.com/leovoel/BeautifulDiscord)
  - [EnhancedDiscord](https://github.com/joe27g/EnhancedDiscord)

  Keep in mind that Glasscord may work with other CSS loaders and client mods too.
  
  After you installed the CSS loader properly, you can continue following this guide.
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

If you want to just try Glasscord, you can load the `discord_example.theme.css` (which is in the `extras` folder of the repository for you to download).

Please refer to your CSS loader's documentation to know how to load CSS stylesheets.

## Is it compatible with _[name of random Discord plugin loader here]_?
If installed properly, Glasscord won't interfere with any modern plugin loaders.
In fact, I tested it with EnhancedDiscord and BandagedBD and it works flawlessly!

## Hey buddy, I am a theme creator; how should I support Glasscord in my own themes?
Glasscord will look for some CSS properties defined in the `:root` CSS selector.
Please take a look at the `glasscord_example.theme.css` file to better understand how they are used.

Here's a straightforward CSS properties explaination. Let's go through them one by one; shall we?

### `--glasscord-win-blur` (Windows)
#### accepts a value between those ones: `acrylic`, `blurbehind`, `transparent`; defaults to `acrylic`
Sets the blur type on Windows.
- `acrylic` refers to the strong blur used in Microsoft's Fluent Design. Note: it can be slow when dragging/resizing on some Windows versions.
- `blurbehind` is a weaker blur than the other one, and it kinda resembles the good old Aero Glass effect.
- `transparent` means no blur at all, so the window is just transparent.

### `--glasscord-win-performance-mode` (Windows)
#### accepts a `bool`; defaults to `true`
If you're using `acrylic` as the blur type used on Windows, setting this property will use the `blurbehind` blur type
when you're resizing or moving a window.

This is lame, but since some Windows versions are affected by an annoying bug causing a slowdown upon resizing/moving the Discord window,
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

## Third party licenses

### [ewc: Native window composition on Windows for Electron apps.](https://github.com/23phy/ewc)

```
MIT License

Copyright (c) 2018 Oliver Cristian

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
