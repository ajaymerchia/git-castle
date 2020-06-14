const path = require('path');
const fs = require('fs')
const Users = require(path.join(castleModuleDir, "utils/users"))

exports.main = (kwargs) => {
    const username = kwargs.username
    // check that user private key exists
    if (!fs.existsSync(path.join(certDir, `${username}.cstl`))) {
        throw new Error(`Credentials for ${username} do not exist locally.`)
    }
    
    // check that the user has access
    if (!Users.existsInRepo(username)) {
        throw new Error(`Can not login. ${username} does not have access to this repository`)
    }
    // check that the user can decrypt the master key
    if (!Users.getDecryptedKey(username)) {
        throw new Error(`Cryptographic Fail! ${username}'s private keys do not work with this repository.`)
    }

    // overwrite the current user file
    Users.setUser(username)
    LOG.success(`Logged in as ${username}`)

}