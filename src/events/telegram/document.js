module.exports = (client, msg) => {
  client.emit(`fileRecieved`, msg, msg.document.file_id)
}
