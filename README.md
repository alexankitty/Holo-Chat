# Holo-Chat formerly twitch-chatbox-bot

Simple HTML page that can be used to display Twitch chat with customizable options all self contained.  
PS: The name is a portmanteau of holodeck and chat. This project has changed a ton from its original fork that I felt a rename was necessary.

## Usage with OBS Studio

### Basic Configuration
![Settings GUI for adjusting configs](https://github.com/alexankitty/twitch-chatbox-bot/blob/main/docs/settingsgui.png?raw=true)
1. Create an application at https://dev.twitch.tv/console (optional: if you don't do this it will run in legacy mode which does not support pfp and emote platforms)
![Add OBS Source](https://github.com/alexankitty/twitch-chatbox-bot/blob/main/docs/obs%20source.png?raw=true)
2. Add an OBS source and size it to your liking (might want to adjust it large first) and point it to https://alexankitty.github.io/Holo-Chat/Holo-Chat.html (If you want to make use of youtube chat, you will instead need to clone this repo and then serve it with something like light-server from nodejs. I would recommend this method anyway if you run a lot of overlays. Otherwise if you don't, the websocket will fail to connect because you can't connect from a secure https page to an insecure ws socket.)

![Interact with the source for settings](https://github.com/alexankitty/twitch-chatbox-bot/blob/main/docs/interact.png?raw=true)

3. Right click the source, click interact.
4. Input ClientID and Secrets into the GUI (or settings.yaml if using that)
5. Change the rest of the parameters to your liking

## Modifications
1. Interact with the source.
2. Click the window.
3. Press Enter and the settings GUI will pull up. Pressing Save or Cancel will close it.

## Advanced Configuration
![YAML Config](https://github.com/alexankitty/twitch-chatbox-bot/blob/main/docs/configfile.png?raw=true)
Create a settings.yaml in the root directory you're hosting the files from. Use something like light-server in nodejs. a settings.yaml being present will initially override the GUI settings, if you want the GUI instead, make sure to check Override YAML.

## Setting Up YouTube Chat
Note: Due to the way that youtube handles chatting and how expensive querying their API is, realtime requires a websocket and some scraping which may or may not be a TOS issue; you've been warned.  
1. Clone my [Youtube-WS-Chat-Wrapper](https://github.com/alexankitty/Youtube-WS-Chat-Wrapper) project.
2. Follow the directions in the repo for setting up. Dependencies will need to be installed. You will need NodeJS.
3. In holo-chat, set up the new sections under API to your liking.
4. For websocket make sure it's set to the IP where the server is being hosted (this defaults to ws://127.0.0.1:8081)
5. Put in the channel handle (This is expensive so IDs are preferred, but the server will also save IDs that have already been looked up to conserve quota) or ID that it will be listening to.
6. Create a google cloud project, and acquire a twitch oauth token (for forwarding messages). More on this in the chat wrapper repo.

## Configuration Explanation
* Tooltips now give a brief overview of what the settings do
* Client ID/Secret: used to authenticate with twitch API.
* Channel Name: Controls which channel tmi.js is watching.
* Override YAML: Disable settings.yaml in favor of the local storage.
* Profile Picture: Display twitch user profile pictures.
* Badges: Display twitch user channel badges.
* Circle PFPs: Display profile pictures as circles instead of squares.
* Start From Bottom: Make chat fill from the bottom instead of top.
* Message timeout: Automatically remove messages after x amount of milliseconds.
* Message Limit: Automatically remove a message after x amount have been received. (Recommend combining this with Cache Expiration)
* Cache Expiration: Grace period to restore chat messages to the page when refreshing. (Useful for settings changes and browser source reloads)
* Text Size: Sets the size of text, and emotes(=5px)
* Background Color: Sets the color of the background layer.
* Background Opacity: Sets the background opacity of the page, set to 0 for transparent.
* Font Name: Sets the chat font to any font installed on your system.
* Font Style #: If using google fonts, this sets the font style to what's on https://fonts.google.com
* Google Fonts: Enable the usage of google fonts (this may make the page load a little slower and the font to pop in once it's loaded)
* Emote Platforms: Controls where emotes can be pulled from in addition to the twitch vanilla emotes.
* Import/Export: Allows you to export your settings as a yaml and import them later or modify them by hand.

## Thanks

* TMI.JS: https://github.com/tmijs/tmi.js
* tmi-emote-parse https://github.com/smilefx/tmi-emote-parse
* steve1337 for the code this is based on https://github.com/steve1337/twitch-chatbox-bot
* js-yaml https://github.com/nodeca/js-yaml
* Twitch Bot List https://github.com/MrEliasen/twitch-bot-list

## Known Issues
1. Randomly fails CORS requests, but unsure as to why. Implementing additional error handling.
2. Twitch badges are b0rked. Need to figure out how to get them now that the legacy badges endpoint is 死 。

## New Features
* Additional configuration options
* BTTV, FFZ, and 7TV emote support in addition to the standard twitch emotes.
* Profile picture display.
* Caching to restore chat when changing browser sources/persistence.
* Animations
* Settings GUI
* Standalone mode support. Download the release or clone the repo and point OBS to the html file if you prefer.
* Automatically remove messages when deleted, or a user is banned or timed out.
* /clear will wipe out chat
* Message Highlighting
* Support for localization (If you want to help, everything is in locale.js, make a PR to get your changes pulled in)
* Blacklisting Support, along with hiding chat from common bots.
* Support for youtube chat via websocket.


## To Do
* Abstract message builder from chatMessage Handler for reusability.
* Implement additional customizations.

## Donation
If my project has helped you out, consider buying me a coffee.  
[Paypal](https://paypal.me/alexankitty?country.x=US&locale.x=en_US)
