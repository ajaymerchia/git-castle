const path = require('path');
const fs = require('fs')
const cryptobox = require(path.join(castleModuleDir, "utils/cryptobox"))

exports.main = (kwargs) => {
    if (fs.existsSync(gitCastleAppDir)) {
        throw new Error("Can not initialize git-castle. Directory already exists. Please delete .git-castle from your repository root.")
    }
    fs.mkdirSync(gitCastleAppDir)
    fs.mkdirSync(path.join(gitCastleAppDir, "keys"))
    fs.mkdirSync(path.join(gitCastleAppDir, "users"))
    
}