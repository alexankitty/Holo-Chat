
    // Define configuration options
    const opts = {
        pfp: true,
        badge: true,
        txtSize: 25,//in px
        pfpCircle: true, //displays as square or circle
        bgColor: "black", //css colors or hex
        startFromBottom: true,
        bgOpacity: 0.5,
        messageTimeout: 0, //in milliseconds, set to 0 to disable
        //below are for extra emote platforms
        bttv: true,
        ffz: true,
        seventv: true
      }

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
      // Use Channel name from HASH
      const hash = window.location.hash
      if(hash) tmiOpts.channels[0] = hash

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

      var S=document.createElement('style');//customized CSS based on above options
      S.innerHTML=`.message-emote{
        height: ${opts.txtSize + 5}px;
        width: ${opts.txtSize + 5}px;
      }
      #chatlog {
        ${opts.startFromBottom ? "bottom:" : "top:"} 0;
      }`;
      const chatlogNode = document.querySelector("#chatlog")
      const msgTemplate = document.querySelector("#chatmessage")

      const css = getComputedStyle(document.documentElement);
      const messageFadeOutDelay = opts.messageTimeout;
      const messageFadeOutDuration = css_time_to_milliseconds(getComputedStyle(document.documentElement).getPropertyValue('--fade-out-duration'))

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
        if(opts.pfp) {
          const pfpImg = document.createElement("img");
          pfpImg.style.height = `${opts.txtSize + 5}px`;
          pfpImg.style.width  = `${opts.txtSize + 5}px`;
          pfpImg.className = 'pfp';
          if(opts.pfpCircle){
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
       if(opts.badge){
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
        let text = document.createElement('span');
        text.innerHTML = await tmiEmoteParse.replaceEmotes(msg, context, channel, self); //let tmiemoteparse do the heavy lifting instead.
        messageNodeClass.appendChild(text);
        // Add message
        chatlogNode.appendChild(messageNode)

        // Remove message after fade out animation
        if(messageFadeOutDelay){
          setTimeout(async () => {
            chatlogNode.firstElementChild.classList.add("delete")
            await sleep(messageFadeOutDuration)
            chatlogNode.firstElementChild.remove();
          }, messageFadeOutDelay)
        }
      }
      const bodyBg = document.getElementById("background");
      document.body.style.fontSize = `${opts.txtSize}px`
      bodyBg.style.backgroundColor = opts.bgColor;
      bodyBg.style.opacity = opts.bgOpacity;
      document.body.appendChild(S);
      API.authorize();
      tmiEmoteParse.setTwitchCredentials(API.ClientID, API.Token.value)
      tmiEmoteParse.loadAssets(tmiOpts.channels[0], {"bttv": opts.bttv, "ffz": opts.ffz, "7tv": opts.seventv})
      const client = new tmi.Client(tmiOpts)
      // Register event handlers:
      client.on('message', onMessageHandler)
      client.on('connected', onConnectedHandler)
      // Connect to Twitch:
      client.connect().catch(onConnectErrorHandler)