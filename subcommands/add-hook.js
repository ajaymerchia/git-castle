const fs = require('fs')
const path = require('path')
var execSync = require('child_process').execSync;


function appendIfNotIncluded(file, command) {
    const userFriendlyFileName = path.relative(appRoot, file)
    try {
        contents = fs.readFileSync(file)
        if (contents.includes(command)) {
            LOG.warn(userFriendlyFileName + " is already configured with git-castle hooks.")
            return
        } else {
            fs.appendFileSync(file, command)
        }
    } catch (err) {
        fs.appendFileSync(file, command)
    }

    execSync(`chmod +x ${file}`)
    
    LOG.success(`Added git-castle commands to ${userFriendlyFileName}. Also made ${userFriendlyFileName} executable`)


}

exports.main = (ignored) => {
    const preCommit = path.join(appRoot, ".git", "hooks", "pre-commit")
    const preCommitCommand = `git-castle lockdown
    if [ $? -eq 0 ]
    then
        echo "Success: pre-commit finished with no changes made to secret files."
        exit 0
    else
        echo "Failed: pre-commit finished with changes made to secret files. You may want to check these in before committing."
        exit 1
    fi
    `

    const postMerge = path.join(appRoot, ".git", "hooks", "post-merge")
    const postMergeCommand = `git-castle reveal
    `

    appendIfNotIncluded(preCommit, preCommitCommand)
    appendIfNotIncluded(postMerge, postMergeCommand)    
}