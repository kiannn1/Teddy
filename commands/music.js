const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const play = require('play-dl');
const { getTrack } = require('spotify-url-info');
const { EmbedBuilder, ChannelType } = require('discord.js');

const players = new Map();
const connections = new Map();
const volumes = new Map();

async function joinCommand(message, args, queue, client) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.reply('❌ You must be in a voice channel to use `/join`.');

  try {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });
    connections.set(message.guild.id, connection);
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    message.reply(`✅ Joined ${voiceChannel.name}!`);
  } catch (err) {
    console.error(err);
    message.reply('❌ Unable to join your voice channel.');
  }
}

async function leaveCommand(message, args, queue, client) {
  const connection = connections.get(message.guild.id) || null;
  if (connection) {
    connection.destroy();
    connections.delete(message.guild.id);
    queue.delete(message.guild.id);
    message.reply('👋 Disconnected from voice channel!');
  } else {
    message.reply('❌ I am not in a voice channel.');
  }
}

async function playCommand(message, args, queue, client) {
  const voiceChannel = message.member.voice.channel;

  if (!voiceChannel) {
    return message.reply('❌ You need to be in a voice channel to play music!');
  }
  if (!args.length) {
    return message.reply('❌ Provide a YouTube or Spotify link! e.g. `/play https://youtube.com/watch?v=...` or `/play https://open.spotify.com/track/...`');
  }

  const url = args[0];
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  const isSpotify = url.includes('spotify.com/track/');

  if (!isYouTube && !isSpotify) {
    return message.reply('❌ The /play command only supports YouTube and Spotify track URLs.');
  }

  try {
    const serverQueue = queue.get(message.guild.id);
    let song;

    if (isSpotify) {
      try {
        const spotifyData = await getTrack(url);
        const searchQuery = `${spotifyData.name} ${spotifyData.artists.map(a => a.name).join(' ')}`;
        const results = await play.search(searchQuery, { limit: 1 });
        if (!results.length) return message.reply('❌ Could not find this song on YouTube!');
        const video = results[0];
        song = {
          title: spotifyData.name,
          url: video.url,
          duration: Math.floor(spotifyData.duration_ms / 1000),
          requester: message.author.tag,
          thumbnail: spotifyData.album.images[0]?.url ?? null,
        };
      } catch (err) {
        return message.reply('❌ Failed to fetch or match that Spotify track!');
      }
    } else if (isYouTube) {
      const valid = await play.validate(url);
      if (!valid || valid === 'search')
        return message.reply('❌ Invalid YouTube link.');

      const info = await play.video_info(url);
      song = {
        title: info.video_details.title,
        url: info.video_details.url,
        duration: info.video_details.durationInSec,
        requester: message.author.tag,
        thumbnail: info.video_details.thumbnails?.[0]?.url ?? null,
      };
    }

    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        player: createAudioPlayer(),
        playing: true,
      };
      queue.set(message.guild.id, queueContruct);
      queueContruct.songs.push(song);

      try {
        const connection =
          connections.get(message.guild.id) ||
          joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
          });
        queueContruct.connection = connection;

        connection.subscribe(queueContruct.player);
        queueContruct.player.on(AudioPlayerStatus.Idle, () => {
          queueContruct.songs.shift();
          if (queueContruct.songs.length > 0) {
            playSong(message.guild, queueContruct.songs[0], queue);
          } else {
            queue.delete(message.guild.id);
            connection.destroy();
          }
        });
        queueContruct.player.on('error', error => {
          console.error('Audio player error:', error);
          queueContruct.songs.shift();
          if (queueContruct.songs.length > 0) {
            playSong(message.guild, queueContruct.songs[0], queue);
          }
        });

        await playSong(message.guild, queueContruct.songs[0], queue);
      } catch (err) {
        console.error(err);
        queue.delete(message.guild.id);
        return message.reply('❌ Failed to join voice channel or play music!');
      }
    } else {
      serverQueue.songs.push(song);
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🎵 Song Added to Queue')
        .setDescription(`**${song.title}**`)
        .addFields(
          { name: 'Duration', value: formatDuration(song.duration), inline: true },
          { name: 'Position in Queue', value: `${serverQueue.songs.length}`, inline: true }
        )
        .setFooter({ text: `Requested by ${message.author.tag}` });
      if (song.thumbnail) embed.setThumbnail(song.thumbnail);
      return message.channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Play command error:', error);
    message.reply('❌ Failed to play the song. Make sure the URL is valid and the content is available!');
  }
}

async function playSong(guild, song, queue) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    if (serverQueue && serverQueue.connection) {
      serverQueue.connection.destroy();
    }
    queue.delete(guild.id);
    return;
  }
  try {
    if (!song.url || typeof song.url !== "string" || !/^https?:\/\//.test(song.url)) {
      throw new Error('Song URL is undefined or invalid');
    }

    if (play.is_expired()) await play.refreshToken();
    const stream = await play.stream(song.url);

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
      inlineVolume: true,
    });

    // Use server-configured volume, default to 50%
    const vol = volumes.get(guild.id) ?? 0.5;
    resource.volume.setVolume(vol);

    serverQueue.player.play(resource);

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🎶 Now Playing')
      .setDescription(`**${song.title}**`)
      .addFields({ name: 'Duration', value: formatDuration(song.duration), inline: true })
      .setFooter({ text: `Requested by ${song.requester}` });
    if (song.thumbnail) embed.setThumbnail(song.thumbnail);

    serverQueue.textChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Play song error:', error);
    serverQueue.textChannel.send('❌ Error playing the song! Skipping to next...');
    serverQueue.songs.shift();
    if (serverQueue.songs.length > 0) {
      playSong(guild, serverQueue.songs[0], queue);
    } else {
      if (serverQueue.connection) serverQueue.connection.destroy();
      queue.delete(guild.id);
    }
  }
}

