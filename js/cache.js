async function saveCache() {
    if(!settings.messages.cacheTTL) return;
    const chatlogNode = document.querySelector("#chatlog")
    cached.value = chatlogNode.innerHTML;
    cacheExpiry.valueAsDate = settings.messages.cacheTTL;
}

async function readCache() {
    if(cacheExpiry.value >= Date.now()){
        chatlogNode.innerHTML = cached.value;
    }
    else{
        cached.value = '';
    }
}

async function cacheWatchDog() {
    if(cacheExpiry.value < Date.now()){
        cached.value = '';
        cacheExpiry.value = 0;
    }
    setTimeout(cacheWatchDog, 60000);//check once a minute if cache invalidation needs to occur.
}