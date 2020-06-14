const crypto = require('crypto')
const uuid = require('uuid');
const { write } = require('fs');


exports.generateSymmetricKey = () => {
    return crypto.createECDH('secp521r1').generateKeys().toString('hex').slice(0, 512)
}

const aesAlgorithm = "aes-256-cbc"

exports.aesEncrypt = (plainText, masterKey) => {
    const iv = crypto.randomBytes(16);
    const hashKey = crypto.createHash("sha256");
    hashKey.update(masterKey);

    let key = hashKey.digest().slice(0, 32);

    var blockCipher = crypto.createCipheriv(aesAlgorithm, key, iv);
    var cipherText = blockCipher.update(plainText, 'utf8', 'hex')
    cipherText += blockCipher.final('hex');

    return JSON.stringify({
        "encryptedContents": cipherText,
        "iv": iv.toString("hex")
    })
}

exports.aesDecrypt = (cipherPayload, masterKey) => {
    const hashKey = crypto.createHash("sha256");
    hashKey.update(masterKey);

    let key = hashKey.digest().slice(0, 32);

    const cipherTextStructured = JSON.parse(cipherPayload)
    const iv = cipherTextStructured["iv"]
    const cipherText = cipherTextStructured["encryptedContents"]

    var blockDecipher = crypto.createDecipheriv(aesAlgorithm, key, iv);
    var plainText = blockDecipher.update(cipherText, 'hex', 'utf8')
    plainText += blockDecipher.final('utf8');

    return plainText;
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