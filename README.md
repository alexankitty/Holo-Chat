# twitch-chatbox-bot

Simple HTML page that can be used to display Twitch chat with customizable options

## Usage with OBS Studio

### Basic Configuration
![Settings GUI for adjusting configs](https://user-images.githubusercontent.com/45508320/190004583-7dc964a9-2547-46f2-aab2-5e172a346459.png)
1. Create an application at https://dev.twitch.tv/console (optional: if you don't do this it will run in legacy mode which does not support pfp and emote platforms)
![Add OBS Source](https://github.com/alexankitty/twitch-chatbox-bot/blob/main/docs/obs%20source.png?raw=true)
2. Add an OBS source and size it to your liking (might want to adjust it large first) and point it to https://alexankitty.github.io/twitch-chatbox-bot/ChatboxBot.html#CHANNELNAME (channelname is optional.)
![Interact wit hthe source for settings](https://github.com/alexankitty/twitch-chatbox-bot/blob/main/docs/interact.png?raw=true)
3. Right click the source, click interact.
4. Input ClientID and Secrets into the GUI (or settings.yaml if using that)
5. Change the rest of the parameters to your liking

## Advanced Configuration
![YAML Config](https://github.com/alexankitty/twitch-chatbox-bot/blob/main/docs/configfile.png?raw=true)
Create a settings.yaml in the root directory you're hosting the files from. Use something like light-server in nodejs. a settings.yaml being present will initially override the GUI settings, if you want the GUI instead, make sure to check Override YAML.

## Configuration Explanation
* pfp: Shows twitch users profile pictures.
* badge: Show channel badges in chat.
* txtSize: sets the text size and emote size.
* pfpCircle: Displays profile pictures as circles instead of squares.
* bgColor: Sets the background color of the chat.
* bgOpacity: Sets the alpha of the background color.
* startFromBottom: Makes chat fill in from the bottom instead of the top.
* messageTimeout: Autoremoves messages after a set period of time in ms and plays an animation on removal.
* bttv, ffz, seventv: enables specific emote platforms.

## Thanks

* TMI.JS: https://github.com/tmijs/tmi.js
* tmi-emote-parse https://github.com/smilefx/tmi-emote-parse
* steve1337 for the code this is based on https://github.com/steve1337/twitch-chatbox-bot

## Known Issues
1. Getting channel badges anonymously is not supported by Twitch API and implemented with a hack
## OBS Guide (deprecated instructions, see above.)
1. Download ChatboxBot.html
1. Change the channel name and customize anything else you want to change
 ![Change the channel name and customize anything else you want to change](https://raw.githubusercontent.com/steve1337/twitch-chatbox-bot/main/docs/change-channel-name.png)
1. Add browser source for local file and select the customized ChatboxBot.html
 ![Add browser source for local file and select the customized ChatboxBot.html](https://raw.githubusercontent.com/steve1337/twitch-chatbox-bot/main/docs/add-browser-source.png)
1. Done :)

## New Features
* Additional configuration options
* BTTV, FFZ, and 7TV emote support in addition to the standard twitch emotes.
* Profile picture display.
* Caching to restore chat when changing browser sources/persistence.
* Animations
* Settings GUI


