const prefix = process.env.COMMAND_PREFIX

const ytdl = require("ytdl-core");

const ytsr = require('ytsr')

const queue = new Map()

const fs = require('fs')

const Discord = require('discord.js')

const Extensions = require('../../models/extensions')

const handle = async msg => {
    if (msg.channel.type === "dm") return
    if (msg.author.bot) return;
    if (!msg.content.startsWith(prefix)) return;
    if ((await Extensions.findOne({sid: msg.guild.id})).music) {

        const serverQueue = queue.get(msg.guild.id);

        if (msg.content.startsWith(`${prefix}재생`)) {
            await execute(msg, serverQueue);
        } else if (msg.content.startsWith(`${prefix}스킵`)) {
            skip(msg, serverQueue);
        } else if (msg.content.startsWith(`${prefix}정지`)) {
            stop(msg, serverQueue);
        }
    }
}

async function execute(msg, serverQueue) {
    const args = msg.content.split(" ");
    if (args.length === 1) return

    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel)
        return msg.channel.send(
            "음성 채널에 먼저 들어가주세요!"
        );
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return msg.channel.send(
            "해당 음성 채널에서 말하기 권한이 없습니다."
        );
    }
    let url
    if (args[1].startsWith('http://') || args[1].startsWith('https://')) {
        url = args[1]
    } else {
        await msg.channel.send("검색중...")
        const res = (await ytsr(args.slice(1).join(' '))).items.filter(r => r.type === 'video')
        url = res[0].link
    }

    const songInfo = await ytdl.getInfo(url);
    const song = {
        title: songInfo.title,
        url: songInfo.video_url
    };

    if (!serverQueue) {
        const queueContruct = {
            textChannel: msg.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        queue.set(msg.guild.id, queueContruct);

        song.requester = msg.author

        queueContruct.songs.push(song);

        try {
            queueContruct.connection = await voiceChannel.join();
            play(msg.guild, queueContruct.songs[0]);
        } catch (err) {
            console.log(err);
            queue.delete(msg.guild.id);
            return msg.channel.send(err);
        }
    } else {
        song.requester = msg.author
        serverQueue.songs.push(song);
        return msg.channel.send(`곡 ${song.title} 이(가) 재생목록에 추가되었습니다.`);
    }
}

function skip(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "음성 채널에 먼저 들어가주세요!"
        );
    if (!serverQueue)
        return message.channel.send("건너뛰기 할 수 있는 곡이 없어요!");
    serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "음성 채널에 먼저 들어가주세요!"
        );
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", async () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    let embed = new Discord.MessageEmbed()
    embed.setAuthor(song.requester.tag, song.requester.avatarURL())
    embed.setTitle("플레이 시작")
    embed.addField("곡 정보", song.title)
    serverQueue.textChannel.send(embed);
}

exports.init = function (bot) {
    bot.on('message',async msg => {
        try {
            await handle(msg)
        } catch (e) {
            msg.channel.send(e.message)
        }
    })
}