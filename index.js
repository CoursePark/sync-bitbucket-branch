'use strict';

const es6Request = require('es6-request');
const qs = require('querystring');

function wait(time) {
	return (value) => new Promise((resolve) => setTimeout(() => resolve(value), time));
}

function retry({maxTries = 3, delay = 1000, perDelayMultiplier = 1.5} = {}, promiseToTry = arguments[0]) { // eslint-disable-line prefer-rest-params
	return function (x) {
		let chain = Promise.resolve(x).then(promiseToTry);
		for (let i = 1, t = delay; i < maxTries; i++, t *= perDelayMultiplier) {
			const time = t;
			chain = chain.catch(() => Promise.resolve(x).then(wait(time)).then(promiseToTry));
		}
		return chain;
	};
}

module.exports = function (repo, sourceBranch = 'master', targetBranch, email, password, dryrun = false) {
	// expects repo to have a form similar to `coursepark/bln-worker`
	let csrfToken;
	let bbSession;
	
	return Promise.resolve()
		.then(retry(() => es6Request.get('https://bitbucket.org/account/signin/')))
		.then(([, res]) => {
			csrfToken = res.headers['set-cookie'].join('').replace(/^.*csrftoken=([^;]+).*$/, '$1');
		})
		.then(retry(() => es6Request
			.post('https://bitbucket.org/account/signin/')
			.headers({
				Cookie: `csrftoken=${csrfToken}`,
				Referer: 'https://bitbucket.org/account/signin/',
				'Content-Type': 'application/x-www-form-urlencoded'
			})
			.send(qs.stringify({
				username: email,
				password,
				csrfmiddlewaretoken: csrfToken
			}))
		))
		.then(([body, res]) => {
			console.log('---CODE--'); // eslint-disable-line no-console
			console.log(res.statusCode); // eslint-disable-line no-console
			console.log('---BODY--'); // eslint-disable-line no-console
			console.log(body.substr(0, 600)); // eslint-disable-line no-console
			console.log('---HEADERS--'); // eslint-disable-line no-console
			console.log(res.headers); // eslint-disable-line no-console
			
			csrfToken = res.headers['set-cookie'].join('').replace(/^.*csrftoken=([^;]+).*$/, '$1');
			bbSession = res.headers['set-cookie'].join('').replace(/^.*bb_session=([^;]+).*$/, '$1');
		})
		.then(() => es6Request
			.post(`https://bitbucket.org/${repo}/compare`)
			.headers({
				Cookie: `csrftoken=${csrfToken}; bb_session=${bbSession}`,
				Referer: 'https://bitbucket.org/${repo}/branches/',
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-Csrftoken': csrfToken
			})
			.send(qs.stringify({
				event: 'list:sync',
				commit_message: `bitbucket sync merge of ${sourceBranch} into ${targetBranch}`, // eslint-disable-line camelcase
				source: `${repo}::${sourceBranch}`,
				dest: `${repo}::${targetBranch}`
			}))
		)
		.then(([body, res]) => {
			console.log('---CODE--'); // eslint-disable-line no-console
			console.log(res.statusCode); // eslint-disable-line no-console
			console.log('---BODY--'); // eslint-disable-line no-console
			console.log(body.substr(0, 600)); // eslint-disable-line no-console
			console.log('---HEADERS--'); // eslint-disable-line no-console
			console.log(res.headers); // eslint-disable-line no-console
		})
		// https://bitbucket.org/coursepark/bln-worker/compare/master%0Dsync-test-2#chg-README.md
	;
};
