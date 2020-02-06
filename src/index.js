// Impoorts

const conf = require(`../conf.json`)
const Discord = require(`discord.js`)
const TOKEN_DC = conf.dc_token
const channID = conf.dc_chann_id
const dcBot = new Discord.Client()
const TelegramBot = require(`node-telegram-bot-api`)
const TOKEN_TG = conf.tg_token
const groupID = conf.tg_group_id
const tgBot = new TelegramBot(TOKEN_TG, { polling: true })
const hookcord = require(`hookcord`)
const HookDC = new hookcord.Hook()

HookDC.login(conf.discord_webhook[0], conf.discord_webhook[1])

// Helper stuff
const getNick = (msg) => {
  return msg.guild.member(msg.author).nickname ? msg.guild.member(msg.author).nickname : msg.author.username
}

const getMentionNick = (msg, client) => {
  const mentArr = []
  const ret = []
  msg.content.match(Discord.MessageMentions.USERS_PATTERN).forEach(mention => {
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

const getChannelName = (msg, client) => {
  const ret = []
  msg.content.match(Discord.MessageMentions.CHANNELS_PATTERN).forEach(chann => {
    ret.push(client.channels.get(chann.slice(2, -1)).name)
  })
  return ret
}
const sendDCWebHook = (msg, f) => {
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

  tgBot.getUserProfilePhotos(msg.from.id)
    .then(pfps => {
      try {
        return pfps.photos[0][0].file_id
      } catch (e) {
        return null
      }
    }).then(fID => {
      if (fID) {
        return tgBot.getFileLink(fID)
      } else {
        return ``
      }
    }).then(link => {
      if (f) {
        return HookDC.setPayload(
          {
            username: userName(),
            avatar_url: link,
            embeds: [
              { title: msg.caption,
                image: { url: f },
                color: 0xffaaff }
            ]
          }
        ).fire().catch(e => console.log(e))
      } else {
        return HookDC.setPayload(
          {
            username: userName(),
            avatar_url: link,
            content: msg.text
          }
        ).fire().catch(e => console.log(e))
      }
    })
}

// Discord stuff

dcBot.on(`ready`, () => {
  console.log(`Discord bot ready!`)
})

dcBot.on(`message`, (msg) => {
  if (msg.channel.id !== channID) return
  if (msg.author.bot && msg.author.id === `174186616422662144`) {
    dcBot.emit(`msgRecieved`, msg)
  }
  if (msg.author.bot) {} else dcBot.emit(`msgRecieved`, msg)
})

tgBot.on(`msgRecieved`, (msg) => {
  sendDCWebHook(msg, null)
})

tgBot.on(`fileRecieved`, (msg, file) => {
  tgBot.getFileLink(file).then(f => {
    const arr = f.split(`.`)
    if (arr[arr.length - 1] === `tgs`) return
    sendDCWebHook(msg, f)
  })
})

dcBot.login(TOKEN_DC)

// Telegram stuff

tgBot.on(`text`, (msg) => {
  if (msg.text.includes(`gibmetheid`)) {
    tgBot.sendMessage(msg.chat.id, msg.chat.id.toString())
  }
  if (msg.chat.id !== groupID) return
  if (msg.from.is_bot) return
  tgBot.emit(`msgRecieved`, msg)
})

tgBot.on(`photo`, (msg) => {
  tgBot.emit(`fileRecieved`, msg, msg.photo[0].file_id)
})

tgBot.on(`audio`, (msg) => {
  tgBot.emit(`fileRecieved`, msg, msg.audio.file_id)
})

tgBot.on(`document`, (msg) => {
  tgBot.emit(`fileRecieved`, msg, msg.document.file_id)
})

tgBot.on(`sticker`, (msg) => {
  tgBot.emit(`fileRecieved`, msg, msg.sticker.file_id)
})

tgBot.on(`video`, (msg) => {
  tgBot.emit(`fileRecieved`, msg, msg.video.file_id)
})

tgBot.on(`voice`, (msg) => {
  tgBot.emit(`fileRecieved`, msg, msg.voice.file_id)
})

tgBot.on(`polling_error`, e => {
  console.log(e)
})

dcBot.on(`msgRecieved`, (msg) => {
  const attachments = msg.attachments
  const emojiMatch = msg.content.match(/<:.+:([0-9]+)>/g)
  let content = msg.content

  if (msg.mentions.members.first()) {
    const nicks = getMentionNick(msg, dcBot)
    const mentions = msg.content.match(Discord.MessageMentions.USERS_PATTERN)
    for (let i = 0; i < mentions.length; i++) {
      content = content.replace(mentions[i], `@${nicks[i]}`)
    }
  }

  if (msg.mentions.channels.first()) {
    const channelNames = getChannelName(msg, dcBot)
    const channels = msg.content.match(Discord.MessageMentions.CHANNELS_PATTERN)
    for (let i = 0; i < channels.length; i++) {
      content = content.replace(channels[i], `#${channelNames[i]}`)
    }
  }

  if (emojiMatch) {
    for (let i = 0; i < emojiMatch.length; i++) {
      content = content.replace(emojiMatch[i], `:${emojiMatch[i].match(/\b[^\d\W]+\b/g)}:`)
    }
  }

  const options = { caption: ` _${getNick(msg)}_: ${content ? `` : content}`,
    parse_mode: `markdown` }

  if (attachments.size !== 0) {
    attachments.map(file => {
      tgBot.sendDocument(groupID, file.url, options)
    })
  } else {
    tgBot.sendMessage(groupID, `_${getNick(msg)}_: ${content}`, { parse_mode: `markdown` })
  }
})
