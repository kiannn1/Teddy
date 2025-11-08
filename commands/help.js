
const { EmbedBuilder } = require('discord.js');

function helpCommand(message, prefix) {
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('🤖 Bot Commands')
    .setDescription('Use `/` prefix for all commands\nExample: `/play` or `/help`')
    .addFields(
      {
        name: '🎵 Music Commands',
        value: 
          '`/play <url>` - Play a YouTube video\n' +
          '`/pause` - Pause the current song\n' +
          '`/resume` - Resume the paused song\n' +
          '`/stop` - Stop playing and clear queue\n' +
          '`/skip` - Skip to the next song\n' +
          '`/queue` - Show the music queue',
        inline: false
      },
      {
        name: '🛡️ Moderation Commands',
        value:
          '`/kick <user> [reason]` - Kick a member\n' +
          '`/ban <user> [reason]` - Ban a member\n' +
          '`/mute <user> <duration> [reason]` - Timeout a member\n' +
          '`/unmute <user>` - Remove timeout\n' +
          '`/warn <user> <reason>` - Warn a member\n' +
          '`/warnings <user>` - View warnings\n' +
          '`/purge <amount>` - Delete messages (1-100)\n' +
          '`/slowmode <seconds>` - Set slowmode (0-21600)\n' +
          '`/lock` - Lock the channel\n' +
          '`/unlock` - Unlock the channel',
        inline: false
      },
      {
        name: '🎮 Fun Commands',
        value:
          '`/8ball <question>` - Ask the magic 8-ball\n' +
          '`/dice [sides]` - Roll a dice (default: 6)\n' +
          '`/coinflip` - Flip a coin\n' +
          '`/joke` - Get a random joke\n' +
          '`/meme` - Get a random meme\n' +
          '`/avatar [user]` - Show user\'s avatar\n' +
          '`/userinfo [user]` - Show user info\n' +
          '`/serverinfo` - Show server info\n' +
          '`/ping` - Check bot latency\n' +
          '`/say <message> [channel] [anonymous]` - Make the bot say something',
        inline: false
      },
      {
        name: 'ℹ️ Info',
        value: '`/help` - Show this help message',
        inline: false
      }
    )
    .setFooter({ text: 'Music, Moderation & Fun Bot • Made with Discord.js' })
    .setTimestamp();

  message.channel.send({ embeds: [embed] });
}

module.exports = helpCommand;
