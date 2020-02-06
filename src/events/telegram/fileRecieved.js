const helper = require(`../../helper`)

module.exports = (client, msg, file) => {
  client.getFileLink(file).then(f => {
    const arr = f.split(`.`)
    if (arr[arr.length - 1] === `tgs`) return
    helper.sendDCWebHook(msg, f, client, client.webhook)
  })
}
