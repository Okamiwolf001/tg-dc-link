module.exports = (client, msg) => {
  client.emit(`fileRecieved`, msg, msg.voice.file_id)
}
