const OpenAI =  require("openai");
require("dotenv").config();
const axios = require("axios");
const { getTweets, getNewTweetsFromId } = require("./db/api/tweets");
const { getSlimeBalance } = require("./utils/web3");
const { sleep } = require("./utils/helper");
const { userLike, userRetweet, userTweet, userQuoteTweet, userReply } = require("./utils/twitter");
// const { zodResponseFormat } = require("openai/helpers/zod");
// const { z } = require("zod");

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "X-Title": "Slime Bot"
    }
});

// const OperateType = z.object({
//     type: z.enum(["post", "retweet", "like", "comment", "quote"]),
//     content: z.string().optional(),
//     tweetId: z.string().optional(),
//     likeScore: z.number().optional(),
// });

async function agentUseOpenRouter() {
    let prompt = `
       You are a tabby slime bot. And created a Slime community on Twitter, your twitter id is @Slime_TipTag(1846600810719072256). You know more information about Slime game/Slime coin/Slime culture.
       And you are good at using Twitter to operate crypto community.
       You created a crypto coin named Slime(Contract address:0x68503A15efD0D2F81D185a07d60Ed9Ac2a66B59e) on Base chain use TipTag platform.
       The TipTag platform is a tool that allows you to create a crypto coin using bonding curve. When contract received 10 ETH, it will automatically list with 15% of total supply Slime coin to the Uniswap V2(Slime has been listed).
       10% of total supply is 100,000,000 Slime coins will be distributed to the community members.
       It will last 100 days to distribute the Slime coins(every day distribute 0.1% of total supply) through twitter curation like this:
        - User post a tweet with #Slime tag in the tweet.
        - User who hold $Slime coin to curate(twitter like operation) the post.
        - Every day, all the tweets curated by the users who hold $Slime coin will carve up the 0.1% Slime coins(author will get 50% and the users who curate will get 50%).
        - The more $Slime user hold, the more curation reward will get.
       Now you will operate the Twitter account to increase the community's engagement. Your purpose is to increase the community members and make the community more active. And you need to make the more $Slime holders to curate your tweets to earn more Slime or you can curate the tweets those good for the community.
       I will give you more tweets content those created by the community members and you will know what happened in the community.
       Then you will give me some suggestions to how to operate the Twitter account like post, quote, retweet, like, comment.
       The tweets those I give you are JSON format like this:
       [
        {
            "content": "content",
            "tweetId": "tweetId",
            "quoteId": "quoteId",
            "twitterId": "twitterId",
            "createAt": "createAt",
            "slimeBalance": "slimeBalance"
        }
       ]
        If the quoteId is not null, it means the tweet is a quote tweet and the quoteId is the tweetId of the original tweet.
        After you learn the tweets, you must do nothing or chose one of the following suggestions to operate the Twitter account like this:
        [
            {
                "type": "post",
                "content": "content"
            },
            {
                "type": "retweet",
                "tweetId": "tweetId"
            },
            {
                "type": "like",
                "tweetId": "tweetId",
                "likeScore": "likeScore"
            },
            {
                "type": "comment",
                "tweetId": "tweetId",
                "content": "content"
            },
            {
                "type": "quote",
                "tweetId": "tweetId",
                "content": "content"
            },
            null
        ]
        The weights of these operations are: post: 12, comment: 9, quote: 8, like: 5, null: 5, retweet: 1. The bigger the weight, the more likely to be chosen.
        The Tweet content length must less than 280 bytes in post/quote/comment action.
        The like operation has a likeScore, it means how much you like the tweet, the score should be between 1 and 10, it must be an integer.
        If you don't have any suggestions, you can say "null".
        You only need to give me the JSON Object(not array) or 'null', don't need to say anything else.
        The following is the tweets content:
    `
    // get tweets from db
    let tweets = await getTweets(15);
    let balances = await getSlimeBalance(tweets.map(tweet => tweet.ethAddr));
    tweets.forEach(tweet => {
        tweet.slimeBalance = balances[tweet.ethAddr] ?? 0;
    });
    prompt = prompt + JSON.stringify(tweets);

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: prompt }
        ]
    });
    console.log(response.choices[0].message.content);
    // await sleep(300);
    // let lastId = tweets[tweets.length - 1].id;
    // while(true) {
    //     // get new tweets
    //     let newTweets = await getNewTweetsFromId(lastId)
    //     if (newTweets.length > 0) { 
    //         lastId = newTweets[newTweets.length - 1].id;
    //         let balances = await getSlimeBalance(newTweets.map(tweet => tweet.ethAddr));
    //         newTweets.forEach(tweet => {
    //             tweet.slimeBalance = balances[tweet.ethAddr] ?? 0;
    //         });
    //         const content = JSON.stringify(newTweets);
    //         let response = await openai.chat.completions.create({
    //             model: "gpt-4o-mini",
    //             messages: [
    //                 { role: "user", content }
    //             ],
    //         });
    //         const result = response.choices[0].message.content;
    //         console.log(result);
    //         if (result !== "null") {
    //             // analyze the result
    //             let actions = JSON.parse(result);
    //             for (let action of actions) {
    //                 await handleAction(action);
    //             }
    //         }
    //     }
    //     await sleep(600);
    // }
}

async function handleAction(action) {
    console.log(action);
    switch (action.type) {
        case "post":
            return await userTweet(action.content);
        case "retweet":
            return await userRetweet(action.tweetId);
        case "like":
            return await userLike(action.tweetId, action.likeScore);
        case "comment":
            return await userReply(action.tweetId, action.content);
        case "quote":
            return await userQuoteTweet(action.tweetId, action.content);
    }
}

agentUseOpenRouter();
