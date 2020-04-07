# Glasscord
Providing composition effects to the Discord client.

[Chat with us on our Discord support server!](https://discord.gg/SftnByN)

[![Chat with us on Discord](https://discordapp.com/api/guilds/696696149301657640/embed.png)](https://discord.gg/SftnByN)

![Preview](preview.png)

## What's it?
Glasscord is a really simple tool that enables window composition effects (transparency and frosted glass effects) on Discord.

It is compatible with Windows, Linux and macOS.

## So, is it a theme?
Glasscord is NOT a theme. It's a tool that enables themes to request composition effects.

To put it in other, more simple words, you will need a theme that supports Glasscord to be able to see it in action.

## But why?
I was bored and I made an early proof of concept to post on [r/unixporn](https://www.reddit.com/r/unixporn/comments/fu0bqh/kde_stop_blurry_discord/).
It seemed that a few people liked the idea, so I made that into an actual tool for themers.

_TL;DR: Help me I have no purpose in this life anymore_

## Is it compatible with _[name of random Discord plugin loader here]_?
If installed properly, Glasscord won't interfere with any modern plugin loaders.
In fact, I tested it with EnhancedDiscord and it works flawlessly!

**Note:** Someone reported that BetterDiscord installs are a little bit trickier to get working with Glasscord.
Please follow the instructions carefully and please install Glasscord AFTER installing BetterDiscord!

## How do I install it?
Well, glad you asked!

- Download this GitHub repository or look in the Releases section for stable releases to download.
  If you downloaded a zip file, extract it to have convenient access to its files.
- Locate your Discord Desktop Core module folder.
  - On Linux, it is `$HOME/.config/discord/x.x.x/modules/discord_desktop_core/`
  - On Windows, it is `%AppData%\discord\x.x.x\modules\discord_desktop_core\`
  - On macOS, it is `~/Library/Application Support/discord/x.x.x/modules/discord_desktop_core/`
- Put the `glasscord.js` file inside that folder.
- If you are on Windows, you should also put the `ewc.asar` file inside that folder.
- Edit the `index.js` file which was already in that folder.
  
  The text inside that file
  ```
  [bunch of random stuff if you have mods installed]
  module.exports = require('./core.asar');
  ```
  should become
  ```
  require('./glasscord.js');
  [bunch of random stuff if you have mods installed]
  module.exports = require('./core.asar');
  ```
  so you really have to write `require('./glasscord.js');` at the **absolute beginning** of that file.
- You can now start Discord and Glasscord would be running!

## How do I USE it?
Glasscord alone won't do anything to your Discord client. You WILL need a CSS loader at least to be able to use Glasscord.
Plus, you can choose which CSS loader to use; we're not reinventing the wheel here.

You then have to make or find a compatible theme to have the blur effect. If you are just trying stuff, you can load the `glasscord_example_theme.css` on your CSS loader of choice.

We recommend to install our modified CSS Loader for EnhancedDiscord, so please get it first, then override
the `css_loader.js` file on ED's plugins directory with the one on this repository!

> In case you're installing EnhancedDiscord for the first time, please repeat the steps involving `index.js`
> as it will be overwritten by ED's installer.

## Hey buddy I am a theme creator, how should I support Glasscord in my own themes?
Glasscord will look for some CSS properties defined in the `:root` CSS selector.
Please take a look at the `glasscord_example_theme.css` file to better understand how they are used.

Here's a straightforward CSS properties explaination. Let's go through them one by one; shall we?

### `--glasscord-enable`
#### accepts a `bool`; defaults to `false`
This is the global switch. Turn it off, and Glasscord is off too.

### `--glasscord-tint`
#### accepts a `color`; defaults to `#00000000` which is transparent
Global background color of the Discord window.

On Windows it's set via the compositor; it's set via Electron otherwise.

On 99% of cases, it will behave the same as if you included `body { background-color: color; }` on your CSS file.

Nobody is sure if this will prove useful later, but it's here anyway.

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
