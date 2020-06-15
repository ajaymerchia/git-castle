
const path = require('path')
const fs = require('fs')
const Users = require(path.join(castleModuleDir, "utils/users"))
const CryptoBox = require(path.join(castleModuleDir, "utils/cryptobox"))


exports.main = (ignored) => {
    const currUsername = Users.getCurrentUsername()
    if (!currUsername) {
        throw new Error("Please login (git-castle login) or add a user (git-castle add-user -u username).")
    }
    const masterKey = Users.getDecryptedKey(currUsername)
    
    var secretsManifest = []
    try {
        secretsManifest = fs.readFileSync(gitCastleSecrets).toString().split("\n")
    } catch (err) {
        // ignore
    }

    var numchanges = 0;

    for (secretFile of secretsManifest) {
        if (secretFile.trim() == "") {
            continue
        }
        LOG.debug(`Locking down ${secretFile}`)

        const secretFilePlaintextPath = path.join(appRoot, secretFile)
        const secretFileEncryptedPath = secretFilePlaintextPath + ".secret"

        if (fs.existsSync(secretFileEncryptedPath)) {
            const existingContents = CryptoBox.aesDecrypt(fs.readFileSync(secretFileEncryptedPath), masterKey)
            const hasChanged = (existingContents !== fs.readFileSync(secretFilePlaintextPath).toString())
            if (!hasChanged) {
                LOG.info(`Skipping ${secretFile}. Contents have not changed.`)
                continue
            }
        }
        LOG.info("Encrypting "
            + path.relative(appRoot, secretFilePlaintextPath)
            + " to "
            + path.relative(appRoot, secretFileEncryptedPath)
        )
        
        fs.writeFileSync(secretFileEncryptedPath, CryptoBox.aesEncrypt(fs.readFileSync(secretFilePlaintextPath), masterKey))
        numchanges += 1;
    }

    return numchanges;

}