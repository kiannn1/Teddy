# Discord Music & Moderation Bot

## Overview
A Discord bot with music playback and server moderation capabilities. The bot responds to commands with both `/` and `!t` prefixes.

## Features
- **Music Playback**: Play music from YouTube in voice channels
  - Commands: play, pause, resume, stop, skip, queue, clear
- **Server Moderation**: Manage server members
  - Commands: kick, ban, mute, unmute
- **Help System**: Display all available commands

## Recent Changes
- Initial project setup (Nov 8, 2025)
- Discord bot structure with dual prefix support
- Music and moderation command implementation

## Project Architecture
- `index.js`: Main bot entry point and event handlers
- `commands/`: Command modules (music and moderation)
- Uses Discord.js v14 with voice support
- play-dl for YouTube audio streaming

## Configuration
- Bot token managed via Discord integration
- Command prefixes: `/` and `!t`
