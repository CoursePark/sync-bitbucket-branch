# sync-bitbucket-branch

## Merge A Source Branch Into A Target Branch

Uses Bitbucket's branch sync feature to merge one branch into another. If conflict happen the merge will not happen and the url of a Bitbucket compare will be returned which should show the conflicts.

Useful for automating some dev-ops scenarios where a demo/client/support/qc branch needs to be keep up to date with another branch, typically master.

### Command Line Usage Example

```
npm install sync-bitbucket-branch
sync-bitbucket-branch [--dryrun] <repo> <source-branch> <target-branch> [<bitbucket-account-email>] [<bitbucket-account-password>]
```

- _`<repo>` will have the form of `${user}/${repository}`. Just look in the url of a Bitbucket repo: https://bitbucket.org/`${user}/${repository}`_
- `<bitbucket-account-email>` is optional if `BITBUCKET_ACCOUNT_EMAIL` is set as an environment variable
- `<bitbucket-account-password>` is optional if `BITBUCKET_ACCOUNT_PASSWORD` is set as an environment variable

### Code Example

```javascript
const syncBitbucketBranch = require('sync-bitbucket-branch');

const repo = `mycompany/myrepository`;
const sourceBranch = 'master';
const targetBranch = 'qc';
const email = 'bitbucketUser';
const password = '';
const dryrun = false;

syncBitbucketBranch(repo, sourceBranch, targetBranch, email, password, dryrun).then((data) => {
	console.log('url of branch', data);
});
```
