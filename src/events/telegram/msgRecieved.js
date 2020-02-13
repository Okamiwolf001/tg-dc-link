const { sendDCWebHook } = require(`../../helper`)

module.exports = (client, msg) => {
  sendDCWebHook(msg, null, client, client.webhook)
}
