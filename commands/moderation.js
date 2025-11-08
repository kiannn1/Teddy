const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const warnings = new Map();

function kickCommand(message, args) {
  const member = Array.from(message.mentions?.members?.values() || [])[0];
  if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
    return message.reply("❌ You don't have permission to kick members!");
  }
  if (!message.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
    return message.reply("❌ I don't have permission to kick members!");
  }
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
  member.kick(reason)
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
  const member = Array.from(message.mentions?.members?.values() || [])[0];
  if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
    return message.reply("❌ You don't have permission to ban members!");
  }
  if (!message.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
    return message.reply("❌ I don't have permission to ban members!");
  }
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
  member.ban({ reason })
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
  const member = Array.from(message.mentions?.members?.values() || [])[0];
  if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return message.reply("❌ You don't have permission to mute members!");
  }
  if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return message.reply("❌ I don't have permission to mute members!");
  }
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
        case 'm': duration = value * 60 * 1000; break;
        case 'h': duration = value * 60 * 60 * 1000; break;
        case 'd': duration = value * 24 * 60 * 60 * 1000; break;
      }
    }
  }
  if (duration > 2419200000) {
    return message.reply('❌ Timeout duration cannot exceed 28 days!');
  }
  const reason = args.slice(2).join(' ') || 'No reason provided';
  member.timeout(duration, reason)
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
  const member = Array.from(message.mentions?.members?.values() || [])[0];
  if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return message.reply("❌ You don't have permission to unmute members!");
  }
  if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return message.reply("❌ I don't have permission to unmute members!");
  }
  if (!member) {
    return message.reply('❌ Please mention a user to unmute! Example: `/unmute @user`');
  }
  member.timeout(null)
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

function warnCommand(message, args) {
  const member = Array.from(message.mentions?.members?.values() || [])[0];
  if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return message.reply("❌ You don't have permission to warn members!");
  }
  if (!member) {
    return message.reply('❌ Please mention a user to warn! Example: `/warn @user reason`');
  }
  if (member.id === message.author.id) {
    return message.reply('❌ You cannot warn yourself!');
  }
  if (member.id === message.guild.ownerId) {
    return message.reply('❌ You cannot warn the server owner!');
  }
  const reason = args.slice(1).join(' ') || 'No reason provided';
  const guildId = message.guild.id;
  const userId = member.id;
  const key = `${guildId}-${userId}`;
  if (!warnings.has(key)) {
    warnings.set(key, []);
  }
  const userWarnings = warnings.get(key);
  const warning = {
    id: userWarnings.length + 1,
    reason,
    moderator: message.author.tag,
    timestamp: Date.now(),
  };
  userWarnings.push(warning);
  const embed = new EmbedBuilder()
    .setColor('#ff9900')
    .setTitle('⚠️ Member Warned')
    .addFields(
      { name: 'User', value: `${member.user.tag}`, inline: true },
      { name: 'Warned by', value: `${message.author.tag}`, inline: true },
      { name: 'Total Warnings', value: `${userWarnings.length}`, inline: true },
      { name: 'Reason', value: reason }
    )
    .setTimestamp();
  message.channel.send({ embeds: [embed] });
}

function warningsCommand(message, args) {
  const member = Array.from(message.mentions?.members?.values() || [])[0] || message.member;
  const guildId = message.guild.id;
  const userId = member.id;
  const key = `${guildId}-${userId}`;
  const userWarnings = warnings.get(key) || [];
  if (userWarnings.length === 0) {
    return message.reply(`✅ ${member.user.tag} has no warnings!`);
  }
  const warningList = userWarnings
    .map((w, index) =>
      `**${index + 1}.** ${w.reason}\n   - By: ${w.moderator}\n   - Date: <t:${Math.floor(w.timestamp / 1000)}:R>`
    )
    .join('\n\n');
  const embed = new EmbedBuilder()
    .setColor('#ffaa00')
    .setTitle(`⚠️ Warnings for ${member.user.tag}`)
    .setDescription(warningList)
    .setFooter({ text: `Total: ${userWarnings.length} warning(s)` })
    .setTimestamp();
  message.channel.send({ embeds: [embed] });
}

function purgeCommand(message, args) {
  if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
    return message.reply("❌ You don't have permission to manage messages!");
  }
  if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
    return message.reply("❌ I don't have permission to manage messages!");
  }
  const amount = parseInt(args[0]);
  if (isNaN(amount) || amount < 1 || amount > 100) {
    return message.reply('❌ Please provide a number between 1 and 100! Example: `/purge 10`');
  }
  message.channel.bulkDelete(amount + 1, true)
    .then(messages => {
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🗑️ Messages Deleted')
        .setDescription(`Successfully deleted **${messages.size - 1}** messages!`)
        .setFooter({ text: `Deleted by ${message.author.tag}` })
        .setTimestamp();
      message.channel.send({ embeds: [embed] }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 3000);
      });
    })
    .catch((error) => {
      console.error(error);
      message.reply('❌ Failed to delete messages! Note: I can only delete messages less than 14 days old.');
    });
}

function slowmodeCommand(message, args) {
  if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return message.reply("❌ You don't have permission to manage channels!");
  }
  if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return message.reply("❌ I don't have permission to manage channels!");
  }
  const seconds = parseInt(args[0]);
  if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
    return message.reply('❌ Please provide a number between 0 and 21600 seconds (6 hours)! Example: `/slowmode 5`');
  }
  message.channel.setRateLimitPerUser(seconds)
    .then(() => {
      const embed = new EmbedBuilder()
        .setColor('#00aaff')
        .setTitle('⏲️ Slowmode Updated')
        .setDescription(seconds === 0 
          ? '✅ Slowmode has been disabled!' 
          : `✅ Slowmode set to **${seconds}** seconds!`)
        .setFooter({ text: `Set by ${message.author.tag}` })
        .setTimestamp();
      message.channel.send({ embeds: [embed] });
    })
    .catch((error) => {
      console.error(error);
      message.reply('❌ Failed to set slowmode!');
    });
}

function lockCommand(message, args) {
  if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return message.reply("❌ You don't have permission to manage channels!");
  }
  if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return message.reply("❌ I don't have permission to manage channels!");
  }
  message.channel.permissionOverwrites.edit(message.guild.id, {
    SendMessages: false,
  })
    .then(() => {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔒 Channel Locked')
        .setDescription('This channel has been locked. Members can no longer send messages.')
        .setFooter({ text: `Locked by ${message.author.tag}` })
        .setTimestamp();
      message.channel.send({ embeds: [embed] });
    })
    .catch((error) => {
      console.error(error);
      message.reply('❌ Failed to lock the channel!');
    });
}

function unlockCommand(message, args) {
  if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return message.reply("❌ You don't have permission to manage channels!");
  }
  if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return message.reply("❌ I don't have permission to manage channels!");
  }
  message.channel.permissionOverwrites.edit(message.guild.id, {
    SendMessages: null,
  })
    .then(() => {
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🔓 Channel Unlocked')
        .setDescription('This channel has been unlocked. Members can now send messages.')
        .setFooter({ text: `Unlocked by ${message.author.tag}` })
        .setTimestamp();
      message.channel.send({ embeds: [embed] });
    })
    .catch((error) => {
      console.error(error);
      message.reply('❌ Failed to unlock the channel!');
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
  warn: warnCommand,
  warnings: warningsCommand,
  purge: purgeCommand,
  clear: purgeCommand,
  slowmode: slowmodeCommand,
  lock: lockCommand,
  unlock: unlockCommand,
};
