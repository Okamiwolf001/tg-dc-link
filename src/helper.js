const getNick = (msg) => {
  return msg.guild.member(msg.author).nickname ? msg.guild.member(
    msg.author).nickname : msg.author.username
}

exports.getNick = getNick

const getMentionNick = (msg, client) => {
  const { USERS_PATTERN } = require(`discord.js`).MessageMentions
  const mentArr = []
  const ret = []
  msg.content.match(USERS_PATTERN).forEach(
    mention => {
      if (mention.startsWith(`<@`) && mention.endsWith(`>`)) {
        mentArr.push(mention.slice(2, -1).replace(`!`, ``))
      }
    })
  mentArr.forEach(id => {
    ret.push(msg.guild.members.get(id).nickname
      ? msg.guild.members.get(id).nickname
      : client.users.get(id).username)
  })
  return ret
}

exports.getMentionNick = getMentionNick

const getChannelName = (msg, client) => {
  const { CHANNELS_PATTERN } = require(`discord.js`).MessageMentions
  const ret = []
  msg.content.match(CHANNELS_PATTERN).forEach(
    chann => {
      ret.push(client.channels.get(chann.slice(2, -1)).name)
    })
  return ret
}

exports.getChannelName = getChannelName

const sendDCWebHook = (msg, f, bot, hook) => {
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

exports.sendDCWebHook = sendDCWebHook

const addEventLoader = (type, bot) => {
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

exports.addEventLoader = addEventLoader
