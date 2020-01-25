const conf = require(`../conf.json`)

// Events
const events = require(`events`)
const dcMsg = new events.EventEmitter()
const tgMsg = new events.EventEmitter()

// Discord stuff
const Discord = require(`discord.js`)
const TOKEN_DC = conf.dc_token
const channID = conf.dc_chann_id
const dcBot = new Discord.Client()

dcBot.on(`ready`, () => {
  console.log(`Discord bot ready!`)
})

dcBot.on(`message`, (msg) => {
  if (msg.channel.id !== channID) return
  if (msg.author.bot) return
  dcMsg.emit(`msgRecieved`, msg)
})

tgMsg.on(`msgRecieved`, (msg) => {
  dcBot.channels.get(channID).send(`**${msg.from.username}**: ${msg.text}`)
})

dcBot.login(TOKEN_DC)

// Telegram stuff
const TelegramBot = require(`node-telegram-bot-api`)
const TOKEN_TG = conf.tg_token
const groupID = conf.tg_group_id
const tgBot = new TelegramBot(TOKEN_TG, { polling: true })

tgBot.on(`text`, (msg) => {
  if (msg.chat.id !== groupID) return
  if (msg.from.is_bot) return
  tgMsg.emit(`msgRecieved`, msg)
})

dcMsg.on(`msgRecieved`, (msg) => {
  tgBot.sendMessage(groupID, `_${msg.author.username}_: ${msg.content}`, { parse_mode: `markdown` })
})
