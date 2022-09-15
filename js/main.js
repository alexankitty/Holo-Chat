let styleOverride;
let is_fired = false;
let holdStart = null;
let holdTime = null;
const settingStore = new APIStorageObject("settings");
const override = new APIStorageObject("override");
const cached = new APIStorageObject("msgCache");
const cacheExpiry = new APIStorageObject("cacheExpiry");
const settingsForm = document.getElementById("settings");
const ClientIDField = document.getElementById("ClientID");
const ClientSecretField = document.getElementById("ClientSecret");
const overrideField = document.getElementById("override");
const ChannelField = document.getElementById("channel");
const pfpField = document.getElementById("pfp");
const badgeField = document.getElementById("badge")
const pfpCircleField = document.getElementById("pfpcircle")
const sfbField = document.getElementById("sfb");
const msgTimeOutField = document.getElementById("msgTimeout");
const msgLimitField = document.getElementById("msgLimit");
const cacheTTLField = document.getElementById("cacheTTL");
const textSizeField = document.getElementById("textsize");
const bgColorField = document.getElementById("bgcolor");
const bgOpacityField = document.getElementById("bgopacity");
const fontNameField = document.getElementById("fontname")
const fontWeightField = document.getElementById("fontweight");
const googleFontField = document.getElementById("googlefont")
const bttvField = document.getElementById("bttv");
const ffzField = document.getElementById("ffz");
const sevenTvField = document.getElementById("7tv");


function importYML(){
    let files = document.getElementById('file').files;
    if (files.length == 0) return;
    const file = files[0];

    let reader = new FileReader();
    
    reader.onload = (e) => {
        const file = e.target.result;
        try{
            settings = jsYaml.load(file);
            console.log(settings)
            settingStore.value = jsYaml.dump(settings);
            location.reload();
            }
            catch(e){
                console.error(`${e} / Invalid YML data uploaded.`)
                return;
            }
    }
    reader.onerror = (e) => alert(e.target.error.name);
    
    reader.readAsText(file)
}

function exportYML() {
    const settingExport = jsYaml.dump(settings);
    const blob = new Blob([settingExport], {type: 'text/plain'});
    // pass a useful mime type here
    const url = URL.createObjectURL(blob);
    fetch(url)
    .then((res) => { return res.blob(); })
    .then((data) => {
    let a = document.createElement("a");
    a.href = window.URL.createObjectURL(data);
    a.download = "settings.yaml";
    a.click();
    a.remove();
});
}

function loadSettings() {
    restoreDataTypes();
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

    //fonts
    if(settings.options.googleFont){
        WebFont.load({
            google: {
                families: [`${settings.options.fontName}:${settings.options.fontWeight}`]
            }
        })
    }

    styleOverride=document.createElement('style');//customized CSS based on above options
    styleOverride.innerHTML=`
    html,body{
        font-family: '${settings.options.fontName}';
    }
    .message-emote{
      height: ${parseInt(settings.options.txtSize) + 5}px;
    }
    #chatlog {
      ${settings.options.startFromBottom ? "bottom:" : "top:"} 0;
    }
    .pfp{
        height: ${parseInt(settings.options.txtSize) + 5}px;
    }
    .badge{
        height: ${parseInt(settings.options.txtSize) + 5}px;
    }
    `;
    
    const css = getComputedStyle(document.documentElement);
    settings.options.messageFadeOutDelay = settings.options.messageTimeout;
    settings.options.messageFadeOutDuration = css_time_to_milliseconds(getComputedStyle(document.documentElement).getPropertyValue('--fade-out-duration'))
    const bodyBg = document.getElementById("background");
    document.body.style.fontSize = `${settings.options.txtSize}px`
    bodyBg.style.backgroundColor = settings.options.bgColor;
    bodyBg.style.opacity = settings.options.bgOpacity;
    if(settings.options.cacheTTL){
        if(cached.value){
            readCache();
        }
    }
    cacheExpiry.valueAsDate = settings.options.cacheTTL;//Update the cache time at read time. Mitigation to allow for cache deletion
    

}

