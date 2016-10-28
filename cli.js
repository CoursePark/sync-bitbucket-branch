#! /usr/bin/env node
'use strict';

const syncBitbucketBranch = require('./index.js');

let dryrun;
let repo;
let sourceBranch;
let targetBranch;
let email;
let password;

// inspect the args passed at the command line and set dryrun, repo, sourceBranch, targetBranch
for (const arg of process.argv.slice(2)) {
	if (dryrun === undefined && arg === '--dryrun') {
		dryrun = true;
	}
	else if (repo === undefined) {
		repo = arg;
	}
	else if (sourceBranch === undefined) {
		sourceBranch = arg;
	}
	else if (targetBranch === undefined) {
		targetBranch = arg;
	}
	else if (email === undefined) {
		email = arg;
	}
	else if (password === undefined) {
		password = arg;
	}
}

if (email === undefined) {
	email = process.env.BITBUCKET_ACCOUNT_EMAIL;
}
if (password === undefined) {
	password = process.env.BITBUCKET_ACCOUNT_PASSWORD;
}

if (!repo || !targetBranch || !email || !password) {
	console.error('sync-bitbucket-branch [--dryrun]' // eslint-disable-line no-console
		+ ' <repo> <source-branch> <target-branch> [<email>] [<password>]\n'
		+ 'email and password may be set using environment variables'
		+ ' BITBUCKET_ACCOUNT_EMAIL and BITBUCKET_ACCOUNT_PASSWORD'
	);
	process.exit(); // eslint-disable-line no-process-exit
}

syncBitbucketBranch(repo, sourceBranch, targetBranch, email, password, dryrun)
	.then(() => {
		console.log(`${repo} ${sourceBranch} merged into ${targetBranch}`); // eslint-disable-line no-console
	})
	.catch((err) => {
		console.error(err); // eslint-disable-line no-console
		process.exit(1); // eslint-disable-line no-process-exit
	})
;
