const settingsPath = "settings.yaml";
let settings; //this needs to be a global
const defaultSettings = {
    api: {
    ClientID: null,
    ClientSecret: null
    },
  options: {
    pfp: true,
    badge: true,
    txtSize: 25,
    pfpCircle: true,
    bgColor: "black",
    startFromBottom: true,
    bgOpacity: 0.5,
    messageTimeout: 0,
    messageLimit: 0,
    cacheTTL: 3600,
    googleFont: true,
    fontName: 'Roboto',
    fontWeight: 700,
    bttv: true,
    ffz: true,
    seventv: true,
    firstRun: true
  },
  tmi: {
    channel: 'YourChannel'
  }
}

async function fetchSettings(path) {
    if(override.value == "false" || override.value == null){
        let response = await fetch(path);
        if(response.ok) {
            let text = await response.text();
            let yaml = await jsYaml.load(text);
            console.log("yaml loaded");
            return yaml;
        }
        else{
            override.value = "true"; //we're going to assume that subsequent loads shouldn't attempt to use the YAML.
        }
    }
    //grab local storage instead. Load defaults if not set
    if(settingStore.value == null || settingStore.value == 'undefined' || settingStore.value == '[object Object]'){
        //load defaults
        console.log("loading defaults")
        settings = defaultSettings;
        return settings;
    }
    let yaml = await jsYaml.load(settingStore.value)
    console.log("local settings loaded");
    return yaml;
}

