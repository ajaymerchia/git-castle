#!/usr/bin/env node
const findGitRoot = require("find-git-root");
var path = require('path');
var fs = require('fs')
const os = require('os')

if (!fs.existsSync(".git")) {
    throw new Error("Must be in a git repository to use git-castle")
}


global.castleModuleDir = path.dirname(require.main.filename);
global.appRoot = path.dirname(findGitRoot())
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
if (!noRequireInit.includes(args.subcommand) && !existsInGitCastle("")) {
    throw new Error(`No .git-castle file exists in this repository root. Please run git-castle init`)
}
require(args.lib).main(args)
