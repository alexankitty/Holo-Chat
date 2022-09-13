# twitch-chatbox-bot

Simple HTML page that can be used to display Twitch chat

## Usage with OBS Studio

### Basic Configuration

1. Create an application at https://dev.twitch.tv/console
2. Place ClientID and Client Secrets in twitchapi.js line 34 and 36 (may need to be simplifed). This is used for tmi-parse-emotes and for pulling pfps from twitch
3. Customize opts in chat.js lines 1-16 to your liking.
4. Create a web browser source and either host on a nodejs server or point directly to the twitch-chatbox-bot.html file

## Configuration Explanation
pfp: Shows twitch users profile pictures.
badge: Show channel badges in chat.
txtSize: sets the text size and emote size.
pfpCircle: Displays profile pictures as circles instead of squares.
bgColor: Sets the background color of the chat.
bgOpacity: Sets the alpha of the background color.
startFromBottom: Makes chat fill in from the bottom instead of the top.
messageTimeout: Autoremoves messages after a set period of time in ms and plays an animation on removal.
bttv, ffz, seventv: enables specific emote platforms.

## Thanks

TMI.JS: https://github.com/tmijs/tmi.js
tmi-emote-parse https://github.com/smilefx/tmi-emote-parse

## Known Issues
1. Getting channel badges anonymously is not supported by Twitch API and implemented with a hack

## OBS Guide (deprecated instructions, see above.)
1. Download ChatboxBot.html
1. Change the channel name and customize anything else you want to change
 ![Change the channel name and customize anything else you want to change](https://raw.githubusercontent.com/steve1337/twitch-chatbox-bot/main/docs/change-channel-name.png)
1. Add browser source for local file and select the customized ChatboxBot.html
 ![Add browser source for local file and select the customized ChatboxBot.html](https://raw.githubusercontent.com/steve1337/twitch-chatbox-bot/main/docs/add-browser-source.png)
1. Done :)
