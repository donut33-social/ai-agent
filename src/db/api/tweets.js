const { execute, emptyOrRow, emptyOrRows } = require("../pool");

const getTweets = async (limit = 100) => {
    const result = await execute(`SELECT t.id, t.tweet_id as tweetId, t.twitter_id as twitterId, t.content, t.retweet_id as quoteId, t.create_at as createAt,
			a.eth_addr as ethAddr FROM tweet as t 
            LEFT JOIN account as a ON t.twitter_id = a.twitter_id
            WHERE t.tick = 'Slime'
            ORDER BY t.id DESC LIMIT ?`, [limit]);
    return emptyOrRows(result);
};

const getNewTweetsFromId = async (id) => {
    const result = await execute(`SELECT t.id, t.tweet_id as tweetId, t.twitter_id as twitterId, t.content, t.retweet_id as quoteId, t.create_at as createAt,
			a.eth_addr as ethAddr FROM tweet as t 
            LEFT JOIN account as a ON t.twitter_id = a.twitter_id
            WHERE t.tick = 'Slime' AND t.id > ?
            ORDER BY t.id DESC`, [id]);
    return emptyOrRows(result);
};

module.exports = {
    getTweets,
    getNewTweetsFromId
};
