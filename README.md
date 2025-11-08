# Discord Music & Moderation Bot

A Discord bot that provides music playback from YouTube and server moderation features.

## Features

### 🎵 Music Commands
- Play music from YouTube in voice channels
- Queue management system
- Playback controls (pause, resume, skip, stop)

### 🛡️ Moderation Commands
- Kick and ban members
- Timeout system (mute/unmute)
- Permission-based access control

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
| `clear` | Clear queue (keeps current song) | `/clear` |

### Moderation Commands

| Command | Description | Example |
|---------|-------------|---------|
| `kick @user [reason]` | Kick a member | `/kick @user spamming` |
| `ban @user [reason]` | Ban a member | `/ban @user breaking rules` |
| `mute @user [duration] [reason]` | Timeout a member | `/mute @user 10m spam` |
| `unmute @user` | Remove timeout | `/unmute @user` |

**Duration format:** `10m` (minutes), `2h` (hours), `1d` (days)

### Other Commands

| Command | Description |
|---------|-------------|
| `help` | Show all commands |

## Usage Notes

- You must be in a voice channel to use music commands
- Moderation commands require appropriate permissions
- Maximum timeout duration is 28 days
- The bot will automatically leave the voice channel when the queue is empty

## Permissions Required

### For Music:
- Connect to voice channels
- Speak in voice channels

### For Moderation:
- Kick Members (for kick command)
- Ban Members (for ban command)
- Moderate Members (for mute/unmute commands)

## Technical Details

Built with:
- Discord.js v14
- @discordjs/voice for audio streaming
- play-dl for YouTube integration
- Node.js 20

## Support

The bot is currently running and connected to Discord. All commands use rich embeds for better user experience and include error handling for edge cases.
