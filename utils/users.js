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
    const encryptedKeyFile = `keys/${exports.getUser(username)["ecdh"]}`

    console.log("Decrypting masterkey " + encryptedKeyFile + " using " + rsaPrivateKeyFile)

    try {
        return CryptoBox.rsaDecrypt(readFromGitCastle(encryptedKeyFile), fs.readFileSync(rsaPrivateKeyFile))
    } catch (err) {
        return null
    }
}


exports.linkUser = (username, rsaPublicKey) => {
    // adds the user, the user's RSA public key, and an encrypted copy of the masterKey to .gitcastle

    const currUser = getCurrentUser();
    if (!currUser) {
        throw new Error("You must add yourself to git-castle before adding other users. Please run 'git-castle add-user {YOUR_USERNAME}'")
    }

    const currUserRecord = exports.getUser(currUser)
    var unencryptedMasterKey = null;
    
    if (Object.keys(getUserList()).length == 0) {
        unencryptedMasterKey = CryptoBox.generateSymmetricKey();
        console.log("Generate New Master ECDH Key.")
    } else {
        // load the encryptedMasterKey using local credentials and decrypted it
        const rsaPrivateKeyFile = path.join(certDir, `${currUser}.cstl`)
        const encryptedKeyFile = `keys/${currUserRecord["ecdh"]}`

        console.log("Decrypting masterkey " + encryptedKeyFile + " using " + rsaPrivateKeyFile)

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

    console.log(`Added ${username} to the list of trusted viewers.\n\n`)
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

exports.linkLocalUser = (username) => {
    const rsaPublicKeyFile = path.join(certDir, `${username}.cstl.pub`)
    var publicKey = null;
    var privateKey = null;

    if (fs.existsSync(rsaPublicKeyFile)) {
        // load the public key and link the user
        publicKey = fs.readFileSync(rsaPublicKeyFile);
        console.log(`Detected existing RSA keys for ${username}.`)
        console.log(`Adding ${username} to .git-castle using credentials in ${rsaPublicKeyFile}.\n\n`)

        
    } else {
        if (!fs.existsSync(certDir)) {
            fs.mkdirSync(certDir)
        }
        const rsaPrivateKeyFile = path.join(certDir, `${username}.cstl`)

        console.log("Generating secure RSA keys...")
        var keys = CryptoBox.generateRSAKeys()
        publicKey = keys.publicKey
        privateKey = keys.privateKey


        console.log("Writing your public key to " + rsaPrivateKeyFile)
        console.log("Writing your private key to " + rsaPrivateKeyFile)
        fs.writeFileSync(rsaPublicKeyFile, publicKey)
        fs.writeFileSync(rsaPrivateKeyFile, privateKey)


        console.log(`Adding ${username} to .git-castle using credentials in ${rsaPublicKeyFile}.\n\n`)
    }

    if (!getCurrentUser()) {
        addCurrentUserToRepoGitCastle(username)
    }
    exports.linkUser(username, publicKey)
    addCurrentUserToRepoGitCastle(username)
}