const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const eightBallResponses = [
  '🎱 It is certain.',
  '🎱 It is decidedly so.',
  '🎱 Without a doubt.',
  '🎱 Yes definitely.',
  '🎱 You may rely on it.',
  '🎱 As I see it, yes.',
  '🎱 Most likely.',
  '🎱 Outlook good.',
  '🎱 Yes.',
  '🎱 Signs point to yes.',
  '🎱 Reply hazy, try again.',
  '🎱 Ask again later.',
  '🎱 Better not tell you now.',
  '🎱 Cannot predict now.',
  '🎱 Concentrate and ask again.',
  "🎱 Don't count on it.",
  '🎱 My reply is no.',
  '🎱 My sources say no.',
  '🎱 Outlook not so good.',
  '🎱 Very doubtful.',
];

const jokes = [
  'Why do programmers prefer dark mode? Because light attracts bugs! 🐛',
  "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡",
  'Why did the developer go broke? Because he used up all his cache! 💰',
  'What do you call a programmer from Finland? Nerdic! 🇫🇮',
  "Why do Java developers wear glasses? Because they don't C#! 👓",
  'A SQL query walks into a bar, walks up to two tables and asks... "Can I join you?" 🍺',
  "What's a pirate's favorite programming language? You'd think it's R, but it's actually the C! 🏴‍☠️",
  "Why was the JavaScript developer sad? Because he didn't Node how to Express himself! 😢",
];

function eightBallCommand(message, args) {
  if (!args.length) {
    return message.reply('❌ Please ask a question! Example: `/8ball Will I win the lottery?`');
  }

  const question = args.join(' ');
  const response = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];

  const embed = new EmbedBuilder()
    .setColor('#8b00ff')
    .setTitle('🎱 Magic 8-Ball')
    .addFields(
      { name: 'Question', value: question },
      { name: 'Answer', value: response }
    )
    .setFooter({ text: `Asked by ${message.author.tag}` });

  message.channel.send({ embeds: [embed] });
}

function diceCommand(message, args) {
  const sides = args[0] ? parseInt(args[0]) : 6;

  if (isNaN(sides) || sides < 2 || sides > 100) {
    return message.reply('❌ Please provide a valid number of sides (2-100)! Example: `/dice 20`');
  }

  const roll = Math.floor(Math.random() * sides) + 1;

  const embed = new EmbedBuilder()
    .setColor('#ff6b6b')
    .setTitle('🎲 Dice Roll')
    .setDescription(`You rolled a **${roll}** on a ${sides}-sided die!`)
    .setFooter({ text: `Rolled by ${message.author.tag}` });

  message.channel.send({ embeds: [embed] });
}

function coinflipCommand(message, args) {
  const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
  const emoji = result === 'Heads' ? '🪙' : '💰';

  const embed = new EmbedBuilder()
    .setColor('#ffd700')
    .setTitle('🪙 Coin Flip')
    .setDescription(`${emoji} The coin landed on **${result}**!`)
    .setFooter({ text: `Flipped by ${message.author.tag}` });

  message.channel.send({ embeds: [embed] });
}

function jokeCommand(message, args) {
  const joke = jokes[Math.floor(Math.random() * jokes.length)];

  const embed = new EmbedBuilder()
    .setColor('#ffcc00')
    .setTitle('😂 Random Joke')
    .setDescription(joke)
    .setFooter({ text: 'Hope you laughed!' });

  message.channel.send({ embeds: [embed] });
}

function avatarCommand(message, args) {
  // Fix for slash command Map: get first user or author
  const user = Array.from(message.mentions?.users?.values() || [])[0] || message.author;
  const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

  const embed = new EmbedBuilder()
    .setColor('#00d9ff')
    .setTitle(`${user.tag}'s Avatar`)
    .setImage(avatarURL)
    .setFooter({ text: `Requested by ${message.author.tag}` });

  message.channel.send({ embeds: [embed] });
}

