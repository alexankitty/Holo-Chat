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
      const onMessageHandler = async(channel, context, msg, self) => {

        const messageNode = msgTemplate.content.cloneNode(true)
        /*
        * PFP (Requires API access in TwitchAPI.js)
        */
        const displayname = context["display-name"]
        const nameNode = messageNode.querySelector(".name")
        if(settings.options.pfp && !settings.options.apiDisable) {
          const pfpImg = document.createElement("img");
          pfpImg.style.height = `${settings.options.txtSize + 5}px`;
          pfpImg.className = 'pfp';
          if(settings.options.pfpCircle){
            pfpImg.style.borderRadius = "50%";
          }
          pfpImg.src = await getPFP(displayname);
          nameNode.appendChild(pfpImg);
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
        if (badgeSetsChannel === null)
          fetch(`https://badges.twitch.tv/v1/badges/channels/${context['room-id']}/display`)
            .then(res => res.json())
            .then(json => badgeSetsChannel = json.badge_sets)
        for (const badge in badges) {
          try {
            // Prepare badge stuff
            const badgeVersion = badges[badge]
            let urls = badgeSetsGlobal[badge].versions[badgeVersion]
            if (!urls) urls = badgeSetsChannel[badge].versions[badgeVersion]
            // Add badge to message
            const badgeImg = document.createElement("img")
            badgeImg.className = "badge"
            badgeImg.src = urls.image_url_1x
            badgesNode.appendChild(badgeImg)
          } catch (error) {
            console.error('Failed to ADD badge', badge, 'to message', msg, '! Error:', error)
          }
        }
      }

        /*
        * EMOTES
        */
        let messageNodeClass = messageNode.querySelector(".message")
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
        if(settings.options.messageTimeout){
          setTimeout(async () => {
            chatlogNode.firstElementChild.classList.add("delete")
            await sleep(settings.options.messageFadeOutDuration)
            chatlogNode.firstElementChild.remove();
          }, settings.options.messageTimeout)
        }
        // Remove message if exceeded
        if(settings.options.messageLimit !== 0){
          if(chatlogNode.childElementCount > settings.options.messageLimit){
            chatlogNode.firstElementChild.classList.add("delete")
            await sleep(settings.options.messageFadeOutDuration)
            chatlogNode.firstElementChild.remove();
          }
      }
      saveCache();
      }
