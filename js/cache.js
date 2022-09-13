let cached;
let cacheExpiry;

async function saveCache() {
    if(!settings.options.cacheTTL) return;
    const chatlogNode = document.querySelector("#chatlog")
    cached.value = chatlogNode.innerHTML;
    cacheExpiry.valueAsDate = settings.options.cacheTTL;
    console.log("cache saved")
}

async function readCache() {
    var d = new Date();
    if(cacheExpiry.value >= d.getTime()){
        chatlogNode.innerHTML = cached.value;
    }
}