const settingsPath = "settings.yaml";
let settings; //this needs to be a global

async function fetchSettings(path) {
    let response = await fetch(path);
    if(response.ok) {
        let text = await response.text();
        let yaml = await jsYaml.load(text);
        return yaml;
    }
    else{
        //grab local storage instead. Load defaults if not set
        return;
    }
}

