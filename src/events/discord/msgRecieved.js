const groupID = require(`../../../conf.json`).tg_group_id
const { getMentionNick, getChannelName, getNick } = require(`../../helper`)
const { USERS_PATTERN, CHANNELS_PATTERN } = require(`discord.js`).MessageMentions

module.exports = (client, msg) => {
  const attachments = msg.attachments
  const emojiMatch = msg.content.match(/<:.+:([0-9]+)>/g)
  let content = msg.content

  if (msg.mentions.members.first()) {
    const nicks = getMentionNick(msg, client)
    const mentions = msg.content.match(USERS_PATTERN)
    for (let i = 0; i < mentions.length; i++) {
      content = content.replace(mentions[i], `@${nicks[i]}`)
    }
  }

  if (msg.mentions.channels.first()) {
    const channelNames = getChannelName(msg, client)
    const channels = msg.content.match(CHANNELS_PATTERN)
    for (let i = 0; i < channels.length; i++) {
      content = content.replace(channels[i],
        `#${channelNames[i]}`)
    }
  }

  if (emojiMatch) {
    for (let i = 0; i < emojiMatch.length; i++) {
      content = content.replace(emojiMatch[i],
        `:${emojiMatch[i].match(/\b[^\d\W]+\b/g)}:`)
    }
  }

  const options = {
    caption: ` _${getNick(msg)}_: ${content || ``}`,
    parse_mode: `markdown` }
  console.log(options)
  if (attachments.size !== 0) {
    attachments.map(file => {
      client.tgBot.sendDocument(groupID, file.url, options)
    })
  } else {
    client.tgBot.sendMessage(groupID, `_${getNick(msg)}_: ${content}`, { parse_mode: `markdown` })
  }
}
