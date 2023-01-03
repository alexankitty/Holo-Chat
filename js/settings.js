const settingsPath = "settings.yaml";
const settingsWindow = document.getElementById("settings");
const settingsForm = document.getElementById("settingsForm");
const settingStore = new APIStorageObject("settings");
const override = new APIStorageObject("override");
const cached = new APIStorageObject("msgCache");
const locale = new APIStorageObject("locale");
const cacheExpiry = new APIStorageObject("cacheExpiry");
let commonBotList = [];
let settings; //this needs to be a global
const defaults = {//defaults if YML is trashed or settings are trashed.
  api: {
    ClientID: '',
    ClientSecret: '',
    channel: '',
    blackListCommonBots: false,
    blackList: [],
    override: true,
    twitchBadge: true,
    youtubeBadge: true,
    ytEnable: false,
    ytChannel: "YouTube Channel/ID",
    ytWs: "http://127.0.0.1:8081",
    forward: false
  },
  options: {
    pfp: true,
    badge: true,
    pfpCircle: true,
    startFromBottom: true
  },
  messages: {
    messageTimeout: 0,
    messageLimit: 0,
    cacheTTL: 3600
  },
  emotes: {
    reloadTimer: 300,
    bttv: true,
    ffz: true,
    seventv: true
  },
  appearance: {
    txtSize: 25,
    lineHeight: 15,
    bgColor: 'black',
    bgOpacity: '0.5',
    fontName: 'Roboto',
    fontWeight: 700,
    googleFont: true
  },
  firstRun: true,
  lang: 'en_us'
}

function validate(value, type) {
  switch(type) {
    case "boolean":
      return parseBool(value);
    case "number":
      return parseInt(value);
    case "object":
      if(value === null) break;
      if(Array.isArray(value)) return value;
      if(typeof value === "string") return value.split(/[\r\n\s,]/).filter(Boolean);
      return value;
    default:
      return value;
  }
}

async function fetchSettings(path) {
    if(override.value == "false" || override.value == null){
        try{
        let response = await fetch(path);
        if(response.ok) {
            override.value = false;
            let text = await response.text();
            yaml = await jsYaml.load(text);
            console.log("yaml loaded");
        }
        else{
            override.value = true; //we're going to assume that subsequent loads shouldn't attempt to use the YAML.
        }
      }
      catch(e){
        //continue in localstorage mode as we can't use a setting.yaml under file:/// protocol
        override.value = true;
      }
    }
    //Validate the settings
    if(override.value == "true") {
      yaml = await jsYaml.load(settingStore.value);
    }
    try{
      for(key in defaults){
        if(typeof key !== 'object') {
          if(typeof yaml[key] === 'undefined') {
            yaml[key] = defaults[key];
            console.log(`${key} in is invalid. Loading default.`)
            override.value = true;//if the yml is invalid we do not want to use it.
          }
          yaml[key] = validate(yaml[key], typeof defaults[key]);
        }
        for(properties in defaults[key]){
            if(typeof yaml[key][properties] === 'undefined') {
              yaml[key][properties] = defaults[key][properties];
              console.log(`${properties} in ${key} is invalid. Loading default.`)
              override.value = true;
            }
            yaml[key][properties] = validate(yaml[key][properties], typeof defaults[key][properties]);//Check if the key is valid and enforce the type in defaults.
          }
        }
      }
    catch(e){
      console.error(`${e}\nYAML is invalid.`)
      override.value = true;
      yaml = defaults;
      settingStore.value = jsYaml.dump(yaml);//store and override to ensure it continues to work.
    }
    window.yamlTemp = yaml;//hack to enable deletion
    for(key in window.yamlTemp){//remove settings no longer used
      if(typeof key !== 'object'){
        if(typeof defaults[key] === 'undefined'){
          delete window.yamlTemp[key];
        }
        for(properties in window.yamlTemp[key]){
          if(typeof defaults[key][properties] === 'undefined'){
            delete window.yamlTemp[key][properties];
          }
        }
      }
    }
    yaml = window.yamlTemp;//merge it back into the original variable
    delete window.yamlTemp;//cleanup
    yaml.api.override = parseBool(override.value);
    console.log("local settings loaded");
    return yaml;
}

