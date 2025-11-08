# Discord Music, Moderation & Fun Bot

A feature-rich Discord bot that provides music playback from YouTube, comprehensive server moderation tools, and fun interactive commands.

## Features

### 🎵 Music Commands
- Play music from YouTube in voice channels
- Queue management system
- Full playback controls (pause, resume, skip, stop)

### 🛡️ Moderation Commands
- **Member Management**: Kick, ban, timeout members
- **Warning System**: Track and view member warnings
- **Message Management**: Bulk delete messages (1-100)
- **Channel Controls**: Set slowmode, lock/unlock channels
- Permission-based access control

### 🎮 Fun Commands
- **Games**: Magic 8-ball, dice rolling, coin flipping
- **Entertainment**: Random jokes and memes
- **Information**: User avatars, user info, server statistics

## Setup Instructions

1. **Create a Discord Bot**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application" and give it a name
   - Navigate to the "Bot" section and click "Add Bot"
   - Enable these Privileged Gateway Intents:
     - MESSAGE CONTENT INTENT
     - SERVER MEMBERS INTENT

2. **Get Your Bot Token**
   - In the Bot section, click "Reset Token" or "Copy"
   - Add the token to your environment secrets as `DISCORD_TOKEN`

3. **Invite the Bot to Your Server**
   - Go to OAuth2 → URL Generator
   - Select "bot" scope
   - Select permissions (recommended: Administrator for full functionality)
   - Use the generated URL to invite the bot

## Command Prefixes

The bot responds to two command prefixes:
- `/` (slash prefix)
- `!t` (exclamation t prefix)

Examples: `/help` or `!t help`

## Available Commands

### Music Commands

| Command | Description | Example |
|---------|-------------|---------|
| `play <url>` | Play a YouTube video | `/play https://youtube.com/watch?v=...` |
| `pause` | Pause the current song | `/pause` |
| `resume` | Resume playback | `/resume` |
| `stop` | Stop playing and clear queue | `/stop` |
| `skip` | Skip to next song | `/skip` |
| `queue` | Show current music queue | `/queue` |

### Moderation Commands

| Command | Description | Example |
|---------|-------------|---------|
| `kick @user [reason]` | Kick a member | `/kick @user spamming` |
| `ban @user [reason]` | Ban a member | `/ban @user breaking rules` |
| `mute @user [duration] [reason]` | Timeout a member | `/mute @user 10m spam` |
| `unmute @user` | Remove timeout | `/unmute @user` |
| `warn @user [reason]` | Warn a member | `/warn @user inappropriate language` |
| `warnings [@user]` | View warnings | `/warnings @user` |
| `purge <amount>` | Delete messages (1-100) | `/purge 50` |
| `slowmode <seconds>` | Set slowmode (0-21600) | `/slowmode 5` |
| `lock` | Lock the channel | `/lock` |
| `unlock` | Unlock the channel | `/unlock` |

**Duration format:** `10m` (minutes), `2h` (hours), `1d` (days)

### Fun Commands

| Command | Description | Example |
|---------|-------------|---------|
| `8ball <question>` | Ask the magic 8-ball | `/8ball Will it rain today?` |
| `dice [sides]` | Roll a dice (default: 6) | `/dice 20` |
| `coinflip` | Flip a coin | `/coinflip` |
| `joke` | Get a random joke | `/joke` |
| `meme` | Get a random meme | `/meme` |
| `avatar [@user]` | Show user's avatar | `/avatar @user` |
| `userinfo [@user]` | Show user information | `/userinfo @user` |
| `serverinfo` | Show server information | `/serverinfo` |

### Other Commands

| Command | Description |
|---------|-------------|
| `help` | Show all commands |

## Usage Notes

- You must be in a voice channel to use music commands
- Moderation commands require appropriate permissions
- Maximum timeout duration is 28 days
- The bot will automatically leave the voice channel when the queue is empty
- Warnings are stored in memory (reset on bot restart)

## Permissions Required

### For Music:
- Connect to voice channels
- Speak in voice channels

### For Moderation:
- Kick Members (for kick command)
- Ban Members (for ban command)
- Moderate Members (for mute/unmute/warn commands)
- Manage Messages (for purge command)
- Manage Channels (for slowmode/lock/unlock commands)

## Technical Details

Built with:
- Discord.js v14
- @discordjs/voice for audio streaming
- play-dl for YouTube integration
- Node.js 20
- PostgreSQL database (available for future features)

## Support

The bot uses rich embeds for better user experience and includes comprehensive error handling for all commands.
