const { EmbedBuilder } = require('discord.js');

function helpCommand(message, prefix) {
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('🤖 Bot Commands')
    .setDescription(`Use either \`/\` or \`!t\` as the command prefix\nExample: \`${prefix}play\` or \`${prefix}help\``)
    .addFields(
      {
        name: '🎵 Music Commands',
        value: 
          `\`${prefix}play <url>\` - Play a YouTube video\n` +
          `\`${prefix}pause\` - Pause the current song\n` +
          `\`${prefix}resume\` - Resume the paused song\n` +
          `\`${prefix}stop\` - Stop playing and clear queue\n` +
          `\`${prefix}skip\` - Skip to the next song\n` +
          `\`${prefix}queue\` - Show the music queue`,
        inline: false
      },
      {
        name: '🛡️ Moderation Commands',
        value:
          `\`${prefix}kick @user [reason]\` - Kick a member\n` +
          `\`${prefix}ban @user [reason]\` - Ban a member\n` +
          `\`${prefix}mute @user [time] [reason]\` - Timeout a member\n` +
          `\`${prefix}unmute @user\` - Remove timeout\n` +
          `\`${prefix}warn @user [reason]\` - Warn a member\n` +
          `\`${prefix}warnings [@user]\` - View warnings\n` +
          `\`${prefix}purge <amount>\` - Delete messages (1-100)\n` +
          `\`${prefix}slowmode <seconds>\` - Set slowmode (0-21600)\n` +
          `\`${prefix}lock\` - Lock the channel\n` +
          `\`${prefix}unlock\` - Unlock the channel`,
        inline: false
      },
      {
        name: '🎮 Fun Commands',
        value:
          `\`${prefix}8ball <question>\` - Ask the magic 8-ball\n` +
          `\`${prefix}dice [sides]\` - Roll a dice (default: 6)\n` +
          `\`${prefix}coinflip\` - Flip a coin\n` +
          `\`${prefix}joke\` - Get a random joke\n` +
          `\`${prefix}meme\` - Get a random meme\n` +
          `\`${prefix}avatar [@user]\` - Show user's avatar\n` +
          `\`${prefix}userinfo [@user]\` - Show user info\n` +
          `\`${prefix}serverinfo\` - Show server info`,
        inline: false
      },
      {
        name: 'ℹ️ Info',
        value: `\`${prefix}help\` - Show this help message`,
        inline: false
      }
    )
    .setFooter({ text: 'Music, Moderation & Fun Bot • Made with Discord.js' })
    .setTimestamp();

  message.channel.send({ embeds: [embed] });
}

module.exports = helpCommand;
