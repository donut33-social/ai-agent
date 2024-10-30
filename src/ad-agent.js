const OpenAI =  require("openai");
require("dotenv").config();
const axios = require("axios");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function agentUseOpenAI(content, imagesUrl) {
    const prompt = `
        You are an advertising operator and will receive project description content from different project parties, including image information. You need to summarize the main products of the project from the project party's description content and then create an advertising copy to promote the project party's products.
        Most of these project parties are in the web3 field, please combine more blockchain related directions to generate advertising content.
        The content of the advertisement must be within 280 bytes.
        It can be combined with generating images to achieve the effect of advertising.
        Content may use different languages, please create according to the corresponding language.
    `
    console.log(content, prompt);

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: prompt },
            { role: "user", content: [
                { type: "text", content },
                { type: "image_url", image_url: { url: imagesUrl } },
            ] }
        ],
    });
    console.log(response.choices[0].message.content);
}

async function agentUseRedPill(content, imagesUrl) {
    const prompt = `
        You are an advertising operator and will receive project description content from different project parties, including image information. You need to summarize the main products of the project from the project party's description content and then create an advertising copy to promote the project party's products.
        Most of these project parties are in the web3 field, please combine more blockchain related directions to generate advertising content.
        The content of the advertisement must be within 280 bytes.
        It can be combined with generating images to achieve the effect of advertising.
        Content may use different languages, please create according to the corresponding language.
    `
    console.log(content, prompt);

    try {
        const response = await axios.post("https://api.red-pill.ai/v1/chat/completions", {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: prompt },
                { role: "user", content }
            ],
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY_REDPILL}`
            }
        });
        
        console.log(response.data.choices[0].message, 1);
    } catch (error) {
        console.error("请求失败", error.response.data);
    }
}

agentUseRedPill(`📣Ctalks万圣节主题活动，500U超级抽奖预告
🎙万圣节迷雾猎人：寻找 Web3 潜在宝藏 #Slime #Tiptag
🔥超热：币安 推特 火币 三平台联合直播
🔔推特参与链接：https://t.co/52VJnpzpAV
————————————————————————————————
🎁🎁 500U 超级抽奖🔥🔥

奖励一：100U 推文互动抽奖，100U = 10人 *…`, "https://steemitimages.com/0x0/https://pbs.twimg.com/media/GbGePsyaoAACMxw.jpg");
