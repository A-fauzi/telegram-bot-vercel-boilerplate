import { Context, Telegraf } from 'telegraf';
import axios from 'axios';
import createDebug from 'debug';

// Gantilah dengan API key Gemini Anda
const GEMINI_API_KEY = 'AIzaSyA5R4PjUKHFFz4uZhIwHpZQ8V19uSp2JAE';
const debug = createDebug('bot:geminiAi_command');

// Fungsi untuk mengirim permintaan ke Gemini API menggunakan axios
const fetchFromGemini = async (text: string) => {
  try {
    const payload = {
      contents: [
        {
          parts: [
            {
              text
            }
          ]
        }
      ]
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      payload,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching data from Gemini API:', error);
    return { error: 'Failed to fetch data from Gemini API' };
  }
};

// Fungsi untuk memformat pesan
const formatMessage = (text: string): string => {
  let formattedText = '<b>Hasil ✨</b>\n\n';
  const lines = text.split('\n');

  lines.forEach(line => {
    line = line.trim();
    if (line.startsWith('**') && line.endsWith('**')) {
      // Judul utama
      formattedText += `<b>${line.replace(/\*\*/g, '')}</b>\n`;
    } else if (line.startsWith('*')) {
      // Bullet points
      formattedText += `• ${line.substring(1).trim()}\n`;
    } else if (line.includes('**')) {
      // Teks yang di-bold di tengah kalimat
      const parts = line.split('**');
      formattedText += parts.map((part, index) => 
        index % 2 === 1 ? `<b>${part}</b>` : part
      ).join('') + '\n';
    } else {
      // Teks biasa
      formattedText += `${line}\n`;
    }
  });

  return formattedText.trim();
};

// Fungsi untuk perintah /generate
const geminiAi = () => async (ctx: Context) => {
  // Pastikan ctx.message adalah pesan teks
  if (ctx.message && 'text' in ctx.message && ctx.message.text) {
    const inputText = ctx.message.text.split(' ').slice(1).join(' ') || '';

    if (!inputText) {
      return await ctx.reply('Please provide the text after the command. Example: /generate Explain how AI works');
    }

    debug(`Triggered "generate" command with input text: \n${inputText}`);

    // Mengambil respons dari API Gemini
    const geminiResponse = await fetchFromGemini(`${inputText} | Gunakan format yang menarik dengan emoticon yang sesuai untuk setiap daftar list | Jika anda bingung dengan prompt atau jawaban, anda bisa menjawab bahwa anda hanya menyajikan respon dari prompt bukan pertanyaan`);

    // Menyusun pesan berdasarkan respons dari API Gemini
    const message = (() => {
      if (geminiResponse.error) {
        debug(`Error generating content: ${geminiResponse.error}`);
        return `An error occurred while generating content: ${geminiResponse.error}`;
      } else {
        // Mengambil hasil respons dari API Gemini
        const resultText = geminiResponse.candidates[0]?.content?.parts[0]?.text || 'No content generated.';
        debug(`Generated content: \n${resultText}`);
        return formatMessage(resultText);
      }
    })();

    // Kirim pesan dengan format HTML
    try {
      await ctx.replyWithHTML(message);
    } catch (error) {
      console.error('Error sending message:', error);
      await ctx.reply('An error occurred while sending the formatted message. Here is the plain text version:');
      await ctx.reply(message.replace(/<\/?[^>]+(>|$)/g, "")); // Mengirim versi plain text jika HTML gagal
    }

    debug(`Sent formatted message: \n${message}`);
  } else {
    debug('Received non-text message or no message.');
    await ctx.reply('Please send a text message.');
  }
};

export { geminiAi };