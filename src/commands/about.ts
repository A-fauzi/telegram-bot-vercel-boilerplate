import { Context } from 'telegraf';
import createDebug from 'debug';

import { author, name, version, description, homepage } from '../../project-info.json';

const debug = createDebug('bot:about_command');

const about = () => async (ctx: Context) => {
  const message = `
*🤖 Welcome to ${name} v${version}!*

${description} - A powerful and easy-to-use Telegram Bot.

🚀 *Features*:
- Automated reminders.
- Task management.
- Customizable alerts.

👨‍💻 *Developed by*: [${author}](${homepage})

Thank you for using *${name}*! Feel free to visit our [homepage](${homepage}) for more information.
  `;

  debug(`Triggered "about" command with message \n${message}`);
  
  await ctx.replyWithMarkdownV2(message.trim(), { parse_mode: 'Markdown' });
};

export { about };