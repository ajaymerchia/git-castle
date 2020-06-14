const fs = require('fs')
const path = require('path')

function appendIfNotIncluded(file, command) {
    try {
        contents = fs.readFileSync(file)
        if (contents.includes(command)) {
            LOG.info(file + " already configured.")
        }
        fs.appendFileSync(file, command)
    } catch (err) {
        fs.appendFileSync(file, command)
    }
}

exports.main = (ignored) => {
    const preCommit = path.join(appRoot, ".git", "hooks", "pre-commit")
    const preCommitCommand = `git-castle lockdown
    `

    const postMerge = path.join(appRoot, ".git", "hooks", "post-merge")
    const postMergeCommand = `git-castle reveal
    `

    appendIfNotIncluded(preCommit, preCommitCommand)
    appendIfNotIncluded(postMerge, postMergeCommand)    
}