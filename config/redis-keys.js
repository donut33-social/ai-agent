require("dotenv").config();
const KeyPrefix = "tiptag-";

module.exports = {
    UserAuthKeyPre: KeyPrefix + process.env.UserAuthKeyPre,
}