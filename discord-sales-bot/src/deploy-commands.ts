import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commands } from './commands';

const tokenEnv = process.env.DISCORD_TOKEN;
const clientIdEnv = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!tokenEnv) {
  throw new Error('Missing DISCORD_TOKEN in environment variables.');
}

if (!clientIdEnv) {
  throw new Error('Missing DISCORD_CLIENT_ID in environment variables.');
}

const token = tokenEnv;
const clientId = clientIdEnv;

const rest = new REST({ version: '10' }).setToken(token);
const commandPayload = commands.map((command) => command.data.toJSON());

async function deployCommands(): Promise<void> {
  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commandPayload,
    });
    console.log(`Deployed ${commandPayload.length} guild command(s) to guild ${guildId}.`);
    return;
  }

  await rest.put(Routes.applicationCommands(clientId), { body: commandPayload });
  console.log(`Deployed ${commandPayload.length} global command(s).`);
}

deployCommands().catch((error) => {
  console.error('Failed to deploy commands', error);
  process.exitCode = 1;
});
