const OpenAI =  require("openai");
require("dotenv").config();
const axios = require("axios");
const { getTweets, getNewTweetsFromId } = require("./db/api/tweets");
const { getSlimeBalance } = require("./utils/web3");
const { sleep } = require("./utils/helper");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function agentUseOpenAI() {
    let prompt = `
       You are a tabby slime bot. And create a Slime community on Twitter. You know more information about Slime game/Slime coin/Slime culture.
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
        After you learn the tweets, you will give me some suggestions like this:
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
            }
        ]
        The Tweet content length must less than 280 bytes in post/quote/comment action.
        The like operation has a likeScore, it means how much you like the tweet, the score should be between 1 and 10, it must be an integer.
        You can only choose one type or none from the above types, If you don't have any suggestions, you can give me "null".
        The following is the tweets content:
    `
    // get tweets from db
    let tweets = await getTweets(200);
    let balances = await getSlimeBalance(tweets.map(tweet => tweet.ethAddr));
    tweets.forEach(tweet => {
        tweet.slimeBalance = balances[tweet.ethAddr] ?? 0;
    });
    prompt = prompt + JSON.stringify(tweets);

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: prompt }
        ],
    });
    console.log(response.choices[0].message.content);
    await sleep(300);
    let lastId = tweets[tweets.length - 1].id;
    while(true) {
        // get new tweets
        let newTweets = await getNewTweetsFromId(lastId)
        if (newTweets.length > 0) { 
            lastId = newTweets[newTweets.length - 1].id;
            let balances = await getSlimeBalance(newTweets.map(tweet => tweet.ethAddr));
            newTweets.forEach(tweet => {
                tweet.slimeBalance = balances[tweet.ethAddr] ?? 0;
            });
            const content = JSON.stringify(newTweets);
            let response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "user", content }
                ],
            });
            const result = response.choices[0].message.content;
            console.log(result);
            if (result !== "null") {
                // analyze the result
                let actions = JSON.parse(result);
                for (let action of actions) {
                    await handleAction(action);
                }
            }
        }
        await sleep(600);
    }
}

async function handleAction(action) {
    console.log(action);
    switch (action.type) {
        case "post":
            await postTweet(action.content);
            break;
        case "retweet":
            await retweet(action.tweetId);
            break;
        case "like":
            await like(action.tweetId, action.likeScore);
            break;  
        case "comment":
            await comment(action.tweetId, action.content);
            break;
        case "quote":
            await quote(action.tweetId, action.content);
            break;
    }
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

agentUseOpenAI();
