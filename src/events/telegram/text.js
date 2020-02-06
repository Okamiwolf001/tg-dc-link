const groupID = require(`../../../conf.json`).tg_group_id

module.exports = (client, msg) => {
  if (msg.text.includes(`gibmetheid`)) {
    client.sendMessage(msg.chat.id, msg.chat.id.toString())
  }
  if (msg.chat.id !== groupID) return
  if (msg.from.is_bot) return
  client.emit(`msgRecieved`, msg)
}
