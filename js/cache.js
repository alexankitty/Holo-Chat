async function saveCache() {
    if(!settings.messages.cacheTTL) return;
    const chatlogNode = document.querySelector("#chatlog")
    cached.value = chatlogNode.innerHTML;
    cacheExpiry.valueAsDate = settings.messages.cacheTTL;
}

async function readCache() {
    var d = new Date();
    if(cacheExpiry.value >= d.getTime()){
        chatlogNode.innerHTML = cached.value;
    }
}

async function cacheWatchDog() {
    var d = new Date();
    if(cacheExpiry.value < d.getTime()){
        cached.value = '';
        cacheExpiry.value = 0;
    }
    setTimeout(cacheWatchDog, 60000);//check once a minute if cache invalidation needs to occur.
}