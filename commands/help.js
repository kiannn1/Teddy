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
          `\`${prefix}play <url>\` - Play a YouTube video in your voice channel\n` +
          `\`${prefix}pause\` - Pause the current song\n` +
          `\`${prefix}resume\` - Resume the paused song\n` +
          `\`${prefix}stop\` - Stop playing and clear the queue\n` +
          `\`${prefix}skip\` - Skip to the next song\n` +
          `\`${prefix}queue\` - Show the current music queue\n` +
          `\`${prefix}clear\` - Clear the queue (keeps current song)`,
        inline: false
      },
      {
        name: '🛡️ Moderation Commands',
        value:
          `\`${prefix}kick @user [reason]\` - Kick a member from the server\n` +
          `\`${prefix}ban @user [reason]\` - Ban a member from the server\n` +
          `\`${prefix}mute @user [duration] [reason]\` - Timeout a member\n` +
          `\`${prefix}unmute @user\` - Remove timeout from a member\n\n` +
          `Duration format: 10m (minutes), 2h (hours), 1d (days)`,
        inline: false
      },
      {
        name: 'ℹ️ Info',
        value: `\`${prefix}help\` - Show this help message`,
        inline: false
      }
    )
    .setFooter({ text: 'Music & Moderation Bot' })
    .setTimestamp();

  message.channel.send({ embeds: [embed] });
}

module.exports = helpCommand;
