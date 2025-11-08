const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

function kickCommand(message, args) {
  if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
    return message.reply('❌ You don\'t have permission to kick members!');
  }

  if (!message.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
    return message.reply('❌ I don\'t have permission to kick members!');
  }

  const member = message.mentions.members.first();
  if (!member) {
    return message.reply('❌ Please mention a user to kick! Example: `/kick @user reason`');
  }

  if (member.id === message.author.id) {
    return message.reply('❌ You cannot kick yourself!');
  }

  if (member.id === message.guild.ownerId) {
    return message.reply('❌ You cannot kick the server owner!');
  }

  if (!member.kickable) {
    return message.reply('❌ I cannot kick this user! They may have higher roles than me.');
  }

  const reason = args.slice(1).join(' ') || 'No reason provided';

  member
    .kick(reason)
    .then(() => {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('👢 Member Kicked')
        .addFields(
          { name: 'User', value: `${member.user.tag}`, inline: true },
          { name: 'Kicked by', value: `${message.author.tag}`, inline: true },
          { name: 'Reason', value: reason }
        )
        .setTimestamp();
      message.channel.send({ embeds: [embed] });
    })
    .catch((error) => {
      console.error(error);
      message.reply('❌ Failed to kick the member!');
    });
}

function banCommand(message, args) {
  if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
    return message.reply('❌ You don\'t have permission to ban members!');
  }

  if (!message.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
    return message.reply('❌ I don\'t have permission to ban members!');
  }

  const member = message.mentions.members.first();
  if (!member) {
    return message.reply('❌ Please mention a user to ban! Example: `/ban @user reason`');
  }

  if (member.id === message.author.id) {
    return message.reply('❌ You cannot ban yourself!');
  }

  if (member.id === message.guild.ownerId) {
    return message.reply('❌ You cannot ban the server owner!');
  }

  if (!member.bannable) {
    return message.reply('❌ I cannot ban this user! They may have higher roles than me.');
  }

  const reason = args.slice(1).join(' ') || 'No reason provided';

  member
    .ban({ reason })
    .then(() => {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔨 Member Banned')
        .addFields(
          { name: 'User', value: `${member.user.tag}`, inline: true },
          { name: 'Banned by', value: `${message.author.tag}`, inline: true },
          { name: 'Reason', value: reason }
        )
        .setTimestamp();
      message.channel.send({ embeds: [embed] });
    })
    .catch((error) => {
      console.error(error);
      message.reply('❌ Failed to ban the member!');
    });
}

function muteCommand(message, args) {
  if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return message.reply('❌ You don\'t have permission to mute members!');
  }

  if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return message.reply('❌ I don\'t have permission to mute members!');
  }

  const member = message.mentions.members.first();
  if (!member) {
    return message.reply('❌ Please mention a user to mute! Example: `/mute @user 10m reason`');
  }

  if (member.id === message.author.id) {
    return message.reply('❌ You cannot mute yourself!');
  }

  if (member.id === message.guild.ownerId) {
    return message.reply('❌ You cannot mute the server owner!');
  }

  const timeArg = args[1];
  let duration = 600000;

  if (timeArg) {
    const timeMatch = timeArg.match(/^(\d+)([mhd])$/);
    if (timeMatch) {
      const value = parseInt(timeMatch[1]);
      const unit = timeMatch[2];
      
      switch (unit) {
        case 'm':
          duration = value * 60 * 1000;
          break;
        case 'h':
          duration = value * 60 * 60 * 1000;
          break;
        case 'd':
          duration = value * 24 * 60 * 60 * 1000;
          break;
      }
    }
  }

  if (duration > 2419200000) {
    return message.reply('❌ Timeout duration cannot exceed 28 days!');
  }

  const reason = args.slice(2).join(' ') || 'No reason provided';

  member
    .timeout(duration, reason)
    .then(() => {
      const embed = new EmbedBuilder()
        .setColor('#ffaa00')
        .setTitle('🔇 Member Muted')
        .addFields(
          { name: 'User', value: `${member.user.tag}`, inline: true },
          { name: 'Muted by', value: `${message.author.tag}`, inline: true },
          { name: 'Duration', value: formatDuration(duration), inline: true },
          { name: 'Reason', value: reason }
        )
        .setTimestamp();
      message.channel.send({ embeds: [embed] });
    })
    .catch((error) => {
      console.error(error);
      message.reply('❌ Failed to mute the member!');
    });
}

function unmuteCommand(message, args) {
  if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return message.reply('❌ You don\'t have permission to unmute members!');
  }

  if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return message.reply('❌ I don\'t have permission to unmute members!');
  }

  const member = message.mentions.members.first();
  if (!member) {
    return message.reply('❌ Please mention a user to unmute! Example: `/unmute @user`');
  }

  member
    .timeout(null)
    .then(() => {
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🔊 Member Unmuted')
        .addFields(
          { name: 'User', value: `${member.user.tag}`, inline: true },
          { name: 'Unmuted by', value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();
      message.channel.send({ embeds: [embed] });
    })
    .catch((error) => {
      console.error(error);
      message.reply('❌ Failed to unmute the member!');
    });
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day(s)`;
  if (hours > 0) return `${hours} hour(s)`;
  if (minutes > 0) return `${minutes} minute(s)`;
  return `${seconds} second(s)`;
}

module.exports = {
  kick: kickCommand,
  ban: banCommand,
  mute: muteCommand,
  unmute: unmuteCommand,
};
