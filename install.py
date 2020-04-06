import platform
from glob import glob
from os.path import expanduser, isfile
from os import rename, remove
from urllib import request
import json

needs_ewc = False

print("locating Discord install location...")
# Get full home path
home_dir = expanduser("~")
try:
    # Search for discord install within correct subdirectory
    if platform.system() == "Linux":
        core_dir = glob(home_dir + "/.config/discord/*/modules/discord_desktop_core")
    elif platform.system() == "Darwin":
        core_dir = glob(home_dir + "/Library/Application Support/discord/*/modules/discord_desktop_core")
    elif platform.system() == "Windows":
        core_dir = glob(home_dir + "/AppData/Roaming/discord/*/modules/discord_desktop_core")
        needs_ewc = True
    # Sets to most recent version
    core_dir = core_dir[len(core_dir)-1] + "/"
except IndexError:
    print("ERROR: Discord is not installed where expected based on your OS")
    exit()

# Patches index.js to load glasscord before electron
try:
    index_contents = open(core_dir + "index.js","r").readlines()
    if index_contents[0].strip() != "require('./glasscord.js');":
        print("patching index.js...")
        index_contents.insert(0, "require('./glasscord.js');\n")
        remove(core_dir + "index.js")
        with open(core_dir + "index.js","w") as f:
            for i in index_contents:
                f.write(i)
    else:
        print("index.js is already patched!")
except FileNotFoundError:
    print("ERROR: Discord is not fully installed at the path " + core_dir)

# Downloads main glasscord file
print("downloading glasscord.js from GitHub...")
request.urlretrieve("https://raw.githubusercontent.com/AryToNeX/Glasscord/master/glasscord.js", core_dir + "glasscord.js")
# Downloads ewc.asar for Windows compatibility
if needs_ewc:
    print("downloading ewc.asar for Windows compatibility...")
    request.urlretrieve("https://github.com/AryToNeX/Glasscord/raw/master/ewc.asar", core_dir + "ewc.asar")

print("detecting EnhancedDiscord...")
# Gets EnhancedDiscord installation directory
ed_dir = index_contents[1].strip()[22:-2] + "/"
if not isfile(ed_dir + "config.json"):
    print("ERROR: EnhancedDiscord is not installed")
    exit()

# Downloads default css to ED directory
print("downloading glasscord default theme from GitHub...")
request.urlretrieve("https://raw.githubusercontent.com/AryToNeX/Glasscord/master/glasscord_example_theme.css", ed_dir + "glasscord.css")

# Downloads new css loader plugin
print("downloading patched css loader from GitHub...")
request.urlretrieve("https://raw.githubusercontent.com/AryToNeX/Glasscord/master/glass_css_loader.js", ed_dir + "plugins/glass_css_loader.js")

# Disables default css loader and sets path for new one
print("changing theme in to glasscord default...")
ed_config = json.load(open(ed_dir + "config.json", "r"))
ed_config["css_loader"]["enabled"] = False
ed_config["glass_css_loader"] = {"path": "glasscord.css"}
with open(ed_dir + "config.json", "w") as f:
    json.dump(ed_config, f)
