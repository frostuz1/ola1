const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const googleTTS = require("google-tts-api");
const play = require("play-dl");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});


const token = process.env.DISCORD_TOKEN;
const activePlayers = {};

client.once("ready", () => {
  console.log("Bot online");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("!n ")) {
    if (!message.member.permissions.has("ManageNicknames")) {
      return message.reply("no permisos");
    }

    const args = message.content.slice(3).trim().split(/ +/);
    const member = message.mentions.members.first();

    if (!member) {
      return message.reply("menciona a un usuario");
    }

    const nickname = args.slice(1).join(" ");
    if (!nickname) {
      return message.reply("escribe apodo p");
    }

    try {
      await member.setNickname(nickname);
      await message.react("1402895724521197739");
    } catch (error) {
      console.error(error);
      await message.react("1402906535608188948");
    }
  }

  if (message.content.startsWith("!mimic ")) {
    if (!message.member.permissions.has("ManageWebhooks")) {
      return message.reply("no permisos");
    }

    const args = message.content.slice(7).trim().split(/ +/);
    const mentionedMember = message.mentions.members.first();

    if (!mentionedMember) {
      return message.reply("menciona a tu cacero");
    }

    const messageIndex = args.findIndex(
      (arg) =>
        arg === `<@${mentionedMember.id}>` ||
        arg === `<@!${mentionedMember.id}>`
    );
    const mimicText = args.slice(messageIndex + 1).join(" ");

    if (!mimicText) {
      return message.reply("escribe algo");
    }

    try {
      const webhooks = await message.channel.fetchWebhooks();
      let webhook = webhooks.find((wh) => wh.owner?.id === client.user.id);

      if (!webhook) {
        webhook = await message.channel.createWebhook({
          name: "botmimic",
          avatar: client.user.displayAvatarURL(),
        });
      }

      await message.delete();

      await webhook.send({
        content: mimicText,
        username: mentionedMember.displayName,
        avatarURL: mentionedMember.user.displayAvatarURL({ format: "png" }),
      });
    } catch (err) {
      console.error(err);
      message.channel.send("error nose porque");
    }
  }
});

client.login(token);
