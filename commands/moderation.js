// commands/moderation.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('moderation')
    .setDescription('Moderation commands: kick, ban, mute, unmute, purge, lock, unlock')
    .addSubcommand(sub =>
      sub.setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption(opt => opt.setName('target').setDescription('Member to kick').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason for the kick')))
    .addSubcommand(sub =>
      sub.setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption(opt => opt.setName('target').setDescription('Member to ban').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason for the ban')))
    .addSubcommand(sub =>
      sub.setName('mute')
        .setDescription('Mute (timeout) a member')
        .addUserOption(opt => opt.setName('target').setDescription('Member to mute').setRequired(true))
        .addIntegerOption(opt => opt.setName('duration').setDescription('Duration in minutes'))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason for the mute')))
    .addSubcommand(sub =>
      sub.setName('unmute')
        .setDescription('Unmute a member')
        .addUserOption(opt => opt.setName('target').setDescription('Member to unmute').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('purge')
        .setDescription('Delete messages in the channel')
        .addIntegerOption(opt => opt.setName('amount').setDescription('Number of messages to delete').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('lock')
        .setDescription('Lock the current text channel'))
    .addSubcommand(sub =>
      sub.setName('unlock')
        .setDescription('Unlock the current text channel')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const { guild, member, channel } = interaction;

    // Kick
    if (sub === 'kick') {
      const target = interaction.options.getMember('target');
      const reason = interaction.options.getString('reason') || 'No reason provided';

      if (!member.permissions.has(PermissionFlagsBits.KickMembers))
        return interaction.reply({ content: '❌ You don’t have permission to kick members!', ephemeral: true });
      if (!guild.members.me.permissions.has(PermissionFlagsBits.KickMembers))
        return interaction.reply({ content: '❌ I don’t have permission to kick members!', ephemeral: true });
      if (!target.kickable)
        return interaction.reply({ content: '❌ I cannot kick that member (role hierarchy?)', ephemeral: true });

      await target.kick(reason).catch(err => {
        console.error(err);
        return interaction.reply({ content: '❌ Failed to kick the member!', ephemeral: true });
      });

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Member Kicked')
        .addFields(
          { name: 'User', value: `${target.user.tag}`, inline: true },
          { name: 'Kicked by', value: `${member.user.tag}`, inline: true },
          { name: 'Reason', value: reason }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // Ban
    if (sub === 'ban') {
      const target = interaction.options.getMember('target');
      const reason = interaction.options.getString('reason') || 'No reason provided';

      if (!member.permissions.has(PermissionFlagsBits.BanMembers))
        return interaction.reply({ content: '❌ You don’t have permission to ban members!', ephemeral: true });
      if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers))
        return interaction.reply({ content: '❌ I don’t have permission to ban members!', ephemeral: true });
      if (!target.bannable)
        return interaction.reply({ content: '❌ I cannot ban that member (role hierarchy?)', ephemeral: true });

      await target.ban({ reason }).catch(err => {
        console.error(err);
        return interaction.reply({ content: '❌ Failed to ban the member!', ephemeral: true });
      });

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Member Banned')
        .addFields(
          { name: 'User', value: `${target.user.tag}`, inline: true },
          { name: 'Banned by', value: `${member.user.tag}`, inline: true },
          { name: 'Reason', value: reason }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // Mute
    if (sub === 'mute') {
      const target = interaction.options.getMember('target');
      const duration = interaction.options.getInteger('duration') || 5;  // default to 5 minutes
      const reason = interaction.options.getString('reason') || 'No reason provided';

      if (!member.permissions.has(PermissionFlagsBits.ModerateMembers))
        return interaction.reply({ content: '❌ You don’t have permission to mute members!', ephemeral: true });
      if (!guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers))
        return interaction.reply({ content: '❌ I don’t have permission to mute members!', ephemeral: true });
      if (!target.moderatable)
        return interaction.reply({ content: '❌ I cannot mute that member!', ephemeral: true });

      await target.timeout(duration * 60 * 1000, reason).catch(err => {
        console.error(err);
        return interaction.reply({ content: '❌ Failed to mute the member!', ephemeral: true });
      });

      return interaction.reply({ content: `✅ ${target.user.tag} has been muted for ${duration} minutes (Reason: ${reason}).` });
    }

    // Unmute
    if (sub === 'unmute') {
      const target = interaction.options.getMember('target');

      if (!member.permissions.has(PermissionFlagsBits.ModerateMembers))
        return interaction.reply({ content: '❌ You don’t have permission to unmute members!', ephemeral: true });
      if (!guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers))
        return interaction.reply({ content: '❌ I don’t have permission to unmute members!', ephemeral: true });

      await target.timeout(null).catch(err => {
        console.error(err);
        return interaction.reply({ content: '❌ Failed to unmute the member!', ephemeral: true });
      });

      return interaction.reply({ content: `✅ ${target.user.tag} has been unmuted.` });
    }

    // Purge
    if (sub === 'purge') {
      const amount = interaction.options.getInteger('amount');

      if (!member.permissions.has(PermissionFlagsBits.ManageMessages))
        return interaction.reply({ content: '❌ You don’t have permission to manage messages!', ephemeral: true });
      if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages))
        return interaction.reply({ content: '❌ I don’t have permission to manage messages!', ephemeral: true });

      const deleted = await channel.bulkDelete(amount, true).catch(err => {
        console.error(err);
        return interaction.reply({ content: '❌ Failed to delete messages!', ephemeral: true });
      });

      return interaction.reply({ content: `✅ Deleted ${deleted.size} message(s).`, ephemeral: true });
    }

    // Lock
    if (sub === 'lock') {
      if (!member.permissions.has(PermissionFlagsBits.ManageChannels))
        return interaction.reply({ content: '❌ You don’t have permission to manage channels!', ephemeral: true });
      if (!channel.permissionsFor(guild.members.me).has(PermissionFlagsBits.ManageChannels))
        return interaction.reply({ content: '❌ I don’t have permission to manage this channel!', ephemeral: true });

      await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false }).catch(err => {
        console.error(err);
        return interaction.reply({ content: '❌ Failed to lock the channel!', ephemeral: true });
      });

      return interaction.reply({ content: '🔒 This channel has been locked.' });
    }

    // Unlock
    if (sub === 'unlock') {
      if (!member.permissions.has(PermissionFlagsBits.ManageChannels))
        return interaction.reply({ content: '❌ You don’t have permission to manage channels!', ephemeral: true });
      if (!channel.permissionsFor(guild.members.me).has(PermissionFlagsBits.ManageChannels))
        return interaction.reply({ content: '❌ I don’t have permission to manage this channel!', ephemeral: true });

      await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: null }).catch(err => {
        console.error(err);
        return interaction.reply({ content: '❌ Failed to unlock the channel!', ephemeral: true });
      });

      return interaction.reply({ content: '🔓 This channel has been unlocked.' });
    }

    // If we somehow get here
    return interaction.reply({ content: '❌ Unknown moderation operation!', ephemeral: true });
  }
};
