const path = require('path');
const fs = require('fs')


exports.main = (kwargs) => {
    var currentContents = []
    try {
        currentContents = fs.readFileSync(gitCastleSecrets).toString().split("\n")
    } catch (err) {
        // ignore
    }
       
    for (var file of kwargs.files) {
        pathTail = path.relative(appRoot, file);
        if (pathTail.startsWith("..")) {
            LOG.info(`Skipping ${file}. Not in current git repo.`)
        }
        if (!currentContents.includes(pathTail)) {
            currentContents.push(pathTail)
            LOG.success(`Added ${pathTail} to git-castle. Please add to your gitignore as well.`)
        }
    }

    fs.writeFileSync(gitCastleSecrets, currentContents.join("\n"))

}