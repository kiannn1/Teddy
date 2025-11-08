
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const play = require('play-dl');
const { EmbedBuilder } = require('discord.js');

const players = new Map();

async function playCommand(message, args, queue) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.reply('❌ You need to be in a voice channel to play music!');
  }

  if (!args.length) {
    return message.reply('❌ Please provide a YouTube URL! Example: `/play https://youtube.com/watch?v=...`');
  }

  const url = args[0];

  if (!url) {
    return message.reply('❌ Please provide a YouTube URL! Example: `/play https://youtube.com/watch?v=...`');
  }

  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    return message.reply('❌ Please provide a valid YouTube URL!');
  }

  try {
    const serverQueue = queue.get(message.guild.id);
    
    console.log('Fetching video info for URL:', url);
    const info = await play.video_info(url);
    const song = {
      title: info.video_details.title,
      url: url,
      duration: info.video_details.durationInSec,
      requester: message.author.tag,
    };

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
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator,
        });

        queueContruct.connection = connection;
        
        connection.on(VoiceConnectionStatus.Ready, () => {
          console.log('Voice connection is ready');
        });

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
          try {
            await Promise.race([
              entersState(connection, VoiceConnectionStatus.Signalling, 5000),
              entersState(connection, VoiceConnectionStatus.Connecting, 5000),
            ]);
          } catch (error) {
            connection.destroy();
            queue.delete(message.guild.id);
          }
        });

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
      return message.channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Play command error:', error);
    message.reply('❌ Failed to play the song. Make sure the URL is valid and the video is available!');
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
    if (!song.url) {
      throw new Error('Song URL is undefined');
    }
    
    console.log('Attempting to stream URL:', song.url);
    const stream = await play.stream(song.url);
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
      inlineVolume: true,
    });

    resource.volume.setVolume(0.5);

    serverQueue.player.play(resource);

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🎶 Now Playing')
      .setDescription(`**${song.title}**`)
      .addFields({ name: 'Duration', value: formatDuration(song.duration), inline: true })
      .setFooter({ text: `Requested by ${song.requester}` });

    serverQueue.textChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Play song error:', error);
    serverQueue.textChannel.send('❌ Error playing the song! Skipping to next...');
    serverQueue.songs.shift();
    if (serverQueue.songs.length > 0) {
      playSong(guild, serverQueue.songs[0], queue);
    } else {
      if (serverQueue.connection) {
        serverQueue.connection.destroy();
      }
      queue.delete(guild.id);
    }
  }
}

function pauseCommand(message, args, queue) {
  const serverQueue = queue.get(message.guild.id);
  if (!serverQueue) {
    return message.reply('❌ There is nothing playing!');
  }
  
  if (!message.member.voice.channel) {
    return message.reply('❌ You need to be in the voice channel to pause!');
  }

  serverQueue.player.pause();
  message.reply('⏸️ Paused the music!');
}

function resumeCommand(message, args, queue) {
  const serverQueue = queue.get(message.guild.id);
  if (!serverQueue) {
    return message.reply('❌ There is nothing playing!');
  }

  if (!message.member.voice.channel) {
    return message.reply('❌ You need to be in the voice channel to resume!');
  }

  serverQueue.player.unpause();
  message.reply('▶️ Resumed the music!');
}

function stopCommand(message, args, queue) {
  const serverQueue = queue.get(message.guild.id);
  if (!serverQueue) {
    return message.reply('❌ There is nothing playing!');
  }

  if (!message.member.voice.channel) {
    return message.reply('❌ You need to be in the voice channel to stop!');
  }

  serverQueue.songs = [];
  serverQueue.player.stop();
  if (serverQueue.connection) {
    serverQueue.connection.destroy();
  }
  queue.delete(message.guild.id);
  message.reply('⏹️ Stopped the music and cleared the queue!');
}

function skipCommand(message, args, queue) {
  const serverQueue = queue.get(message.guild.id);
  if (!serverQueue) {
    return message.reply('❌ There is nothing playing!');
  }

  if (!message.member.voice.channel) {
    return message.reply('❌ You need to be in the voice channel to skip!');
  }

  serverQueue.player.stop();
  message.reply('⏭️ Skipped the song!');
}

function queueCommand(message, args, queue) {
  const serverQueue = queue.get(message.guild.id);
  if (!serverQueue || serverQueue.songs.length === 0) {
    return message.reply('❌ The queue is empty!');
  }

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
  if (!serverQueue) {
    return message.reply('❌ There is nothing playing!');
  }

  if (!message.member.voice.channel) {
    return message.reply('❌ You need to be in the voice channel to clear the queue!');
  }

  const currentSong = serverQueue.songs[0];
  serverQueue.songs = [currentSong];
  message.reply('🗑️ Cleared the queue! Current song will continue playing.');
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

module.exports = {
  play: playCommand,
  pause: pauseCommand,
  resume: resumeCommand,
  stop: stopCommand,
  skip: skipCommand,
  queue: queueCommand,
  clear: clearCommand,
};