function serverinfoCommand(message, args) {
  const { guild } = message;

  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(`📊 ${guild.name} Server Info`)
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .addFields(
      { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
      { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
      { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
      { name: '📝 Channels', value: `${guild.channels.cache.size}`, inline: true },
      { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
      { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
      { name: 'Ⓜ️ Server ID', value: guild.id, inline: false }
    )
    .setFooter({ text: `Requested by ${message.author.tag}` })
    .setTimestamp();

  message.channel.send({ embeds: [embed] });
}

async function userinfoCommand(message, args) {
  const user = Array.from(message.mentions?.users?.values() || [])[0] || message.author;
  let member = Array.from(message.mentions?.members?.values() || [])[0] || message.member;

  if (!member || member.user.id !== user.id) {
    try {
      member = await message.guild.members.fetch(user.id);
    } catch (error) {
      return message.reply('❌ Could not fetch member information!');
    }
  }

  const roles = member.roles.cache
    .filter(role => role.id !== message.guild.id)
    .sort((a, b) => b.position - a.position)
    .map(role => role.toString())
    .slice(0, 10);

  const embed = new EmbedBuilder()
    .setColor(member.displayHexColor || '#ffffff')
    .setTitle(`👤 ${user.tag}`)
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: 'Ⓜ️ User ID', value: user.id, inline: true },
      { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
      { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
      { name: '🎭 Roles', value: roles.length ? roles.join(', ') : 'None', inline: false }
    )
    .setFooter({ text: `Requested by ${message.author.tag}` })
    .setTimestamp();

  if (roles.length > 10) {
    embed.addFields({ name: 'Note', value: `... and ${roles.length - 10} more roles` });
  }

  message.channel.send({ embeds: [embed] });
}

function memeCommand(message, args) {
  const memes = [
    'https://i.imgflip.com/30b1gx.jpg',
    'https://i.imgflip.com/1bij.jpg',
    'https://i.imgflip.com/4t0m5.jpg',
    'https://i.imgflip.com/26am.jpg',
  ];

  const meme = memes[Math.floor(Math.random() * memes.length)];

  const embed = new EmbedBuilder()
    .setColor('#ff69b4')
    .setTitle('😂 Random Meme')
    .setImage(meme)
    .setFooter({ text: `Requested by ${message.author.tag}` });

  message.channel.send({ embeds: [embed] });
}

function pingCommand(message, args, queue, client) {
  const botLatency = Date.now() - message.createdTimestamp;
  const apiLatency = Math.round(client.ws.ping);

  const embed = new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle('🏓 Pong!')
    .addFields(
      { name: '⏱️ Bot Latency', value: `${botLatency}ms`, inline: true },
      { name: '📡 API Latency', value: `${apiLatency}ms`, inline: true }
    )
    .setFooter({ text: `Requested by ${message.author.tag}` })
    .setTimestamp();

  message.channel.send({ embeds: [embed] });
}

async function sayCommand(message, args) {
  if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
    return message.reply('❌ You need the "Manage Messages" permission to use this command!');
  }

  if (!args.length) {
    return message.reply(
      '❌ Please provide a message!\n' +
      '**Usage:**\n' +
      '`/say message:<text>` - Say in current channel\n' +
      '`/say message:<text> channel:#channel` - Say in specific channel\n' +
      '`/say message:<text> anonymous:True` - Say anonymously'
    );
  }

  let isAnonymous = false;
  let targetChannel = message.channel;
  let messageContent = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.toLowerCase() === 'anon') {
      isAnonymous = true;
    } else if (arg.startsWith('<#') && arg.endsWith('>')) {
      const channelId = arg.slice(2, -1);
      const channel = message.guild.channels.cache.get(channelId);

      if (!channel) {
        return message.reply('❌ Invalid channel! Please mention a valid channel.');
      }

      if (!channel.isTextBased()) {
        return message.reply('❌ That channel is not a text channel!');
      }

      if (!channel.permissionsFor(message.guild.members.me).has(PermissionFlagsBits.SendMessages)) {
        return message.reply("❌ I don't have permission to send messages in that channel!");
      }

      targetChannel = channel;
    } else {
      messageContent.push(arg);
    }
  }

  const finalMessage = messageContent.join(' ');

  if (!finalMessage) {
    return message.reply('❌ Please provide a message to say!');
  }

  try {
    if (isAnonymous) {
      await targetChannel.send(finalMessage);
      await message.reply({ content: '✅ Message sent anonymously!', ephemeral: true });
    } else {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setDescription(finalMessage)
        .setFooter({ text: `Sent by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

      await targetChannel.send({ embeds: [embed] });

      if (targetChannel.id !== message.channel.id) {
        await message.reply({ content: `✅ Message sent to ${targetChannel}!`, ephemeral: true });
      }
    }
  } catch (error) {
    console.error(error);
    return message.reply('❌ Failed to send the message!');
  }
}

module.exports = {
  '8ball': eightBallCommand,
  dice: diceCommand,
  roll: diceCommand,
  coinflip: coinflipCommand,
  flip: coinflipCommand,
  joke: jokeCommand,
  avatar: avatarCommand,
  av: avatarCommand,
  serverinfo: serverinfoCommand,
  si: serverinfoCommand,
  userinfo: userinfoCommand,
  ui: userinfoCommand,
  meme: memeCommand,
  ping: pingCommand,
  say: sayCommand,
};
