      const tmiOpts = {
        options: {
        debug: false
      },
      connection: {
        reconnect: true,
        secure: true
      },
        /****************************************************
        *                                                   *
        *       Change this to your channel name            *
        *                                                   *
        *****************************************************/
        channels: ["YourChannel"]
      }
      /*
       * CSS Time to Milliseconds
       * by Jake Bellacera (http://jakebellacera.com)
       * ============================================
      */
      function css_time_to_milliseconds(time_string) {
        const num = parseFloat(time_string, 10)

        let unit = time_string.match(/m?s/)
        if (unit) unit = unit[0]

        switch (unit) {
          case "s": // seconds
            return num * 1000
          case "ms": // milliseconds
            return num
          default:
            return 0
        }
      }

      async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      const chatlogNode = document.querySelector("#chatlog")
      const msgTemplate = document.querySelector("#chatmessage")

      const namecolors = [
        "Blue",
        "Coral",
        "DodgerBlue",
        "SpringGreen",
        "YellowGreen",
        "Green",
        "OrangeRed",
        "Red",
        "GoldenRod",
        "HotPink",
        "CadetBlue",
        "SeaGreen",
        "Chocolate",
        "BlueViolet",
        "Firebrick"
      ]

      let badgeSetsChannel = null
      let badgeSetsGlobal = null
      fetch("https://badges.twitch.tv/v1/badges/global/display")
        .then(res => res.json())
        .then(json => badgeSetsGlobal = json.badge_sets)

      // TMI Handlers:
      const getPFP = (channel) => API.queryChannel(channel).then(data => {return data.profile_image_url})
      const onConnectedHandler = (host, port) => console.info(`Connected to ${host}:${port}`)
      const onConnectErrorHandler = error => chatlog.innerHTML = `Failed to connect! Error: ${error}`
      const onTimeout = async(channel, username, reason, duration, userstate) => {
        try{
        let msgList = chatlogNode.querySelectorAll(`div[userid='${userstate['target-user-id']}'`);
        for(let i = 0; i < msgList.length; i++){
          await removeMessage(msgList[i]);
        }
      }
      catch{
        //do nothing other than notify
        console.log(`Failed to delete all messages for ${userstate['target-user-id']}`)
      }
      }

      const onBan = async(channel, username, reason, userstate) => {
        try{
        let msgList = chatlogNode.querySelectorAll(`div[userid='${userstate['target-user-id']}'`);
        for(let i = 0; i < msgList.length; i++){
            await removeMessage(msgList[i]);
          }
        }
        catch{
          //do nothing other than notify
          console.log(`Failed to delete all messages for ${userstate['target-user-id']}`)
        }
      }

      const onMessageDeleteHandler = async(channel, username, deletedMessage, context) => {
        try{
          await removeMessage(document.getElementById(context['target-msg-id']));
        }
        catch{
          console.log(`Failed to remove message id ${context['target-msg-id']}`);
          //do nothing
        }
      }

      const onClear = async(channel) => {
        try{
        let allMessages = chatlogNode.getElementsByTagName('div');
        let length = allMessages.length; 
        for(let i = 0; i <= length; i++){
          await removeMessage(allMessages[0])
        }
      }
      catch{
        console.log("No messages to clear");
      }
      }

      const onMessageHandler = async(channel, context, msg, self) => {
        const displayname = context["display-name"]
        const chatBlacklist = settings.api.blackList.concat(commonBotList);
        for(let i = 0; i < chatBlacklist.length; i++){
          if(displayname.toLowerCase() === chatBlacklist[i].toLowerCase()){
            return;
          }
        }
        const messageNode = msgTemplate.content.cloneNode(true)
        //set the message ID
        messageNode.firstElementChild.setAttribute("id", `${context['id']}`);
        messageNode.firstElementChild.setAttribute("userid", context['user-id']);
        if(context['msg-id'] === "highlighted-message") messageNode.firstElementChild.classList.add("priority")
        /*
        * PFP (Requires API access in TwitchAPI.js)
        */
        const nameNode = messageNode.querySelector(".name")
        if(settings.options.pfp && !settings.options.apiDisable) {
          const pfpImg = document.createElement("img");
          pfpImg.className = 'pfp';
          if(settings.options.pfpCircle){
            pfpImg.style.borderRadius = "50%";
          }
          try{
          pfpImg.src = await getPFP(displayname);
          nameNode.appendChild(pfpImg);
          }
          catch{
            try{//retry just in case something silly happened
              pfpImg.src = await getPFP(displayname);
              nameNode.appendChild(pfpImg);
            }
            catch{
              console.error(`Failed to load PFP for ${context['display-name']} continuing on without one.`)
            }
          }
        }

        /*
        * USERNAME
        */
        
        nameNode.innerHTML += displayname
        if (context["color"] !== null) {
          nameNode.style.color = context["color"]
        } else {
          nameNode.style.color = namecolors[displayname.charCodeAt(displayname.length - 1) % namecolors.length]
        }


        /*
        * BADGES
        */
       if(settings.options.badge){
        const badgesNode = messageNode.querySelector(".badges")
        const badges = context["badges"]
        // HACK: get channel-id w/o AUTH (Thx Twitch API)
        if(settings.options.apiDisable){//Legacy handling for obtaining badges.
          if (badgeSetsChannel === null){
            await fetch(`https://badges.twitch.tv/v1/badges/channels/${context['room-id']}/display`)
              .then(res => res.json())
              .then(json => badgeSetsChannel = json.badge_sets)
          }

          for (const badge in badges) {
            try {
              // Prepare badge stuff
              const badgeVersion = badges[badge]
              let urls = badgeSetsGlobal[badge].versions[badgeVersion]
              if (!urls) urls = badgeSetsChannel[badge].versions[badgeVersion]
              // Add badge to message
              const badgeImg = document.createElement("img")
              badgeImg.className = "badge"
              badgeImg.src = urls.image_url_4x
              badgesNode.appendChild(badgeImg)
            } catch (error) {
              console.error('Failed to ADD badge', badge, 'to message', msg, '! Error:', error)
            }
          }
        }
        if(!settings.options.apiDisable){
          const badgeArr = tmiEmoteParse.getBadges(context, channel);
          for(i = 0; i < badgeArr.length; i++){
            const badgeImg = document.createElement("img")
            badgeImg.className = "badge";
            badgeImg.src = badgeArr[i]['img'];
            badgesNode.appendChild(badgeImg)
          }
        }
      }

        /*
        * EMOTES
        */
        let messageNodeClass = messageNode.querySelector(".message")
        if(context['message-type'] === 'action') messageNodeClass.classList.add('action');
        if(settings.options.apiDisable) {//legacy handling which disables pfp and extra emotes
          try { 
            let msgWithEmotes = msg.split(" ");
            let fragment = "";
            const emotes = context["emotes"]
             for(let i = 0; i < msgWithEmotes.length; i++) {
                let emoteChecked = false;
                for (const emote in emotes) {
                  const firstEmoteOccurance = emotes[emote][0].split("-")
                  const emoteString = msg.substring(parseInt(firstEmoteOccurance[0]), parseInt(firstEmoteOccurance[1]) + 1)
                  if(emoteString == msgWithEmotes[i]){
                    const emoteImgSrc = `https://static-cdn.jtvnw.net/emoticons/v2/${emote}/default/dark/1.0`
                    if(fragment !== ""){
                      let text = document.createElement('span');
                      text.innerText = fragment;
                      messageNodeClass.appendChild(text);
                      fragment = ""; //dump the text fragment because we need to append a new span
                    }
                    const emoteImg = `<img src="${emoteImgSrc}" alt="${emoteString}">`
                    const emoteSpan = document.createElement('span');
                    emoteSpan.className = "emote"
                    emoteSpan.innerHTML = emoteImg;
                    messageNodeClass.appendChild(emoteSpan);
                    emoteChecked = true;
                  }
                } 
              if(!emoteChecked){
                fragment += `${msgWithEmotes[i]} `
              }
              if(i == msgWithEmotes.length - 1) { // arrays start at 0
                let text = document.createElement('span');
                text.innerText = fragment;
                messageNodeClass.appendChild(text);
              }
            }
  
          } catch (error) {
            messageNodeClass.innerText = msg
          }
        }

        if(!settings.options.apiDisable){
          let text = document.createElement('span');
          text.innerHTML = await tmiEmoteParse.replaceEmotes(msg, context, channel, self); //let tmiemoteparse do the heavy lifting instead.
          messageNodeClass.appendChild(text);
        }
        // Add message
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

      async function removeMessage(messageObj){
        messageObj.classList.add("delete")
        await sleep(settings.messages.messageFadeOutDuration)
        messageObj.remove();
        saveCache();
      }