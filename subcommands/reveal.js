
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

    var numDecryptions = 0;

    for (secretFile of secretsManifest) {
        const secretFilePlaintextPath = path.join(appRoot, secretFile)
        const secretFileEncryptedPath = secretFilePlaintextPath + ".secret"

        LOG.info("Decrypting "
            + path.relative(appRoot, secretFileEncryptedPath)
            + " to "
            + path.relative(appRoot, secretFilePlaintextPath)
        )

        fs.writeFileSync(secretFilePlaintextPath, CryptoBox.aesDecrypt(fs.readFileSync(secretFileEncryptedPath), masterKey))
        numDecryptions += 1
    }

    LOG.success(`Decrypted ${numDecryptions} files`)


}