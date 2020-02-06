module.exports = (client, msg) => {
  client.emit(`fileRecieved`, msg, msg.video.file_id)
}
