const axios = require("axios");
const path = require('path')
const fs = require('fs')

exports.main = (kwargs) => {
    var username = kwargs.username
    var rsaPublicKeyFile = kwargs.key_path
    var endpoint = path.join(kwargs.receiver, "rsa-key").replace("https:/", "https://")
    if (!rsaPublicKeyFile.endsWith(".cstl.pub")) {
        throw new Error(`Invalid Public Key Extension. Must end with '.cstl.pub'`)
    }

    LOG.info("Sending key to " + endpoint)
    axios.post(endpoint, {
        "username": username,
        "rsaPublicKey": fs.readFileSync(rsaPublicKeyFile).toString()
    }).then((response) => {
        LOG.success(response.data)
    }).catch((err) => {
        LOG.error("Failed to send request.")
    })

}

