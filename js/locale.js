const lang = {
    en_us: {
        headers: {
            api: "API Settings",
            options: "Options",
            messages: "Message Handling",
            appearance: "Appearance Settings",
            emotes: "Emote Platforms",
            imports: "Import/Export",
        },
        tooltips: {
            api: `Client ID and Secret enable usage of the API for PFP and additional emotes
                Channel name tells tmi.js which channel to view chat for.
                Override YAML disables settings.yaml if it's present in favor of local settings.`,
            options: `Controls chat behaviors. If API isn't filled out, profile picture and emote platforms are ignored.`,
            messages: `Controls behaviors regarding message removal and caching. Set to 0 to disable features.`,
            appearance: `Controls apperances by modifying CSS. You can set it to a font installed on your computer, or a google font.`,
            emotes: `Enables emote platforms in addition to the twitch vanilla emotes. This is disabled if API settings aren't filled out.`,
            config: `Import or export a YAML settings file.`,
        },
        labels: {
            ClientID: "Client ID:",
            ClientSecret: "Client Secret:",
            channel: "Channel Name:",
            blackList: "Blacklist:",
            blackListCommonBots: "Blacklist Common Bots:",
            override: "Override YAML:",
            pfp: "Profile Pictures:",
            badge: "Badges:",
            pfpCircle: "Circle PFPs:",
            startFromBottom: "Start From Bottom:",
            messageTimeout: "Message Timeout (s):",
            messageLimit: "Message Limit:",
            cacheTTL: "Cache Expiration (s):",
            bttv: "BTTV:",
            ffz: "FFZ:",
            seventv: "7TV:",
            txtSize: "Text Size (px):",
            lineHeight: "Line Height (px):",
            bgColor: "Background Color:",
            bgOpacity: "Background Opacity:",
            fontName: "Font Name:",
            fontWeight: "Font Style #:",
            googleFont: "Google Fonts:",
            lang: "Language:"
        },
        localeName: "English (United States)"
    }
}
