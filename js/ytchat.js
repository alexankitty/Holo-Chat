let params;
let chatSocket;

function ytMessageHandler(message) {
    if(message.data == 'Connected') {
        console.log(message.data);
        return;
    }
    switch(message.data){
        case "400":
            console.log("Bad request: Live stream may be unavailable, attempting to retry.")
            return;
        case "401":
            console.log("Malformed data received by server.")
            chatSocket.close();
            return;
        case "410":
            console.log("Live chat ended, stopping");
            chatSocket.close();
            return;
        case "503":
            console.log("Too many connections, closing");
            chatSocket.close();
            return;
    }
    const parsedMsg = JSON.parse(message.data.toString());//I don't want to know why this has to be moved to a string even though it's already a string.
    const author = parsedMsg.author;
    const messageArr = parsedMsg.message;//this is wrapped not sure why
    const messageObj = parseYtEmotes(messageArr);
    if(messageObj.repeat) {
        return; //Message already exists from forwarding, exit function.
    }
    let pfp = false;
    let badge = false;
    let highlight = false;
    if(author.thumbnail) {
        pfp = author.thumbnail.url;
    }
    if(author.badge) {
        badge = author.badge.thumbnail.url;
    }
    if(parsedMsg.superchat) {
        highlight = true;
    }
    buildMessage(author.name, messageObj, pfp, badge, highlight)
}



    

function startChat(params) {
    chatSocket.send(JSON.stringify(params));
}

function setupYtChat(channel, wsLoc, forwardChannel) {
    const channelName = channel;//Either the channel ID, ChannelName or the live stream id. There is some logic to determine which. 
    chatSocket = new WebSocket(wsLoc)
    const forward = forwardChannel
    params = {channelName: channelName, forward: forward}
    chatSocket.onmessage = ytMessageHandler;
    chatSocket.onopen = function() {
        startChat(params)
    }
    chatSocket.addEventListener("close", () => {
		console.log("Failed to connect to server, retrying in 10 seconds");
		setTimeout(setupYtChat, 10000, channel, wsLoc, forwardChannel);
	});
}

function buildMessage(authorName, message, pfpUrl, badges, highlight) {
    console.log(badges)
    let highlighted = highlight || false;
    let badgeAvailable = badges || false;
    let pfp = pfpUrl || false;
    const chatBlacklist = settings.api.blackList.concat(commonBotList);
    for(let i = 0; i < chatBlacklist.length; i++){
        if(authorName.toLowerCase() === chatBlacklist[i].toLowerCase()){
            return;
        }
    }
    const messageNode = msgTemplate.content.cloneNode(true);

    if(highlighted) {
        messageNode.firstElementChild.classList.add("priority")
    }

    const nameNode = messageNode.querySelector(".name")

    if(settings.options.pfp && !settings.options.apiDisable && pfp) {
        const pfpImg = document.createElement("img");
        pfpImg.className = 'pfp';
        if(settings.options.pfpCircle){
        pfpImg.style.borderRadius = "50%";
        }
        pfpImg.src = pfpUrl;
        nameNode.appendChild(pfpImg);
    }
    const nameSpan = document.createElement('span');
    nameSpan.innerHTML += authorName;
    nameSpan.classList.add("username");
    nameNode.appendChild(nameSpan);
    nameNode.style.color = namecolors[authorName.charCodeAt(authorName.length - 1) % namecolors.length];
    const badgesNode = messageNode.querySelector(".badges");
    if(settings.api.youtubeBadge){
        //create youtube specific badge.
        const ytImg = document.createElement("img");
        ytImg.className = "badge";
        ytImg.src = "png/youtube.png";
        badgesNode.appendChild(ytImg);
    }  
    if(settings.options.badge && badgeAvailable){
        const badgeImg = document.createElement("img");
        badgeImg.src = badges;
        badgesNode.appendChild(badgeImg)
    }
    let messageNodeClass = messageNode.querySelector(".message")
    messageNodeClass.appendChild(message);
    chatlogNode.appendChild(messageNode)

    // Remove message after fade out animation
    msgTimeout = settings.messages.messageTimeout * 1000;
    if(msgTimeout){
        setTimeout(async () => {
        try{
            removeMessage(chatlogNode.firstElementChild)
        }
        catch{
            //do nothing: message is already gone.
        }
        }, msgTimeout)
    }
    // Remove message if exceeded
    if(settings.messages.messageLimit !== 0){
        if(chatlogNode.childElementCount > settings.messages.messageLimit){
            removeMessage(chatlogNode.firstElementChild)
        }
    }
    saveCache();
}

function parseYtEmotes(msg){
    const messageContent = document.createElement('span');
    if(typeof msg[0]['text'] !== 'undefined' && msg[0]['text'].startsWith("[Twitch]")) {
        messageContent.repeat = true;
        return messageContent; //Return empty 
    }
    for(let i = 0; i < msg.length; i++) {
        for(key in msg[i]) {
            if(key == 'text') {
                let msgPart = document.createElement('span');
                msgPart.innerText = msg[i][key]
                messageContent.appendChild(msgPart);
            }
            if(key == 'url') {
                let msgEmote = document.createElement('img');
                msgEmote.className = "emote"
                msgEmote.src = msg[i][key];
                messageContent.appendChild(msgEmote);
            }
        }
    }
    return messageContent;
}