// Impoorts
const conf = require(`../conf.json`)
const { addEventLoader } = require(`./helper`)
const { Client } = require(`discord.js`)
const TOKEN_DC = conf.dc_token
const dcBot = new Client()
const { Hook } = require(`hookcord`)
const HookDC = new Hook()
const TOKEN_TG = conf.tg_token
const TelegramBot = require(`node-telegram-bot-api`)
const tgBot = new TelegramBot(TOKEN_TG, {
  polling: true
})

HookDC.login(conf.discord_webhook.id, conf.discord_webhook.secret)
tgBot.webhook = HookDC

// Discord stuff

addEventLoader(`discord`, dcBot)
dcBot.tgBot = tgBot
dcBot.login(TOKEN_DC)

// Telegram stuff

addEventLoader(`telegram`, tgBot)

const cleanupFunc = async (code) => {
  await dcBot.destroy()
  process.exit(code)
}

process.once(`SIGINT`, cleanupFunc)
process.once(`SIGTERM`, cleanupFunc)
process.once(`exit`, cleanupFunc)
