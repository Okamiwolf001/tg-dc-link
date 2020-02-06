module.exports = (client, msg) => {
  client.emit(`fileRecieved`, msg, msg.photo[0].file_id)
}
