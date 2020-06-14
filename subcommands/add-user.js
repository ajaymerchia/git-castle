
const path = require('path')
const Users = require(path.join(castleModuleDir, "utils/users"))


function readRSAPublicFile(key_path) {
    // Returns the RSAPublicKey

}

exports.main = (kwargs) => {
    const username = kwargs.username;
    if (!existsInGitCastle("")) {
        throw new Error(`No .git-castle file exists in this repository root. Please run git-castle init`)
    }

    if (Users.existsInRepo(username)) {
        throw new Error(`Could not add duplicate. ${username} already has access.`)
    }

    if (kwargs.key_path) {
        const rsaKey = readRSAPublicFile(kwargs.key_path);
        Users.linkUser(username, rsaKey);
    } else {
        Users.linkLocalUser(username);
    }
}