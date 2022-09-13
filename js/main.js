let styleOverride;

function loadSettings() {
    if(settings.api.ClientID !== null){
        API.ClientID = settings.api.ClientID;
        API.ClientSecret = settings.api.ClientSecret;
        settings.options.apiDisable = false;
    }
    if(settings.api.ClientID == null){
        settings.options.apiDisable = true;
    }
    const hash = window.location.hash
    if(hash) {
    tmiOpts.channels[0] = hash;
    }
    else{
        tmiOpts.channels[0] = settings.tmi.channel;
    }
    styleOverride=document.createElement('style');//customized CSS based on above options
    styleOverride.innerHTML=`.message-emote{
      height: ${settings.options.txtSize + 5}px;
    }
    #chatlog {
      ${settings.options.startFromBottom ? "bottom:" : "top:"} 0;
    }`;
    
    const css = getComputedStyle(document.documentElement);
    settings.options.messageFadeOutDelay = settings.options.messageTimeout;
    settings.options.messageFadeOutDuration = css_time_to_milliseconds(getComputedStyle(document.documentElement).getPropertyValue('--fade-out-duration'))
    const bodyBg = document.getElementById("background");
    document.body.style.fontSize = `${settings.options.txtSize}px`
    bodyBg.style.backgroundColor = settings.options.bgColor;
    bodyBg.style.opacity = settings.options.bgOpacity;
    if(settings.options.cacheTTL){
        cached = new APIStorageObject("msgCache");
        cacheExpiry = new APIStorageObject("cacheExpiry");
        if(cached.value){
            readCache();
        }
    }
}



async function main() {
    settings = await fetchSettings(settingsPath);
    loadSettings();
    document.body.appendChild(styleOverride);
    if(!settings.options.apiDisable){//disable the API if it's not present.
        API.authorize();
        tmiEmoteParse.setTwitchCredentials(API.ClientID, API.Token.value)
        tmiEmoteParse.loadAssets(tmiOpts.channels[0], {"bttv": settings.options.bttv, "ffz": settings.options.ffz, "7tv": settings.options.seventv})
    }
    const client = new tmi.Client(tmiOpts)
    // Register event handlers:
    client.on('message', onMessageHandler)
    client.on('connected', onConnectedHandler)
    // Connect to Twitch:
    client.connect().catch(onConnectErrorHandler)
}



main();