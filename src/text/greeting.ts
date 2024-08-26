import { Context } from 'telegraf';
import createDebug from 'debug';

const debug = createDebug('bot:greeting_text');

const replyToMessage = (ctx: Context, messageId: number, string: string) =>
  ctx.reply(string, {
    reply_parameters: { message_id: messageId },
  });

const greeting = () => async (ctx: Context) => {
  debug('Triggered "greeting" text command');

  const messageId = ctx.message?.message_id;
  const firstName = ctx.message?.from.first_name;
  const lastName = ctx.message?.from.last_name;

  // Tampilkan nama lengkap jika ada lastName, jika tidak, hanya nama depan
  const userName = lastName ? `${firstName} ${lastName}` : firstName;

  if (messageId) {
    await replyToMessage(ctx, messageId, `Hello, ${userName}!`);
  }
};

export { greeting };