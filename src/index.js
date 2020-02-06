// Impoorts
const conf = require(`../conf.json`)
const Discord = require(`discord.js`)
const TOKEN_DC = conf.dc_token
const dcBot = new Discord.Client()
const TOKEN_TG = conf.tg_token
const TelegramBot = require(`node-telegram-bot-api`)
const tgBot = new TelegramBot(TOKEN_TG, {
  polling: true
})
const helper = require(`./helper`)
const hookcord = require(`hookcord`)
const HookDC = new hookcord.Hook()

HookDC.login(conf.discord_webhook[0], conf.discord_webhook[1])
tgBot.webhook = HookDC

// Discord stuff

helper.addEventLoader(`discord`, dcBot)
dcBot.tgBot = tgBot
dcBot.login(TOKEN_DC)

// Telegram stuff

helper.addEventLoader(`telegram`, tgBot)

const cleanupFunc = async (code) => {
  await dcBot.destroy()
  process.exit(code)
}

process.once(`SIGINT`, cleanupFunc)
process.once(`SIGTERM`, cleanupFunc)
process.once(`exit`, cleanupFunc)
