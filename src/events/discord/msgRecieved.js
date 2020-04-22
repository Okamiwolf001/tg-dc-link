const groupID = require(`../../../conf.json`).tg_group_id
const { getMentionNick, getChannelName, getNick, convMarkdownFromDCtoTG } = require(`../../helper`)
const { USERS_PATTERN, CHANNELS_PATTERN } = require(`discord.js`).MessageMentions

module.exports = (client, msg) => {
  const attachments = msg.attachments
  const emojiMatch = msg.content.match(/<:.+:([0-9]+)>/g)
  let content = msg.content

  if (content) {
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

    content = convMarkdownFromDCtoTG(content)
  }

  if (attachments.size !== 0) {
    const options = {
      caption: `${content ? `<em>${getNick(msg)}</em>: ${content}` : `<em>${getNick(msg)}</em>`}`,
      parse_mode: `html`
    }
    attachments.map(file => {
      client.tgBot.sendDocument(groupID, file.url, options)
    })
  } else {
    client.tgBot.sendMessage(groupID, `<em>${getNick(msg)}</em>: ${content}`, { parse_mode: `html` })
      .catch(msg.channel.send(`Message got eaten on Telegram. Try altering it a tad. (or some bad happened)`).then(m => m.delete(1500)))
  }
}
