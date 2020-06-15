<h1 align="center">Welcome to git-castle 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.1.1-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/ajaymerchia/git-castle#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/ajaymerchia/git-castle/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/ajaymerchia/git-castle/blob/master/LICENSE" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/github/license/ajaymerchia/git-castle" />
  </a>
</p>

> A platform-agnostic, simple tool to manage secrets with git.

I was trying to work on a project with some fellow developers working on PCs. Unfortunately, existing tools are limited by platform, require extremely convoluted setup/installers, or just plain-old don't work.

Introducing `git-castle`! The easiest, lightweight way to manage secrets without the necessity for a full Key Management Solution.

### 🏠 [Homepage](https://github.com/ajaymerchia/git-castle#readme)

## ⚙️ Install 
*One Line Setup! (Thank Goodness)*
```sh
npm install -g git-castle
```

## 📝 Usage
### ⚡️ Quick Setup

```sh
git-castle init
git-castle add-user -u $YOUR_USERNAME
git add .git-castle

git-castle guard $PATHSPEC_TO_SECRET_FILES # Sets the specified file as a secret
git add .git-castle-secrets

git-castle add-hook # Recommended to reduce manual encrypting and decrypting on every commit.

git-castle lockdown # Encrypts the files
git add $PATHSPEC_TO_ENCRYPTED_SECRETS # Adds encrypted files to repositories.
```

When commiting your files, make sure you **DO NOT commit the raw secret files 🔐**. You should add those to your `.gitignore`. 

Files generated by `git-castle` (ending with `.secret`) can be safely checked-in. 💪

### ➕ Add A New User
#### On your Machine
```sh
# Inside the repository you wish to share with the user
git-castle receive-key

# After the New User is successfully added
git add .git-castle
git commit -m "Added $USERNAME to git-castle"
git push
```

Share your `$RECEIVER_ID` with the New User.

#### On the New User's Machine
```sh
git-castle keygen -u $USERNAME -o $OUTFILE.cstl.pub
# if -o is omitted, the public key will be stored in ~/.git-castle/$USERNAME.cstl.pub

git-castle send-key -u $USERNAME -k $OUTFILE.cstl.pub -r $RECEIVER_ID


# After the other user pushes the config update following the send-key operation:
git clone $REMOTE_REPOSITORY # pull if already downloaded
git-castle login -u $USERNAME
git-castle reveal

git-castle add-hook # Recommended for the future
```

## How it Works




## Author

👤 **Ajay Raj Merchia**

* Website: ajaymerchia.com
* Github: [@ajaymerchia](https://github.com/ajaymerchia)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/ajaymerchia/git-castle/issues). You can also take a look at the [contributing guide](https://github.com/ajaymerchia/git-castle/blob/master/CONTRIBUTING.md).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2020 [Ajay Raj Merchia](https://github.com/ajaymerchia).<br />
This project is [ISC](https://github.com/ajaymerchia/git-castle/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_