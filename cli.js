#!/usr/bin/env node
var path = require('path');
var fs = require('fs')
const os = require('os')
require('./utils/LOG')


var execSync = require('child_process').execSync;
if (!execSync('git rev-parse --is-inside-work-tree 2>/dev/null', { encoding: 'utf8' })) {
    throw new Error("Must be in a git repository to use git-castle")
}

global.castleModuleDir = path.dirname(require.main.filename);
global.appRoot = execSync('git rev-parse --show-toplevel 2>/dev/null', { encoding: 'utf8' }).trim()

global.gitCastleAppDir = path.join(appRoot, ".git-castle")
global.certDir = path.join(os.homedir(), ".git-castle")
global.gitCastleSecrets = path.join(appRoot, ".git-castle-secrets")

global.writeToGitCastle = (file, contents) => {
    fs.writeFileSync(path.join(gitCastleAppDir, file), contents)
}
global.readFromGitCastle = (file) => {
    return fs.readFileSync(path.join(gitCastleAppDir, file))
}
global.existsInGitCastle = (file) => {
    return fs.existsSync(path.join(gitCastleAppDir, file))
}


const ArgumentParser = require('argparse').ArgumentParser;
const ParserConfig = require('./cli-config.json');



var parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'The git-castle CLI allows you to store secrets securely in your repo.'
});

parser.addArgument(["--verbose", "-vv"], {
    "help": "Stream verbose logs to the console for any actions taken by the system. (Equivalent to '-l info')",
    "action": "storeTrue",
    "required": false
})
parser.addArgument(["--level", "-l"], {
    "help": "Streams logs at or above a given level to the console for any actions taken by the system. Overrides the 'verbose' flag.",
    "required": false,
    "choices": [
        "trace",
        "debug",
        "info",
        "success",
        "warn",
        "error",
        "fatal"
    ]
})




var subparsers = parser.addSubparsers({
    title: 'subcommands',
    description: "valid subcommands for git-castle",
    dest: "subcommand"
});

var noRequireInit = []

for (var subcommand in ParserConfig) {
    const config = ParserConfig[subcommand]
    const newSubparser = subparsers.addParser(subcommand, { addHelp: true, description: config["help"] })
    newSubparser.setDefaults({ "lib": config["main_file"] })

    for (var parameter of config["parameters"]) {
        var flags = parameter["flags"]
        newSubparser.addArgument(flags, {
            "help": parameter["help"],
            "required": parameter["required"],
            "nargs": parameter["nargs"]
        })
    }

    if (config["no_require_init"]) {
        noRequireInit.push(subcommand)
    }

}

// const subcommand = args[0]
// const params = args[]

// dispatches all subcommands
var args = parser.parseArgs();
if (args.verbose) {
    LOG.level = "info"
}
if (args.level) {
    LOG.level = args.level
}


if (!noRequireInit.includes(args.subcommand) && !existsInGitCastle("")) {
    throw new Error(`No .git-castle file exists in this repository root. Please run git-castle init`)
}
try {
    output = require(args.lib).main(args)
    if (output === undefined || output === null) {
        return true;
    } else {
        process.exit(1)
    }
} catch (err) {
    LOG.error(err.message)
    return false
}
