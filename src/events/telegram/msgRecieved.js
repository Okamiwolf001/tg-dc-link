const helper = require(`../../helper`)
module.exports = (client, msg) => {
  helper.sendDCWebHook(msg, null, client, client.webhook)
}
