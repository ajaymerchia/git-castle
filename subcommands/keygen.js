const path = require('path');
const fs = require('fs')
const Users = require(path.join(castleModuleDir, "utils/users"))

exports.main = (kwargs) => {
    const username = kwargs.username
    const outfile = kwargs.outfile
    // validate that the user doesn't already exist locally
    if (fs.existsSync(path.join(certDir, `${username}.cstl`))) {
        throw new Error(`Credentials for ${username} already exist`)
    }
    // create the credentials
    Users.generateUserKeys(username, outfile)

}