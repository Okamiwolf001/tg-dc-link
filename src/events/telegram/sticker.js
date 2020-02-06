module.exports = (client, msg) => {
  client.emit(`fileRecieved`, msg, msg.sticker.file_id)
}