function parseBool(string) {
  if(typeof(string) === "boolean") return string;
  if(string === "true"){
      return true;
  }
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

async function loadSettings() {
  if(settings.api.ClientID !== null || settings.api.ClientID === ""){
      API.ClientID = settings.api.ClientID;
      API.ClientSecret = settings.api.ClientSecret;
      settings.options.apiDisable = false;
  }
  if(settings.api.ClientID == null || settings.api.ClientID === ""){
      settings.options.apiDisable = true;
  }
  const hash = window.location.hash
  if(hash) {
  tmiOpts.channels[0] = hash;
  }
  else{
      tmiOpts.channels[0] = settings.api.channel;
  }

  //fonts
  if(settings.appearance.googleFont){
      WebFont.load({
          google: {
              families: [`${settings.appearance.fontName}:${settings.appearance.fontWeight}`]
          }
      })
  }

  styleOverride=document.createElement('style');//customized CSS based on above options
  styleOverride.innerHTML=`
  html,body{
      font-family: '${settings.appearance.fontName}';
  }
  #chatlog>div {
    margin-top: ${settings.appearance.txtSize / 5}px;
    padding-bottom: ${settings.appearance.txtSize / 5}px;
  }
  .message-emote{
    height: ${settings.appearance.txtSize + 12}px;
    margin-left: ${settings.appearance.txtSize / 5}px;
    margin-right: ${settings.appearance.txtSize / 5}px;
  }
  #chatlog {
    bottom: 0;
    ${settings.options.startFromBottom ? "" : "height: 100%;"}
  }
  .pfp{
      height: ${settings.appearance.txtSize + 5}px;
      border-radius: ${settings.options.pfpCircle ? "50%" : "0"};
  }
  .badge{
      height: ${settings.appearance.txtSize + 5}px;
  }
  `;
  
  const css = getComputedStyle(document.documentElement);
  settings.messages.messageFadeOutDuration = css_time_to_milliseconds(getComputedStyle(document.documentElement).getPropertyValue('--fade-out-duration'))
  const bodyBg = document.getElementById("background");
  document.body.style.fontSize = `${settings.appearance.txtSize}px`
  bodyBg.style.backgroundColor = settings.appearance.bgColor;
  bodyBg.style.opacity = settings.appearance.bgOpacity;
  if(settings.messages.cacheTTL){
      if(cached.value){
          readCache();
      }
  }
  cacheExpiry.valueAsDate = settings.messages.cacheTTL;//Update the cache time at read time. Mitigation to allow for cache deletion
  if(settings.api.blackListCommonBots){
    commonBotList = await fetch('https://raw.githubusercontent.com/MrEliasen/twitch-bot-list/master/whitelist.json').then((r) => {return r.json()})
  }
  if(settings.firstRun){//make sure we get the language sorted before displaying it.
    clientLang = window.navigator.language.replace("-", "_")//convert to a format that JS can tolerate
    let langAvailable = false;
    for(keys in lang) {
      if(clientLang === keys){
        langAvailable = true;
      }
    }
    if(langAvailable){
      settings.lang = clientLang;
    }
  }
  buildSettings();
  if(settings.firstRun){
    showSettings();
  }
}

function saveSettings() {
  settings.firstRun = false;
  for(key in settings){
    for(properties in settings[key]){
        try{
        let input = document.getElementById(properties);
        settings[key][properties] = input.value
        if(input.type === 'checkbox') {
          settings[key][properties] = input.checked;
        }
        }
        catch{
          continue;
        }
      }
    }
  override.value = settings.api.override; //copy override back to local storage
  settingStore.value = jsYaml.dump(settings);
  hideSettings();
  location.reload();//might be unnecessary in the future
}

async function hideSettings(){
  is_fired = false;
  settingsWindow.classList.add("settingsHide");
  await sleep(500);
  settingsWindow.style.display = "none";
}

async function showSettings() {
  settingsWindow.style.display = "initial" 
  await sleep(100);
  settingsWindow.classList.remove("settingsHide");
}

function createSettingsInput(id, key, value, text, parent, secret = false) {
  wrap = typeof(value) !== "boolean" ? document.createElement('div') : document.createElement('span');
  label = document.createElement('label');
  label.setAttribute('for', id);
  label.innerText = text;
  input = document.createElement('input');
  input.setAttribute('for', id);
  input.id = id;
  input.setAttribute('key', key);
  switch(typeof(value)){
    case 'boolean':
      input.setAttribute('type', 'checkbox')
      if(value) {
        input.checked = true;
      }
      break;
    case 'number':
      input.setAttribute('type', 'number');
      input.classList.add("textInput");
      break;
    case 'object':
      if(!value) break;
      input = document.createElement("textarea");
      input.cols = 20;
      input.rows = 3;
      input.setAttribute('for', id);
      input.id = id;
      input.setAttribute('key', key);
      value = value.toString();
      break;
    default:
      input.setAttribute('type', 'text');
      input.classList.add("textInput");
      if(secret) input.setAttribute('type', 'password');
      break;
  }
  input.value = value;
  parentNode = document.getElementById(parent)
  parentNode.appendChild(wrap);
  wrap.appendChild(label);
  wrap.appendChild(input);
}

function createSettingsHeader(headerName, headerID, tooltipText){
  settingsForm.appendChild(document.createElement('hr'));
  tooltipWrapper = document.createElement('div');
  tooltipWrapper.classList.add("tooltip");
  header = document.createElement('p');
  header.innerText = headerName;
  tooltip = document.createElement('span');
  tooltip.classList.add("tooltiptext");
  tooltip.innerText = tooltipText;
  settingsForm.appendChild(tooltipWrapper);
  tooltipWrapper.appendChild(header);
  tooltipWrapper.appendChild(tooltip);
  settingsForm.appendChild(document.createElement('hr'));
  childWrap = document.createElement('div')
  childWrap.id = headerID;
  settingsForm.appendChild(childWrap);
}

function createSettingsDropDown(id, key, arrayValues, arrayText, currentSetting, text, parent) {
  wrap = document.createElement('div');
  label = document.createElement('label');
  label.setAttribute('for', id);
  label.innerText = text;
  select = document.createElement('select');
  select.setAttribute('for', id);
  select.id = id;
  select.setAttribute('key', key)
  parentNode = document.getElementById(parent)
  parentNode.appendChild(wrap);
  wrap.appendChild(label);
  wrap.appendChild(select);
  for(let i = 0; i < arrayValues.length; i++){
    option = document.createElement('option');
    option.setAttribute('value', arrayValues[i]);
    option.innerText = arrayText[i];
    select.appendChild(option);
  }
  select.value = currentSetting;
}

function buildSettings() {
  let strings = lang[settings.lang]
  for(key in defaults){
    if(typeof strings.headers[key] === 'undefined') continue;
    createSettingsHeader(strings.headers[key], key, strings.tooltips[key])
    for(property in defaults[key]){
      if(typeof strings.labels[property] === 'undefined') continue;
      let secret = false;
      if(property === 'ClientSecret') secret = true;
      createSettingsInput(property, key, settings[key][property], strings.labels[property], key, secret)
    }
  }
  let langArr = Object.keys(lang)
  let langNameArr = new Array;
  for(let i = 0; i < langArr.length; i++){
    langNameArr.push(lang[langArr[i]].localeName)
  }
  createSettingsDropDown("lang", "lang", langArr, langNameArr, settings.lang, strings.labels['lang'], 'api');
  let importSection = document.getElementById("imports");
  importSection.innerText = strings.headers.imports;
}