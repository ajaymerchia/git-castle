const path = require('path')
const fs = require("fs")
const CryptoBox = require(path.join(castleModuleDir, "utils/cryptobox"))

const userListFile = "keys2The.cstl";

function getUserList() {
    try {
        return JSON.parse(readFromGitCastle(userListFile))
    } catch (err) {
        return {}
    }
}

exports.existsInRepo = (username) => {
    return existsInGitCastle(userListFile) && (username in getUserList())
}

exports.getUser = (username) => {
    // return the username and RSA public key
    if (exports.existsInRepo(username)) {
        return getUserList()[username]
    } else {
        return null;
    }

}
exports.getDecryptedKey = (username) => {
    const rsaPrivateKeyFile = path.join(certDir, `${username}.cstl`)
    LOG.debug(`Decrypting as ${username}: ` + JSON.stringify(exports.getUser(username)))
    const encryptedKeyFile = `keys/${exports.getUser(username)["ecdh"]}`

    LOG.debug("Decrypting masterkey " + encryptedKeyFile + " using " + rsaPrivateKeyFile)

    try {
        return CryptoBox.rsaDecrypt(readFromGitCastle(encryptedKeyFile), fs.readFileSync(rsaPrivateKeyFile))
    } catch (err) {
        return null
    }
}


exports.linkUser = (username, rsaPublicKey) => {
    // adds the user, the user's RSA public key, and an encrypted copy of the masterKey to .gitcastle
    if (exports.existsInRepo(username)) {
        throw new Error(`Could not add duplicate. ${username} already has access.`)
    }

    const currUser = getCurrentUser();
    if (!currUser) {
        throw new Error("You must add yourself to git-castle before adding other users. Please run 'git-castle add-user {YOUR_USERNAME}'")
    }

    const currUserRecord = exports.getUser(currUser)
    var unencryptedMasterKey = null;
    
    if (Object.keys(getUserList()).length == 0) {
        unencryptedMasterKey = CryptoBox.generateSymmetricKey();
        LOG.info("Generate New Master ECDH Key.")
    } else {
        // load the encryptedMasterKey using local credentials and decrypted it
        const rsaPrivateKeyFile = path.join(certDir, `${currUser}.cstl`)
        const encryptedKeyFile = `keys/${currUserRecord["ecdh"]}`

        LOG.debug("Decrypting masterkey " + encryptedKeyFile + " using " + rsaPrivateKeyFile)

        unencryptedMasterKey = CryptoBox.rsaDecrypt(readFromGitCastle(encryptedKeyFile), fs.readFileSync(rsaPrivateKeyFile))
    }
    const masterKeyFile = CryptoBox.randomKeyFile();
    const publicKeyFile = CryptoBox.randomKeyFile() + ".pub";
    
    // encrypt the MasterKey with the user's RSA public key
    const encryptedMasterKey = CryptoBox.rsaEncrypt(unencryptedMasterKey, rsaPublicKey)
    // store the encrypted master key
    writeToGitCastle(path.join("keys", masterKeyFile), encryptedMasterKey);
    writeToGitCastle(path.join("users", publicKeyFile), rsaPublicKey);

    // store the user's RSA key
    var users = getUserList()
    users[username] = {
        "ecdh": masterKeyFile,
        "rsa": publicKeyFile
    }

    LOG.success(`Added ${username} to the list of trusted viewers.\n\n`)
    // store the user record
    writeToGitCastle(userListFile, JSON.stringify(users))


}

const currUserFile = "currUser.txt"
exports.setUser = (username) => {
    writeToGitCastle(currUserFile, username)
}
function addCurrentUserToRepoGitCastle(username) {
    writeToGitCastle(currUserFile, username)
    writeToGitCastle(".gitignore", currUserFile)
}
function getCurrentUser() {
    try {
        return readFromGitCastle(currUserFile)
    } catch (err) {
        return null
    }
}
exports.getCurrentUsername = () => {
    return getCurrentUser()
}

exports.generateUserKeys = (username, rsaPublicKeyFile = null) => {
    const { publicKey, privateKey } = CryptoBox.generateRSAKeys()
    if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir)
    }

    if (!rsaPublicKeyFile) {
        rsaPublicKeyFile = path.join(certDir, `${username}.cstl.pub`)
    }
    if (!rsaPublicKeyFile.endsWith(".cstl.pub")) {
        throw new Error(`Invalid Public Key Extension. Must end with '.cstl.pub'`)
    }

    const rsaPrivateKeyFile = path.join(certDir, `${username}.cstl`)

    LOG.info("Writing your public key to " + rsaPublicKeyFile)
    LOG.info("Writing your private key to " + rsaPrivateKeyFile)
    fs.writeFileSync(rsaPublicKeyFile, publicKey)
    fs.writeFileSync(rsaPrivateKeyFile, privateKey)

    return publicKey
}

exports.linkLocalUser = (username) => {
    const rsaPublicKeyFile = path.join(certDir, `${username}.cstl.pub`)
    var publicKey = null;

    if (fs.existsSync(rsaPublicKeyFile)) {
        // load the public key and link the user
        publicKey = fs.readFileSync(rsaPublicKeyFile);
        LOG.debug(`Detected existing RSA keys for ${username}.`)
    } else {
        publicKey = exports.generateUserKeys(username, rsaPublicKeyFile)
    }
    LOG.info(`Adding ${username} to .git-castle using credentials in ${rsaPublicKeyFile}.`)


    if (!getCurrentUser()) {
        addCurrentUserToRepoGitCastle(username)
    }
    exports.linkUser(username, publicKey)
    addCurrentUserToRepoGitCastle(username)
}