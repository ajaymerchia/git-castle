
const path = require('path')
const fs = require('fs')
const Users = require(path.join(castleModuleDir, "utils/users"))
const CryptoBox = require(path.join(castleModuleDir, "utils/cryptobox"))
var glob = require('glob-fs')();

exports.main = (ignored) => {
    const currUsername = Users.getCurrentUsername()
    if (!currUsername) {
        throw new Error("Please login (git-castle login) or add a user (git-castle add-user -u username).")
    }
    const masterKey = Users.getDecryptedKey(currUsername)

    
    
    var pathSpecs = []
    try {
        pathSpecs = fs.readFileSync(gitCastleSecrets).toString().split("\n")
    } catch (err) {
        // ignore
    }

    var secretsManifest = new Set()

    for (pathSpec of pathSpecs) {
        if (pathSpec.includes("*")) {
            var files = glob.readdirSync(pathSpec);
            LOG.debug(`Resolved ${pathSpec} to [${files}]`)
            for (file of files) {
                secretsManifest.add(file)
            }
        } else {
            secretsManifest.add(pathSpec)
        }
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
        fs.writeFileSync(secretFileEncryptedPath, CryptoBox.aesEncrypt(fs.readFileSync(secretFilePlaintextPath), masterKey), {flag: 'w+'})
        numchanges += 1;
    }

    return numchanges;

}