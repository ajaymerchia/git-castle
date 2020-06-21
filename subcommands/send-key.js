const axios = require("axios");
const path = require('path')
const fs = require('fs')

exports.main = (kwargs) => {
    var username = kwargs.username
    var rsaPublicKeyFile = kwargs.key_path
    var endpoint = `https://${kwargs.receiver}.ngrok.io/rsa-key`
    if (!rsaPublicKeyFile.endsWith(".cstl.pub")) {
        throw new Error(`Invalid Public Key Extension. Must end with '.cstl.pub'`)
    }

    LOG.info("Sending key to " + endpoint)
    axios.post(endpoint, {
        "username": username,
        "rsaPublicKey": fs.readFileSync(rsaPublicKeyFile).toString()
    }).then((response) => {
        LOG.success(response.data)
        process.exit(0)
    }).catch((err) => {
        LOG.error(err.response.data.error || err.response.data)
        process.exit(0)
    })

}

