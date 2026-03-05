import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';
import { Command } from '../types';

function parseSalesFromMessage(content: string): { total: number; count: number } {
  const lineRegex = /^\s*כמה\s*עלה\s*:\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)\s*$/gm;
  let match: RegExpExecArray | null = null;
  let total = 0;
  let count = 0;

  while ((match = lineRegex.exec(content)) !== null) {
    const numericRaw = match[1].replace(/,/g, '');
    const amount = Number.parseInt(numericRaw, 10);

    if (!Number.isSafeInteger(amount) || amount < 0) {
      continue;
    }

    total += amount;
    count += 1;
  }

  return { total, count };
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount);
}

export const totalSalesCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('totalsales')
    .setDescription('סכימת כל המכירות לפי הודעות בערוץ הנוכחי בלבד')
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.inGuild() || !interaction.channel) {
      await interaction.reply({
        content: 'הפקודה זמינה רק בתוך ערוץ טקסט בשרת.',
        ephemeral: true,
      });
      return;
    }

    if (interaction.channel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: 'הפקודה זמינה רק בערוצי טקסט רגילים של השרת.',
        ephemeral: true,
      });
      return;
    }

    const channel = interaction.channel as TextChannel;
    const me = interaction.guild?.members.me;
    const permissions = me ? channel.permissionsFor(me) : null;

    if (!permissions?.has(PermissionFlagsBits.ViewChannel) || !permissions.has(PermissionFlagsBits.ReadMessageHistory)) {
      await interaction.reply({
        content: 'אין לי הרשאה לצפות בערוץ או לקרוא היסטוריית הודעות בחדר הזה.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    try {
      let totalSales = 0;
      let saleCount = 0;
      let before: string | undefined;

      while (true) {
        const page = await channel.messages.fetch({
          limit: 100,
          before,
        });

        if (page.size === 0) {
          break;
        }

        for (const message of page.values()) {
          const parsed = parseSalesFromMessage(message.content);
          totalSales += parsed.total;
          saleCount += parsed.count;
        }

        before = page.last()?.id;
        if (!before) {
          break;
        }
      }

      if (saleCount === 0) {
        await interaction.editReply('לא נמצאו מכירות בחדר הזה');
        return;
      }

      await interaction.editReply(
        `סך כל המכירות בחדר הזה: ₪${formatAmount(totalSales)}\nמספר המכירות שנספרו: ${saleCount}`,
      );
    } catch (error) {
      console.error('Failed to calculate total sales for current channel', error);
      await interaction.editReply('אירעה שגיאה בזמן חישוב המכירות בחדר הזה. נסו שוב.');
    }
  },
};
