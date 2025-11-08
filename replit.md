# Discord Music, Moderation & Fun Bot

## Overview
A feature-rich Discord bot with music playback, server moderation, and fun commands. The bot responds to commands with both `/` and `!t` prefixes.

## Features

### 🎵 Music Playback
Play music from YouTube in voice channels with queue management
- Commands: play, pause, resume, stop, skip, queue, clear

### 🛡️ Server Moderation
Comprehensive moderation tools for managing your server
- Member management: kick, ban, mute, unmute
- Warning system: warn, warnings (track member warnings)
- Message management: purge (bulk delete messages)
- Channel controls: slowmode, lock, unlock

### 🎮 Fun Commands
Interactive entertainment commands for your server
- Games: 8ball, dice, coinflip
- Entertainment: joke, meme
- Information: avatar, userinfo, serverinfo

## Recent Changes
- Added fun commands module (Nov 8, 2025)
- Added advanced moderation commands (warnings, purge, slowmode, lock/unlock)
- Updated help command with all new features
- Fixed userinfo command to handle uncached members
- Initial project setup (Nov 8, 2025)

## Project Architecture
- `index.js`: Main bot entry point and event handlers
- `commands/music.js`: Music playback commands
- `commands/moderation.js`: Moderation and warning system
- `commands/fun.js`: Fun and entertainment commands
- `commands/help.js`: Dynamic help command
- Uses Discord.js v14 with voice support
- play-dl for YouTube audio streaming
- PostgreSQL database available for future persistence

## Configuration
- Bot token: DISCORD_TOKEN environment variable
- Command prefixes: `/` and `!t`
- Database: PostgreSQL (available but not currently used)