function restoreDataTypes() {
    //local storage stringifies everything
    //restore bools
    settings.options.pfp = parseBool(settings.options.pfp);
    settings.options.badge = parseBool(settings.options.badge);
    settings.options.pfpCircle = parseBool(settings.options.pfpCircle);
    settings.options.startFromBottom = parseBool(settings.options.startFromBottom);
    settings.options.googleFont = parseBool(settings.options.googleFont);
    settings.options.bttv = parseBool(settings.options.bttv);
    settings.options.ffz = parseBool(settings.options.ffz);
    settings.options.seventv = parseBool(settings.options.seventv);
    settings.options.firstRun = parseBool(settings.options.firstRun);
    //restore Ints
    settings.options.txtSize = parseInt(settings.options.txtSize);
    settings.options.messageTimeout = parseInt(settings.options.messageTimeout);
    settings.options.messageLimit = parseInt(settings.options.messageLimit);
    settings.options.cacheTTL = parseInt(settings.options.cacheTTL);
    settings.options.fontWeight = parseInt(settings.options.fontWeight);
}

function parseBool(string) {
    if(typeof(string) === "boolean") return string;
    if(string === "true"){
        return true;
    }
    return false;
}

function populateSettings(){
    if(settings.options.firstRun){
        showSettings();
    }
    ClientIDField.value = settings.api.ClientID;
    ClientSecretField.value = settings.api.ClientSecret;
    if(override.value == "true") {
        overrideField.checked = true;
    }
    ChannelField.value = settings.tmi.channel;
    pfpField.checked = settings.options.pfp;
    badgeField.checked = settings.options.badge;
    pfpCircleField.checked = settings.options.pfpCircle;
    sfbField.checked = settings.options.startFromBottom;
    msgTimeOutField.value = settings.options.messageTimeout;
    msgLimitField.value = settings.options.messageLimit;
    cacheTTLField.value = settings.options.cacheTTL;
    textSizeField.value = settings.options.txtSize;
    bgColorField.value = settings.options.bgColor;
    bgOpacityField.value = settings.options.bgOpacity;
    fontNameField.value = settings.options.fontName;
    fontWeightField.value = settings.options.fontWeight;
    googleFontField.checked = settings.options.googleFont;
    bttvField.checked = settings.options.bttv;
    ffzField.checked = settings.options.ffz;
    sevenTvField.checked = settings.options.seventv;
}

function saveSettings() {
    if(ClientIDField.value == ''){
        settings.api.ClientID = null;
    }
    else{
        settings.api.ClientID = ClientIDField.value;
    }
    settings.api.ClientSecret = ClientSecretField.value;
    settings.tmi.channel = ChannelField.value;
    override.value = overrideField.checked;
    settings.options.pfp = pfpField.checked;
    settings.options.badge = badgeField.checked;
    settings.options.pfpCircle = pfpCircleField.checked;
    settings.options.startFromBottom = sfbField.checked;
    settings.options.messageTimeout = msgTimeOutField.value;
    settings.options.messageLimit = msgLimitField.value;
    settings.options.cacheTTL = cacheTTLField.value;
    settings.options.txtSize = textSizeField.value;
    settings.options.bgColor =  bgColorField.value;
    settings.options.bgOpacity = bgOpacityField.value;
    settings.options.fontName = fontNameField.value;
    settings.options.fontWeight = fontWeightField.value;
    settings.options.googleFont = googleFontField.checked;
    settings.options.bttv = bttvField.checked;
    settings.options.ffz = ffzField.checked;
    settings.options.seventv = sevenTvField.checked;
    settings.options.firstRun = false;
    settingStore.value = jsYaml.dump(settings);
    hideSettings();
    location.reload();//might be unnecessary in the future
}

async function hideSettings(){
    is_fired = false;
    settingsForm.classList.add("settingsHide");
    await sleep(500);
    settingsForm.style.display = "none";
}

async function showSettings() {
    settingsForm.style.display = "initial" 
    await sleep(100);
    settingsForm.classList.remove("settingsHide");
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
    populateSettings();
    const client = new tmi.Client(tmiOpts)
    // Register event handlers:
    client.on('message', onMessageHandler)
    client.on('connected', onConnectedHandler)
    // Connect to Twitch:
    client.connect().catch(onConnectErrorHandler)
    addEventListener("keydown", function(e){
        if (e.key === 'Enter' && is_fired == false) {
            showSettings();
            is_fired = true
        }
    });

    cacheWatchDog();
}



main();