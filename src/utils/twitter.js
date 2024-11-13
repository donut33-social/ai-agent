const { Client } = require("twitter-api-sdk");
const { get, set, del } = require("../db/redis");
const log4js = require("../utils/logger");
const { UserAuthKeyPre } = require("../../config/redis-keys");
const logger = log4js.getLogger("twitter");
const { b64uDec } = require("../utils/helper");

const TWITTER_CLIENT_IDS = [
    process.env.TWITTER_CLIENT_ID1,
    process.env.TWITTER_CLIENT_ID2
]

const TWITTER_CLIENT_SECRETS = [
    b64uDec(process.env.TWITTER_CLIENT_SECRET1),
    b64uDec(process.env.TWITTER_CLIENT_SECRET2)
]

const SlimeTwitterId = "1846600810719072256";

async function getAccessToken() {
    let accessToken = await get(UserAuthKeyPre + SlimeTwitterId);
    //{\"token_type\":\"bearer\",\"access_token\":\"UE5Ha3J1YlRNRHZaa29uZ3ByOEI3QUFGS1ZUWkN1R21qb3Zxb2E3M0h3c3BxOjE3MzE0ODM3OTcyMDc6MTowOmF0OjE\",\"scope\":\"follows.read offline.access tweet.write space.read like.write like.read users.read tweet.read follows.write\",\"refresh_token\":\"VzFLelhuM1JUTXBzT0dmbVh6TmxaU28xXzkwN0NYeTFKMnh5NTVBN19SOFpYOjE3MzE0ODM3OTcyMDc6MTowOnJ0OjE\",\"expires_at\":1731490997272,\"twitterId\":\"1846600810719072256\",\"keyIndex\":1}
    if (accessToken) {
        accessToken = JSON.parse(accessToken);
        console.log(accessToken);
        if (accessToken.expires_at > Date.now() - 30000) {
            accessToken = await refreshAccessToken(accessToken);
            if (accessToken) {
                return accessToken.access_token;
            }
        }else {
            return accessToken.access_token;
        }
    }
    logger.info(`accessToken: ${accessToken}`);
}

async function refreshAccessToken(token) {
    const client = await getClient(token.keyIndex, token);
    try {
        const newToken = await client.refreshToken();
        const info = { ...token, ...newToken.token };
        await set(UserAuthKeyPre + token.twitterId, JSON.stringify(info), false);
        return info;
    } catch (error) {
        logger.error(`refreshAccessToken error: ${error}`);
    }
}

const scopes = ["tweet.read", "tweet.write", "users.read", "offline.access", "follows.read", "follows.write", "space.read", "like.read", "like.write"]

let clients = [];
for(let i = 0; i < TWITTER_CLIENT_IDS.length; i++) {
    const c = new auth.OAuth2User({
        client_id: TWITTER_CLIENT_IDS[i],
        client_secret: TWITTER_CLIENT_SECRETS[i],
        callback: process.env.callback,
        scopes
    })
    clients.push(c)
}

async function getClient(index, token) {
    let idx = 0;
    if (index !== null) {
        idx = index;
        if (idx > TWITTER_CLIENT_IDS.length - 1 || idx < 0) idx = 0;
    } else {
        if (currentIndex <= TWITTER_CLIENT_IDS.length - 1) {
            idx = currentIndex;
            currentIndex += 1;
        } else {
            idx = currentIndex = 0;
        }
    }
    if (token) {
        const authClient = new auth.OAuth2User({
            client_id: TWITTER_CLIENT_IDS[idx],
            client_secret: TWITTER_CLIENT_SECRETS[idx],
            callback,
            scopes,
            token
        })
        return { authClient, idx };
    } else {
        const authClient = clients[idx]
        return { authClient, idx };
    }
}

async function userLike(tweetId) {
    const accessToken = await getAccessToken();
    if (!accessToken) {
        return false;
    }
    return new Promise(async (resolve, reject) => {
        try {
            const client = new Client(accessToken);
            const result = await client.tweets.usersIdLike(SlimeTwitterId, { tweet_id: tweetId });
            if (result && result.data) {
                return resolve(result.data);
            }
            return resolve(false);
        } catch (e) {
            resolve(false)
        }
    })
}

async function userRetweet(tweetId) {
    const accessToken = await getAccessToken();
    if (!accessToken) {
        return false;
    }
    return new Promise(async (resolve, reject) => {
        try {
            const clinet = new Client(accessToken);
            const result = await clinet.tweets.usersIdRetweets(SlimeTwitterId, {
                tweet_id: tweetId
            })
            if (result && result.data) {
                return resolve(result.data);
            }
            console.log('Retweet fail:', result);
            return resolve(false)
        } catch (e) {
            console.log('Retweet fail:', e);
            resolve(false)
        }
    })
}

async function userTweet(text) {
    const accessToken = await getAccessToken();
    if (!accessToken) {
        return false;
    }
    return new Promise(async (resolve, reject) => {
        try {
            const client = new Client(accessToken);
            const result = await client.tweets.createTweet({
                text
            })
            if (result && result.data) {
                return resolve(result.data);
            }
            return resolve(false);
        } catch (e) {
            console.log(2, e)
            resolve(false)
        }
    })
}

async function userQuoteTweet(tweetId, text) {
    const accessToken = await getAccessToken();
    if (!accessToken) {
        return false;
    }
    return new Promise(async (resolve, reject) => {
        try {
            const client = new Client(accessToken);
            const result = await client.tweets.createTweet({
                text,
                'quote_tweet_id': tweetId
            })
            if (result && result.data) {
                return resolve(result.data);
            }
            console.log('user quote tweet fail:', result);
            return reject(result);
        } catch (e) {
            console.log('user quote tweet fail:', e);
            reject(e)
        }
    })
}

async function userReply(tweetId, text) {
    const accessToken = await getAccessToken();
    if (!accessToken) {
        return false;
    }
    return new Promise(async (resolve, reject) => {
        try {
            const client = new Client(accessToken);
            const result = await client.tweets.createTweet({
                reply: {
                    in_reply_to_tweet_id: tweetId
                },
                text
            })
            if (result && result.data) {
                return resolve(result.data);
            }
            return resolve(false);
        } catch (e) {
            console.log(532, e);
            resolve(false)
        }
    })
}


module.exports = {
    userLike,
    userRetweet,
    userTweet,
    userQuoteTweet,
    userReply
}