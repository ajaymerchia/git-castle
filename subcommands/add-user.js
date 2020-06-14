
const path = require('path')
const fs = require('fs')
const Users = require(path.join(castleModuleDir, "utils/users"))

exports.main = (kwargs) => {
    const username = kwargs.username;
    if (Users.existsInRepo(username)) {
        throw new Error(`Could not add duplicate. ${username} already has access.`)
    }

    if (kwargs.key_path) {
        const rsaKey = fs.readFileSync(kwargs.key_path);
        Users.linkUser(username, rsaKey);
    } else {
        Users.linkLocalUser(username);
    }
}