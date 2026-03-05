import 'dotenv/config';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { commands } from './commands';
import { Command } from './types';

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('Missing DISCORD_TOKEN in environment variables.');
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commandMap = new Collection<string, Command>();
for (const command of commands) {
  commandMap.set(command.data.name, command);
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = commandMap.get(interaction.commandName);
  if (!command) {
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error while executing /${interaction.commandName}`, error);

    const errorMessage = 'אירעה שגיאה בזמן הרצת הפקודה.';
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(errorMessage).catch(() => undefined);
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true }).catch(() => undefined);
    }
  }
});

client.login(token);
