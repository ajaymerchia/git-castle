const crypto = require('crypto')
const uuid = require('uuid');
const { write } = require('fs');


exports.generateSymmetricKey = () => {
    // return "hello world"
    return crypto.createECDH('secp521r1').generateKeys().toString('hex').slice(0, 512)
}

exports.generateRSAKeys = () => {
    return crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        }
    })
    
}

exports.rsaEncrypt = (plainText, publicKey) => {
    return crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        // We convert the data string to a buffer using `Buffer.from`
        Buffer.from(plainText)
    )
}

exports.rsaDecrypt = (cipherText, privateKey) => {
    return crypto.privateDecrypt(
        {
            key: privateKey,
            // In order to decrypt the data, we need to specify the
            // same hashing function and padding scheme that we used to
            // encrypt the data in the previous step
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, 

            oaepHash: "sha256",
        },
        cipherText
    )
}

exports.randomKeyFile = () => {
    return `${uuid.v4()}.cstl`
}

const data = exports.generateSymmetricKey()
const { publicKey, privateKey } = exports.generateRSAKeys()

// writeToGitCastle("pub", publicKey)
// writeToGitCastle('priv', privateKey)
// writeToGitCastle('data', data)
// const pub2 = readFromGitCastle("pub")
// const priv2 = readFromGitCastle("priv")
// const data2 = readFromGitCastle("data")

// const cipher = exports.rsaEncrypt(data2, pub2);

// writeToGitCastle("hello.txt", cipher)
// const cipher2 = readFromGitCastle("hello.txt")

// const plain = exports.rsaDecrypt(cipher2, priv2);
// console.log("decrypted: " + plain)
