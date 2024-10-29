const log4js = require('../utils/logger');
const redis = require('redis');
const { REDIS_EXPIRE_TIME, REDIS_PWD, REDIS_HOST, REDIS_PORT } = require("../../config/db");

const REDIS_KEY = "RedisPrimaryKey";

const logger = log4js.getLogger('db');

// var client = redis.createClient({
//   url: `redis://:${REDIS_PWD}@${REDIS_HOST}:${REDIS_PORT}`
// });
var client = redis.createClient('6379', 'localhost')
client.connect();

client.on("connect", function () {
  logger.info("Connected to the Redis.");
}).on("error", function (err) { console.error("Connect to the Redis failed.", err); });

/**
 * Get the primary key of redis.
 * @returns An integer number.
 */
async function getKey() {
  let key;
  try {
    key = await client.incr(REDIS_KEY);
  } catch (error) {
    logger.error("Get the primary key failed", error);
    throw error;
  }
  return key;
}

async function incrKey(key) {
  try {
    return await client.incr(key)
  } catch (e) {
    logger.error("Get the primary key failed", error);
    throw error;
  }
}

async function decrKey(key) {
  try {
    return await client.decr(key)
  } catch (e) {
    logger.error("Get the primary key failed", error);
    throw error;
  }
}


async function get(key) {
  return await client.get(key)
}

/**
 * set user register pwd, will clear after a while
 * @param {*} key 
 * @param {*} value 
 * @returns 
 */
async function set(key, value, needExpire = true) {
  try {
    await client.set(key, value);
    if (needExpire) {
      if (typeof(needExpire) === 'number') {
        await client.expire(key, needExpire);
      }else {
        await client.expire(key, REDIS_EXPIRE_TIME);
      }
    }
  } catch (error) {
    logger.error(`Set value into Redis failed. Key: ${key}, Value: ${value}`);
    throw error;
  }
  return;
}

async function del(key) {
  try {
    await client.del(key);
  } catch (error) {
    logger.error(`Delete the key[${key}] from Redis failed.`);
    throw error;
  }
  return;
}

async function rPush(key, value) {
  try {
    await client.rPush(key, value);
  } catch (error) {
    logger.error(`lPush the key[${key}] from Redis failed.`);
    throw error;
  }
}

async function lPop(key) {
  try {
    return await client.lPop(key);
  } catch (error) {
    logger.error(`rPop the key[${key}] from Redis failed.`);
    throw error;
  }
}

async function sAdd(key, ...value) {
  try {
    await client.sAdd(key, value);
  } catch (error) {
    logger.error(`sadd the key [${key}] from Redis fail`, error)
  }
}

async function sMembers (key) {
  try {
    const members = await client.sMembers(key);
    return members
  } catch (error) {
    logger.error(`smembers the key[${key}] from Redis failed.`, error);
  }
}

async function getByPattern(pattern, callback) {
  let cursor = '0';
    do {
      const [newCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 200);
      cursor = newCursor;
      if (keys.length > 0) {
        const values = await client.mGet(keys);
        await callback(_.zipObject(keys, values));
      }
    } while (cursor !== '0');
}

async function deleteKeysByPattern(pattern) {
  let cursor = '0';
    do {
      const [newCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 300);
      cursor = newCursor;
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } while (cursor !== '0');
}

async function zAdd(key, score, value) {
  try {
    await client.zAdd(key, {score, value})
  } catch (error) {
    logger.error(`zadd the key[${key}] to Redis failed.`, error);
  }
}

async function zRangeByScore(key, from, to) {
  try {
    return await client.zRangeByScore(key ,from, to) // zrangebyscore('key', minScore, '+inf')
  } catch (error) {
    logger.error('zRangeByScore fail', error)
  }
}

async function zRemRangeByScore(key, from, to) {
  try {
    await client.zRemRangeByScore(key, from, to);
  } catch (error) {
    logger.error('zRemRangeByScore fail', error)
  }
}

async function zRange(key, from, to) {
  try {
    return await client.zRange(key, from, to);
  } catch (error) {
    logger.error('zRange fail', error)
  }
}

module.exports = {
  getKey,
  get,
  set,
  del,
  rPush,
  lPop,
  incrKey,
  decrKey,
  sAdd,
  sMembers,
  getByPattern,
  deleteKeysByPattern,
  zAdd,
  zRangeByScore,
  zRemRangeByScore,
  zRange,
  client
};
