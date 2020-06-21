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
        LOG.info("Received key request from a user.")
        try {
            Users.linkUser(req.body.username, req.body.rsaPublicKey)
        } catch (err) {
            res.status(403).json({ "error": "The server received your key, but failed to process the response. Please ask the server host to inspect logs and follow-up." })
            LOG.error(err.message)
            process.exit(1)
        }
        res.status(200).json({ "success": true })
        process.exit(0)
    })
    receiver.listen(PORT, () => {
        LOG.info("Key receiver running on port " + PORT);
    });
    ngrok.connect(PORT).then((info) => {
        const receiverID = new URL(info).hostname.split(".")[0];
        LOG.success(`Accepting keys! Your Receiver ID is '${receiverID}'. Share this ID with a joiner.`)
    })

}

