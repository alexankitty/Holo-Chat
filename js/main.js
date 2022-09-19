let styleOverride;
let is_fired = false;
let holdStart = null;
let holdTime = null;
let client;
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


function colorNameToHex(color) {
    var colours = {
        "aliceblue":"#f0f8ff", "antiquewhite":"#faebd7", "aqua":"#00ffff", "aquamarine":"#7fffd4", "azure":"#f0ffff",  "beige":"#f5f5dc", "bisque":"#ffe4c4", "black":"#000000", "blanchedalmond":"#ffebcd", "blue":"#0000ff", "blueviolet":"#8a2be2", "brown":"#a52a2a", "burlywood":"#deb887",  "cadetblue":"#5f9ea0", "chartreuse":"#7fff00", "chocolate":"#d2691e", "coral":"#ff7f50", "cornflowerblue":"#6495ed", "cornsilk":"#fff8dc", "crimson":"#dc143c", "cyan":"#00ffff",  "darkblue":"#00008b", "darkcyan":"#008b8b", "darkgoldenrod":"#b8860b", "darkgray":"#a9a9a9", "darkgreen":"#006400", "darkkhaki":"#bdb76b", "darkmagenta":"#8b008b", "darkolivegreen":"#556b2f",  "darkorange":"#ff8c00", "darkorchid":"#9932cc", "darkred":"#8b0000", "darksalmon":"#e9967a", "darkseagreen":"#8fbc8f", "darkslateblue":"#483d8b", "darkslategray":"#2f4f4f", "darkturquoise":"#00ced1",  "darkviolet":"#9400d3", "deeppink":"#ff1493", "deepskyblue":"#00bfff", "dimgray":"#696969", "dodgerblue":"#1e90ff",  "firebrick":"#b22222", "floralwhite":"#fffaf0", "forestgreen":"#228b22", "fuchsia":"#ff00ff",  "gainsboro":"#dcdcdc", "ghostwhite":"#f8f8ff", "gold":"#ffd700", "goldenrod":"#daa520", "gray":"#808080", "green":"#008000", "greenyellow":"#adff2f",
        "honeydew":"#f0fff0", "hotpink":"#ff69b4", "indianred ":"#cd5c5c", "indigo":"#4b0082", "ivory":"#fffff0", "khaki":"#f0e68c",  "lavender":"#e6e6fa", "lavenderblush":"#fff0f5", "lawngreen":"#7cfc00", "lemonchiffon":"#fffacd", "lightblue":"#add8e6", "lightcoral":"#f08080", "lightcyan":"#e0ffff", "lightgoldenrodyellow":"#fafad2",  "lightgrey":"#d3d3d3", "lightgreen":"#90ee90", "lightpink":"#ffb6c1", "lightsalmon":"#ffa07a", "lightseagreen":"#20b2aa", "lightskyblue":"#87cefa", "lightslategray":"#778899", "lightsteelblue":"#b0c4de",  "lightyellow":"#ffffe0", "lime":"#00ff00", "limegreen":"#32cd32", "linen":"#faf0e6",  "magenta":"#ff00ff", "maroon":"#800000", "mediumaquamarine":"#66cdaa", "mediumblue":"#0000cd", "mediumorchid":"#ba55d3", "mediumpurple":"#9370d8", "mediumseagreen":"#3cb371", "mediumslateblue":"#7b68ee",        "mediumspringgreen":"#00fa9a", "mediumturquoise":"#48d1cc", "mediumvioletred":"#c71585", "midnightblue":"#191970", "mintcream":"#f5fffa", "mistyrose":"#ffe4e1", "moccasin":"#ffe4b5", "navajowhite":"#ffdead", "navy":"#000080",  "oldlace":"#fdf5e6", "olive":"#808000", "olivedrab":"#6b8e23", "orange":"#ffa500", "orangered":"#ff4500", "orchid":"#da70d6",  "palegoldenrod":"#eee8aa",
        "palegreen":"#98fb98", "paleturquoise":"#afeeee", "palevioletred":"#d87093", "papayawhip":"#ffefd5", "peachpuff":"#ffdab9", "peru":"#cd853f", "pink":"#ffc0cb", "plum":"#dda0dd", "powderblue":"#b0e0e6", "purple":"#800080",  "rebeccapurple":"#663399", "red":"#ff0000", "rosybrown":"#bc8f8f", "royalblue":"#4169e1",  "saddlebrown":"#8b4513", "salmon":"#fa8072", "sandybrown":"#f4a460", "seagreen":"#2e8b57", "seashell":"#fff5ee", "sienna":"#a0522d", "silver":"#c0c0c0", "skyblue":"#87ceeb", "slateblue":"#6a5acd", "slategray":"#708090", "snow":"#fffafa", "springgreen":"#00ff7f", "steelblue":"#4682b4",   "tan":"#d2b48c", "teal":"#008080", "thistle":"#d8bfd8", "tomato":"#ff6347", "turquoise":"#40e0d0", "violet":"#ee82ee",   "wheat":"#f5deb3", "white":"#ffffff", "whitesmoke":"#f5f5f5", "yellow":"#ffff00", "yellowgreen":"#9acd32"
    };
          
    if (typeof colours[color.toLowerCase()] != 'undefined')
        return colours[color.toLowerCase()];
    return false;
}

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
      height: ${parseInt(settings.options.txtSize) + 12}px;
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

async function setHighlightColor() {
    let apiReturn = await API.queryUserChatColor(tmiOpts.channels[0].slice(1));
    let color = apiReturn['color'];
    if(color[0] !== "#"){
        color = colorNameToHex(color);
    }
    color += '7f'
    styleOverride.innerHTML += `.priority {
        background-color: ${color};
    }`
}

async function tmiEmoteParseSetup() {
    await tmiEmoteParse.setTwitchCredentials(API.ClientID, API.Token.value)
    await tmiEmoteParse.loadAssets(tmiOpts.channels[0], {"bttv": settings.options.bttv, "ffz": settings.options.ffz, "7tv": settings.options.seventv})
    setHighlightColor();
    document.body.appendChild(styleOverride);
}

async function main() {
    settings = await fetchSettings(settingsPath);
    loadSettings();
    if(!settings.options.apiDisable){//disable the API if it's not present.
        TwitchAPIEvents.on('authorize', tmiEmoteParseSetup)
        API.authorize();
    }
    populateSettings();
     client = new tmi.Client(tmiOpts)
    // Register event handlers:
    client.on('message', onMessageHandler)
    client.on('connected', onConnectedHandler)
    client.on('messagedeleted', onMessageDeleteHandler)
    client.on('timeout', onTimeout)
    client.on('ban', onBan)
    client.on('clearchat', onClear)
    
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