// /tts <text> [#channel]
async function ttsCommand(message, args, queue, client) {
  if (!args.length) return message.reply('❌ Please provide text for the bot to speak!');

  // Check if last arg is a channel mention format
  let text = args.join(' ');
  let targetChannel = message.channel;

  // Allow specifying a channel: /tts <text> <#channel>
  const lastArg = args[args.length - 1];
  const channelMentionMatch = lastArg.match(/^<#(\d+)>$/);
  if (channelMentionMatch) {
    const channelId = channelMentionMatch[1];
    const channelObj = message.guild.channels.cache.get(channelId);
    if (channelObj && channelObj.type === ChannelType.GuildText) {
      targetChannel = channelObj;
      args.pop();
      text = args.join(' ');
    } else {
      return message.reply('❌ Invalid or non-text channel specified!');
    }
  }

  targetChannel.send({ content: text, tts: true })
    .then(() => message.reply(`✅ Sent TTS message${targetChannel.id!==message.channel.id ? ` in ${targetChannel}` : ""}!`))
    .catch(err => {
      console.error(err);
      message.reply('❌ Failed to send TTS message.');
    });
}

function volumeCommand(message, args, queue) {
  const serverQueue = queue.get(message.guild.id);
  if (!serverQueue || !serverQueue.player) return message.reply('❌ No music player active.');
  const vol = args.length ? Number(args[0]) : undefined;
  if (vol === undefined || isNaN(vol) || vol < 0 || vol > 1) {
    return message.reply('❌ Please set a volume between 0.0 and 1.0 (e.g., `/volume 0.5`)');
  }
  volumes.set(message.guild.id, vol);
  try {
    if (serverQueue.player.state.status === AudioPlayerStatus.Playing) {
      serverQueue.player._state.resource.volume.setVolume(vol);
    }
    message.reply(`🔊 Volume set to ${Math.round(vol * 100)}%`);
  } catch (err) {
    message.reply('❌ Failed to set volume.');
  }
}

function pauseCommand(message, args, queue) {
  const serverQueue = queue.get(message.guild.id);
  if (!serverQueue) return message.reply('❌ There is nothing playing!');
  if (!message.member.voice.channel) return message.reply('❌ You need to be in the voice channel to pause!');
  serverQueue.player.pause();
  message.reply('⏸️ Paused the music!');
}

function resumeCommand(message, args, queue) {
  const serverQueue = queue.get(message.guild.id);
  if (!serverQueue) return message.reply('❌ There is nothing playing!');
  if (!message.member.voice.channel) return message.reply('❌ You need to be in the voice channel to resume!');
  serverQueue.player.unpause();
  message.reply('▶️ Resumed the music!');
}

function stopCommand(message, args, queue) {
  const serverQueue = queue.get(message.guild.id);
  if (!serverQueue) return message.reply('❌ There is nothing playing!');
  if (!message.member.voice.channel) return message.reply('❌ You need to be in the voice channel to stop!');
  serverQueue.songs = [];
  serverQueue.player.stop();
  if (serverQueue.connection) serverQueue.connection.destroy();
  queue.delete(message.guild.id);
  message.reply('⏹️ Stopped the music and cleared the queue!');
}

function skipCommand(message, args, queue) {
  const serverQueue = queue.get(message.guild.id);
  if (!serverQueue) return message.reply('❌ There is nothing playing!');
  if (!message.member.voice.channel) return message.reply('❌ You need to be in the voice channel to skip!');
  serverQueue.player.stop();
  message.reply('⏭️ Skipped the song!');
}

function queueCommand(message, args, queue) {
  const serverQueue = queue.get(message.guild.id);
  if (!serverQueue || serverQueue.songs.length === 0) return message.reply('❌ The queue is empty!');
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('🎵 Music Queue')
    .setDescription(
      serverQueue.songs
        .map((song, index) =>
          `${index === 0 ? '**Now Playing:**' : `${index}.`} ${song.title} - \`${formatDuration(song.duration)}\``
        )
        .slice(0, 10)
        .join('\n')
    )
    .setFooter({ text: `${serverQueue.songs.length} song(s) in queue` });
  if (serverQueue.songs.length > 10) {
    embed.addFields({ name: 'Note', value: `... and ${serverQueue.songs.length - 10} more song(s)` });
  }
  message.channel.send({ embeds: [embed] });
}

function clearCommand(message, args, queue) {
  const serverQueue = queue.get(message.guild.id);
  if (!serverQueue) return message.reply('❌ There is nothing playing!');
  if (!message.member.voice.channel) return message.reply('❌ You need to be in the voice channel to clear the queue!');
  const currentSong = serverQueue.songs[0];
  serverQueue.songs = [currentSong];
  message.reply('🗑️ Cleared the queue! Current song will continue playing.');
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

module.exports = {
  join: joinCommand,
  leave: leaveCommand,
  play: playCommand,
  pause: pauseCommand,
  resume: resumeCommand,
  stop: stopCommand,
  skip: skipCommand,
  queue: queueCommand,
  clear: clearCommand,
  tts: ttsCommand,
  volume: volumeCommand,
};
