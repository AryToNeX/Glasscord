# ![Glasscord](images/glasscord_banner.svg)
Providing composition effects to Electron applications.

[![ko-fi](https://www.ko-fi.com/img/donate_sm.png)](https://ko-fi.com/K3K3D0E0)
[![patreon](https://c5.patreon.com/external/logo/become_a_patron_button.png)](https://patreon.com/arytonex)

[Chat with us on our Discord support server!](https://discord.gg/SftnByN)

[![Chat with us on Discord](https://discordapp.com/api/guilds/696696149301657640/embed.png)](https://discord.gg/SftnByN)

![Glasscord + Discord](images/preview_discord.png)
![Glasscord + VSCode](images/preview_vscode.png)

### What is it?
Glasscord is a really simple tool based on [Glasstron](https://github.com/AryToNeX/Glasstron)
that enables window composition effects (transparency and frosted glass effects) on Electron apps,
such as Discord and Visual Studio Code; however it can work with *almost any* Electron app.

It is compatible with Windows, Linux and macOS.

More functionalities are achievable by extending Glasscord with modules.
You can find more on [the Glasscord-Modules repo](https://github.com/AryToNeX/Glasscord-Modules).

### So, is it a theme?
Glasscord is NOT a theme. It's a tool that enables themes to request composition effects.

To put it in other, more simple words, you will need a theme that uses Glasscord's "CSS API" to be able to see it in action.

### But why?
I was bored and I made an early proof of concept to post on [r/unixporn](https://www.reddit.com/r/unixporn/comments/fu0bqh/kde_stop_blurry_discord/).
It seemed that a few people liked the idea, so I made that into an actual tool for themers.

_TL;DR: Help me I have no purpose in this life anymore_

## How do I install it?
Well, glad you asked!

- Look in the Releases section for the latest released version of Glasscord. Download the `glasscord.asar` file from there.
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

*You need to name it exactly like this. Glasscord will search for that specific filename in order to make your application start*.

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

#### Notes for Discord

You can use a third party CSS loader to load Discord themes.
If that's the case, please install it FIRST, then install Glasscord AFTER you completed the other installation.
This MAY BREAK the ability of the third party CSS loader to auto-update itself, so be warned!

## How do I USE it?
Assuming you already installed everything correctly, you will need to load a custom CSS theme which supports Glasscord.

If you want to just try Glasscord on Discord, you can load the `discord_example.theme.css` (which is in
the `extras` folder of the repository for you to download).

If you're using a third-party CSS loader, please refer to your CSS loader's documentation to know how to load CSS stylesheets.

If you're using Glasscord's own CSS loader, you can configure it easily by editing the configuration files in:
- Windows: `%appdata%/glasscord`;
- Linux: `~/.config/glasscord`; this may vary if you installed Glasscord on a Snap/Flatpak package.
- macOS: `~/Library/Application Support/glasscord`.

## Is it compatible with _[name of random Electron app here]_?
Try it for yourself and let us know!

## Hey buddy, I am a theme creator; how should I support Glasscord in my own themes?
Glasscord will look for some CSS properties defined in the `:root` CSS selector.
Please take a look at the `discord_example.theme.css` file to better understand how they are used.

Here's a straightforward CSS properties explaination. Let's go through them one by one; shall we?

### `--glasscord-win-blur` (Windows)
#### accepts a value between those ones: `acrylic`, `blurbehind`, `transparent`; defaults to `acrylic`
Sets the blur type on Windows.
- `acrylic` refers to the strong blur used in Microsoft's Fluent Design. Note: it can be slow when
dragging/resizing on some Windows versions.
- `blurbehind` is a weaker blur than the other one, and it kinda resembles the good old Aero Glass effect.
- `transparent` means no blur at all, so the window is just transparent..

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
Tells the window compositor whether to blur behind windows or not.

**Note:** Check the Glasstron project to see which window servers/managers are compatible

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
