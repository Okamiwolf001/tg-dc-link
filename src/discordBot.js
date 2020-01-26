const runDCBot = () => {
  const conf = require(`../conf.json`)
  const fs = require(`fs`)
  const path = require(`path`)

  // Discord stuff
  const Discord = require(`discord.js`)
  const TOKEN_DC = conf.dc_token
  const dcClient = new Discord.Client()
  const eventPath = path.join(__dirname, `events/dc`)

  fs.readdir(eventPath, (err, files) => {
    if (err) return console.error(err)
    files.forEach(file => {
      if (!file.endsWith(`.js`)) return
      const event = require(`${eventPath}/${file}`)
      const eventName = file.split(`.`)[0]
      dcClient.on(eventName, event.bind(null, dcClient))
      delete require.cache[require.resolve(`${eventPath}/${file}`)]
    })
  })

  dcClient.login(TOKEN_DC)
  exports.dcClient = dcClient
}
exports.runDCBot = runDCBot
