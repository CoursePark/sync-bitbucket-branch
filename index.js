'use strict';

const es6Request = require('es6-request');
const qs = require('querystring');

function wait(time) {
	return (value) => (new Promise((resolve) => setTimeout(() => resolve(value), time)));
}

function retry({maxTries = 3, delay = 1000, perDelayMultiplier = 1.5} = {}, promiseToTry = arguments[0]) {
	return function (x) {
		let chain = Promise.resolve(x).then(promiseToTry);
		for (var i = 1, t = delay; i < maxTries; i++, t *= perDelayMultiplier) {
			(function (t) {chain = chain.catch(() => Promise.resolve(x).then(wait(t)).then(promiseToTry))})(t);
		}
		return chain;
	}
}

module.exports = function (repo, sourceBranch = 'master', targetBranch, email, password, dryrun = false) {
	// expects repo to have a form similar to `coursepark/bln-worker`
	let csrfToken, bbSession;
	
	return Promise.resolve()
		.then(retry(() => es6Request.get('https://bitbucket.org/account/signin/')))
		.then(([body, res]) => {
			csrfToken = res.headers['set-cookie'].join('').replace(/^.*csrftoken=([^;]+).*$/, '$1');
		})
		.then(retry(() => es6Request
			.post('https://bitbucket.org/account/signin/')
			.headers({
				'Cookie': `csrftoken=${csrfToken}`,
				'Referer': 'https://bitbucket.org/account/signin/',
				'Content-Type': 'application/x-www-form-urlencoded'
			})
			.send(qs.stringify({
				username: email,
				password: password,
				csrfmiddlewaretoken: csrfToken
			}))
		))
		.then(([body, res]) => {
			console.log('---CODE--');
			console.log(res.statusCode);
			console.log('---BODY--');
			console.log(body.substr(0, 600));
			console.log('---HEADERS--');
			console.log(res.headers);
			
			csrfToken = res.headers['set-cookie'].join('').replace(/^.*csrftoken=([^;]+).*$/, '$1');
			bbSession = res.headers['set-cookie'].join('').replace(/^.*bb_session=([^;]+).*$/, '$1');
		})
		.then(() => es6Request
			.post(`https://bitbucket.org/${repo}/compare`)
			.headers({
				'Cookie': `csrftoken=${csrfToken}; bb_session=${bbSession}`,
				'Referer': 'https://bitbucket.org/${repo}/branches/',
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-Csrftoken': csrfToken
			})
			.send(qs.stringify({
				event: 'list:sync',
				commit_message: `bitbucket sync merge of ${sourceBranch} into ${targetBranch}`,
				source: `${repo}::${sourceBranch}`,
				dest: `${repo}::${targetBranch}`
			}))
		)
		.then(([body, res]) => {
			console.log('---CODE--');
			console.log(res.statusCode);
			console.log('---BODY--');
			console.log(body.substr(0, 600));
			console.log('---HEADERS--');
			console.log(res.headers);
		})
		// https://bitbucket.org/coursepark/bln-worker/compare/master%0Dsync-test-2#chg-README.md
	;
};
