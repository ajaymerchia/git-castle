const crypto = require('crypto')
const uuid = require('uuid');


exports.generateSymmetricKey = () => {
    return "hello world";
    return crypto.createECDH('secp521r1').generateKeys().toString('hex')
}

exports.generateRSAKeys = () => {
    return crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
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
    ).toString('hex')
}

exports.rsaDecrypt = (cipherText, privateKey) => {
    console.log(`Decrypting ${cipherText.length} bytes`)
    console.log(cipherText)
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
    ).toString()
}

exports.randomKeyFile = () => {
    return `${uuid.v4()}.cstl`
}



// const data = "my secret data"
// const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
//     // The standard secure default length for RSA keys is 2048 bits
//     modulusLength: 2048,
// })
// const encryptedData = crypto.publicEncrypt(
//     {
//         key: publicKey,
//         padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
//         oaepHash: "sha256",
//     },
//     // We convert the data string to a buffer using `Buffer.from`
//     Buffer.from(data)
// )

// // The encrypted data is in the form of bytes, so we print it in base64 format
// // so that it's displayed in a more readable form
// console.log("encypted data: ", encryptedData.toString("base64"))

// const decryptedData = crypto.privateDecrypt(
//     {
//         key: privateKey,
//         // In order to decrypt the data, we need to specify the
//         // same hashing function and padding scheme that we used to
//         // encrypt the data in the previous step
//         padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
//         oaepHash: "sha256",
//     },
//     encryptedData
// )

// // The decrypted data is of the Buffer type, which we can convert to a
// // string to reveal the original data
// console.log("decrypted data: ", decryptedData.toString())