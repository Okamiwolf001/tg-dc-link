const runTGBot = () => {
  const conf = require(`../conf.json`)
  const fs = require(`fs`)
  const path = require(`path`)

  // Telegram stuff
  const TelegramBot = require(`node-telegram-bot-api`)
  const TOKEN_TG = conf.tg_token
  const tgClient = new TelegramBot(TOKEN_TG, { polling: true })
  const eventPath = path.join(__dirname, `events/tg`)

  fs.readdir(eventPath, (err, files) => {
    if (err) return console.error(err)
    files.forEach(file => {
      if (!file.endsWith(`.js`)) return
      const event = require(`${eventPath}/${file}`)
      const eventName = file.split(`.`)[0]
      tgClient.on(eventName, event.bind(null, tgClient))
      delete require.cache[require.resolve(`${eventPath}/${file}`)]
    })
  })
  exports.tgClient = tgClient
}
exports.runTGBot = runTGBot
