/**
* Returns a nick of a member. If none, returns user's username
* @param {Message} msg - Discord.js message object
* @return {string}
* */

exports.getNick = (msg) => {
  return msg.guild.member(msg.author).nickname ? msg.guild.member(
    msg.author).nickname : msg.author.username
}

/**
 * Returns an array of mentions (IDs only) from a message
 * @param {Message} msg - Discord.js message object
 * @returns {string[]}
 */

exports.getMentionNick = async (msg) => {
  const { USERS_PATTERN } = require(`discord.js`).MessageMentions
  const mentArr = []
  msg.content.match(USERS_PATTERN).forEach(
    mention => {
      if (mention.startsWith(`<@`) && mention.endsWith(`>`)) {
        mentArr.push(mention.slice(2, -1).replace(`!`, ``))
      }
    })

  const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  const aaaaa = async () => {
    const ret = []
    await asyncForEach(mentArr, async (id) => {
      const m = await msg.guild.members.fetch(id)
      ret.push(m.nickname ? m.nickname : m.user.username)
    })
    return ret
  }
  return aaaaa()
}

/**
 * Returns an array of names of channels mentioned in a message
 * @param {Message} msg - Discord.js message object
 * @param {Client} client - Discord.js client
 * @returns {string[]}
 */

exports.getChannelName = (msg, client) => {
  const { CHANNELS_PATTERN } = require(`discord.js`).MessageMentions
  const ret = []
  msg.content.match(CHANNELS_PATTERN).forEach(
    chann => {
      ret.push(client.channels.get(chann.slice(2, -1)).name)
    })
  return ret
}

/**
 * Sends a Discord Webhook
 * @param {Message} msg - Discord.js message object
 * @param {URL} [f] - File URL
 * @param {TelegramBot} bot - a node-telegram-bot-api instance
 * @param {Hook} hook - a HookCord webhook instance
 * @returns {Promise}
 */

exports.sendDCWebHook = (msg, f, bot, hook) => {
  const userName = () => {
    const uname = msg.from.username || ``
    const lname = msg.from.last_name || ``
    let ret
    if (uname) {
      ret = `${msg.from.first_name} (${uname})`
    } else if (uname && lname) {
      ret = `${msg.from.first_name} ${lname} (${uname})`
    } else if (uname === msg.from.first_name) {
      ret = `${uname}`
    }
    return ret
  }

  bot.getUserProfilePhotos(msg.from.id)
    .then(pfps => {
      try {
        return pfps.photos[0][0].file_id
      } catch (e) {
        return null
      }
    }).then(fID => {
      if (fID) {
        return bot.getFileLink(fID)
      } else {
        return ``
      }
    }).then(link => {
      if (f) {
        if (f.match(/\.(jpeg|jpg|gif|png|tif|webp|bmp|)$/) != null) {
          return hook.setPayload({
            username: userName(),
            avatar_url: link,
            embeds: [{
              title: msg.caption,
              image: {
                url: f
              },
              color: 0xffaaff
            }]
          }).fire().catch(e => console.log(e))
        } else {
          /* const request = require(`request`).defaults({ encoding: null })
          request(f, (err, resp, body) => {
            if (err) console.log(err)
            const data = `data:` + resp.headers[`content-type`] + `;base64,` + Buffer.from(body).toString('base64')
            return hook.setPayload({
              username: userName(),
              avatar_url: link,
              file: data
            }).fire().catch(e => console.log(e))
          }) */
          // TODO: Make it somehow work. No idea how to send files tho... It accepts "File"s
          // as a type, but what the heck is that
        }
      } else {
        return hook.setPayload({
          username: userName(),
          avatar_url: link,
          content: msg.text
        }).fire().catch(e => console.log(e))
      }
    })
}

/**
 * Adds an event loader (takes *.js files from a folder)
 * @param {string} type - Type of the bot. Either discord or telegram
 * @param {TelegramBot|Client} - a bot client instance. Should be the "same" as the type
 * @returns {void}
 */

exports.addEventLoader = (type, bot) => {
  const fs = require(`fs`)
  const path = require(`path`).join(__dirname, `./events/${type}/`)

  fs.readdir(path, (err, files) => {
    if (err) return console.error(err)
    files.forEach(file => {
      if (!file.endsWith(`.js`)) return
      const event = require(`${path}${file}`)
      const eventName = file.split(`.`)[0]
      bot.on(eventName, event.bind(null, bot))
      delete require.cache[require.resolve(`${path}${file}`)]
    })
  })
}
