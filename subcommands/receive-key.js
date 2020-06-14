const ngrok = require('ngrok');
const express = require("express");
const bodyParser = require('body-parser');
const path = require("path")
const Users = require(path.join(castleModuleDir, "utils/users"))

const PORT = 6464

exports.main = (kwargs) => {
    var receiver = express();
    
    receiver.use(bodyParser.json());

    receiver.post("/rsa-key", (req, res) => {
        LOG.info(req.body)
        Users.linkUser(req.body.username, req.body.rsaPublicKey)

        res.status(200).json({ "success": true })
    })
    receiver.listen(PORT, () => {
        LOG.info("Key receiver running on port " + PORT);
    });
    ngrok.connect(PORT).then((info) => {
        LOG.success(`Accepting Keys on ${info}. Share this URL with a new joiner.`)
    })
}

