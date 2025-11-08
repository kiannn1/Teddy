
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
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

const musicCommands = require('./commands/music');
const moderationCommands = require('./commands/moderation');
const funCommands = require('./commands/fun');
const helpCommand = require('./commands/help');

const queue = new Map();

// Define slash commands
const commands = [
  // Music commands
  { name: 'play', description: 'Play a song from YouTube', options: [{ name: 'url', description: 'YouTube URL', type: 3, required: true }] },
  { name: 'pause', description: 'Pause the current song' },
  { name: 'resume', description: 'Resume the paused song' },
  { name: 'stop', description: 'Stop playing and clear the queue' },
  { name: 'skip', description: 'Skip the current song' },
  { name: 'queue', description: 'Show the music queue' },
  { name: 'clear', description: 'Clear the music queue' },
  
  // Moderation commands
  { name: 'kick', description: 'Kick a member', options: [{ name: 'user', description: 'User to kick', type: 6, required: true }, { name: 'reason', description: 'Reason for kick', type: 3 }] },
  { name: 'ban', description: 'Ban a member', options: [{ name: 'user', description: 'User to ban', type: 6, required: true }, { name: 'reason', description: 'Reason for ban', type: 3 }] },
  { name: 'mute', description: 'Mute a member', options: [{ name: 'user', description: 'User to mute', type: 6, required: true }, { name: 'duration', description: 'Duration (e.g., 10m, 1h)', type: 3, required: true }, { name: 'reason', description: 'Reason for mute', type: 3 }] },
  { name: 'unmute', description: 'Unmute a member', options: [{ name: 'user', description: 'User to unmute', type: 6, required: true }] },
  { name: 'warn', description: 'Warn a member', options: [{ name: 'user', description: 'User to warn', type: 6, required: true }, { name: 'reason', description: 'Reason for warning', type: 3, required: true }] },
  { name: 'warnings', description: 'View warnings for a member', options: [{ name: 'user', description: 'User to check', type: 6, required: true }] },
  { name: 'purge', description: 'Delete multiple messages', options: [{ name: 'amount', description: 'Number of messages (1-100)', type: 4, required: true }] },
  { name: 'slowmode', description: 'Set channel slowmode', options: [{ name: 'duration', description: 'Duration in seconds (0 to disable)', type: 4, required: true }] },
  { name: 'lock', description: 'Lock the current channel' },
  { name: 'unlock', description: 'Unlock the current channel' },
  
  // Fun commands
  { name: '8ball', description: 'Ask the magic 8-ball', options: [{ name: 'question', description: 'Your question', type: 3, required: true }] },
  { name: 'dice', description: 'Roll a dice', options: [{ name: 'sides', description: 'Number of sides (default: 6)', type: 4 }] },
  { name: 'coinflip', description: 'Flip a coin' },
  { name: 'joke', description: 'Get a random joke' },
  { name: 'meme', description: 'Get a random meme' },
  { name: 'avatar', description: 'Show user avatar', options: [{ name: 'user', description: 'User to show avatar', type: 6 }] },
  { name: 'userinfo', description: 'Show user information', options: [{ name: 'user', description: 'User to show info', type: 6 }] },
  { name: 'serverinfo', description: 'Show server information' },
  { name: 'help', description: 'Show all available commands' },
];

client.once('ready', async () => {
  console.log(`✓ Bot is online as ${client.user.tag}`);
  console.log(`✓ Serving ${client.guilds.cache.size} servers`);
  
  // Register slash commands
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN);
  
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    console.log('✓ Successfully registered application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // Convert interaction to message-like object for compatibility
  const fakeMessage = {
    member: interaction.member,
    guild: interaction.guild,
    channel: {
      ...interaction.channel,
      send: (content) => interaction.reply(content),
    },
    author: interaction.user,
    reply: (content) => interaction.reply(content),
    mentions: {
      users: new Map(),
      members: new Map(),
    },
  };

  // Parse options into args array
  const args = [];
  
  if (interaction.options.get('url')) args.push(interaction.options.get('url').value);
  if (interaction.options.get('user')) {
    fakeMessage.mentions.users.set(interaction.options.get('user').value, interaction.options.getUser('user'));
    fakeMessage.mentions.members.set(interaction.options.get('user').value, interaction.options.getMember('user'));
  }
  if (interaction.options.get('reason')) args.push(interaction.options.get('reason').value);
  if (interaction.options.get('duration')) args.push(interaction.options.get('duration').value);
  if (interaction.options.get('amount')) args.push(interaction.options.get('amount').value.toString());
  if (interaction.options.get('sides')) args.push(interaction.options.get('sides').value.toString());
  if (interaction.options.get('question')) args.push(interaction.options.get('question').value);

  try {
    if (musicCommands[commandName]) {
      await musicCommands[commandName](fakeMessage, args, queue, client);
    } else if (moderationCommands[commandName]) {
      await moderationCommands[commandName](fakeMessage, args);
    } else if (funCommands[commandName]) {
      await funCommands[commandName](fakeMessage, args, queue, client);
    } else if (commandName === 'help') {
      await helpCommand(fakeMessage, '/');
    }
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);
    const errorMessage = '❌ An error occurred while executing this command.';
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
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
