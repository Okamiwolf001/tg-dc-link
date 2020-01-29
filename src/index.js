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
process.env[`NTBA_FIX_350`] = 1

// Helper stuff
const getNick = (msg) => {
  return msg.guild.member(msg.author).nickname ? msg.guild.member(msg.author).nickname : msg.author.username
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
  dcBot.channels.get(channID).send(`**${msg.from.username}**: ${msg.text}`)
})

tgBot.on(`fileRecieved`, (msg, file) => {
  tgBot.getFileLink(file).then(f => {
    const arr = f.split(`.`)
    if (arr[arr.length - 1] === `tgs`) return
    dcBot.channels.get(channID).send(
      `**${msg.from.username}**: ${!msg.text ? `` : msg.text}`,
      { file: f })
  })
})

dcBot.login(TOKEN_DC)

// Telegram stuff

tgBot.on(`text`, (msg) => {
  if (msg.chat.id !== groupID) return
  if (msg.from.is_bot) return
  if (msg.text.includes(`gibmetheid`)) {
    tgBot.sendMessage(msg.chat.id, msg.chat.id.toString())
  }
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
  const options = { caption: ` _${getNick(msg)}_: ${!msg.content ? `` : msg.content}`,
    parse_mode: `markdown` }

  if (attachments.size !== 0) {
    attachments.map(file => {
      tgBot.sendDocument(groupID, file.url, options)
    })
  } else {
    tgBot.sendMessage(groupID, `_${getNick(msg)}_: ${msg.content}`, { parse_mode: `markdown` })
  }
})
