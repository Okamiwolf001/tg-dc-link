const channID = require(`../../../conf.json`).dc_chann_id

module.exports = (client, msg) => {
  if (msg.channel.id !== channID) return
  if (msg.author.bot && [`569547838166663203`, `174186616422662144`].includes(msg.author.id)) {
    client.emit(`msgRecieved`, msg)
  }
  if (msg.author.bot) {} else client.emit(`msgRecieved`, msg)
}
