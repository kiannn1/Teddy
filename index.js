const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const play = require('play-dl');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
});

const PREFIX = ['/', '!t'];
const musicCommands = require('./commands/music');
const moderationCommands = require('./commands/moderation');
const helpCommand = require('./commands/help');

const queue = new Map();

client.once('clientReady', () => {
  console.log(`✓ Bot is online as ${client.user.tag}`);
  console.log(`✓ Serving ${client.guilds.cache.size} servers`);
  console.log(`✓ Command prefixes: ${PREFIX.join(', ')}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  let usedPrefix = null;
  for (const prefix of PREFIX) {
    if (message.content.startsWith(prefix)) {
      usedPrefix = prefix;
      break;
    }
  }

  if (!usedPrefix) return;

  const args = message.content.slice(usedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  try {
    if (musicCommands[commandName]) {
      await musicCommands[commandName](message, args, queue, client);
    } else if (moderationCommands[commandName]) {
      await moderationCommands[commandName](message, args);
    } else if (commandName === 'help') {
      await helpCommand(message, usedPrefix);
    }
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);
    message.reply('❌ An error occurred while executing this command.');
  }
});

client.on('error', (error) => {
  console.error('Discord client error:', error);
});

const token = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error('❌ ERROR: No Discord token found!');
  console.error('Please set DISCORD_TOKEN or DISCORD_BOT_TOKEN environment variable');
  process.exit(1);
}

client.login(token).catch((error) => {
  console.error('❌ Failed to login:', error.message);
  process.exit(1);
});
