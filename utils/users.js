const os = require('os')
const path = require('path')
const fs = require("fs")
const CryptoBox = require(path.join(castleModuleDir, "utils/cryptobox"))

const userListFile = "keys2The.cstl";
const certDir = path.join(os.homedir(), ".git-castle")

function getUserList() {
    try {
        return JSON.parse(readFromGitCastle(userListFile))
    } catch (err) {
        return {}
    }
}

function getMasterKey() {

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

exports.linkUser = (username, rsaPublicKey, allowMasterKeyCreation = false) => {
    // adds the user, the user's RSA public key, and an encrypted copy of the masterKey to .gitcastle
    const currUser = getCurrentUser();
    if (!currUser) {
        throw new Error("You must add yourself to git-castle before adding other users. Please run 'git-castle add-user {YOUR_USERNAME}'")
    }

    const currUserRecord = exports.getUser(currUser)
    var unencryptedMasterKey = null;
    if (!currUserRecord) {
        console.log("Generating Fresh Encryption Key.")
        unencryptedMasterKey = CryptoBox.generateSymmetricKey();
        console.log("Generated " + unencryptedMasterKey)
    } else {
        // load the encryptedMasterKey using local credentials and decrypted it
        const privateKey = fs.readFileSync(path.join(certDir, `${username}.cstl`)).toString()
        const userEncryptedKey = readFromGitCastle(`keys/${currUserRecord["ecdh"]}`)

        unencryptedMasterKey = CryptoBox.rsaDecrypt(Buffer.from(userEncryptedKey), privateKey)
        console.log(unencryptedMasterKey)
    }

    
    
    // encrypt the MasterKey with the user's RSA public key
    const encryptedMasterKey = CryptoBox.rsaEncrypt(unencryptedMasterKey, rsaPublicKey)
    console.log("Encrypted to" + encryptedMasterKey)
    
    const masterKeyFile = CryptoBox.randomKeyFile();
    const publicKeyFile = CryptoBox.randomKeyFile() + ".pub";
    // store the encrypted master key
    writeToGitCastle(path.join("keys", masterKeyFile), encryptedMasterKey);
    writeToGitCastle(path.join("users", publicKeyFile), rsaPublicKey);
    // store the user's RSA key
    var users = getUserList()
    users[username] = {
        "ecdh": masterKeyFile,
        "rsa": publicKeyFile
    }

    // store the user record
    writeToGitCastle(userListFile, JSON.stringify(users))


}

const currUserFile = "currUser.txt"
function addCurrentUserToRepoGitCastle(username) {
    writeToGitCastle(currUserFile, username)
    writeToGitCastle(".gitignore", currUserFile)
}
function getCurrentUser() {
    return readFromGitCastle(currUserFile)
}

exports.linkLocalUser = (username) => {
    const rsaPublicKeyFile = path.join(certDir, `${username}.cstl.pub`)

    if (fs.existsSync(rsaPublicKeyFile)) {
        // load the public key and link the user
        const rsaPublicKey = fs.readFileSync(rsaPublicKeyFile);
        console.log(`Detected existing RSA keys for ${username}.`)
        console.log(`Adding ${username} to .git-castle using credentials in ${rsaPublicKeyFile}.`)

        addCurrentUserToRepoGitCastle(username)
        return exports.linkUser(username, rsaPublicKey, true)
    } else {
        if (!fs.existsSync(certDir)) {
            fs.mkdirSync(certDir)
        }
        const rsaPrivateKeyFile = path.join(certDir, `${username}.cstl`)

        console.log("Generating secure keys...")
        const { publicKey, privateKey } = CryptoBox.generateRSAKeys()
        fs.writeFileSync(rsaPublicKeyFile, publicKey)
        fs.writeFileSync(rsaPrivateKeyFile, privateKey)
        addCurrentUserToRepoGitCastle(username)
        console.log(`Adding ${username} to .git-castle using credentials in ${rsaPublicKeyFile}.`)
        return exports.linkUser(username, publicKey, true)
    }
}