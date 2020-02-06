module.exports = (client, msg) => {
  client.emit(`fileRecieved`, msg, msg.audio.file_id)
}
