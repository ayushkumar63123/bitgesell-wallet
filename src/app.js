jsbtc.asyncInit(window);

const locationDefault = 'welcome';

const urlSecure = window.location.protocol === 'https:' ? 's' : '';

let storage = {
	balance: 0,
	addresses: {},
};

const getBalanceSum = () => {
	let balanceSum = 0;
	for (const [ key, value ] of Object.entries(storage.addresses)) {
		balanceSum += value.balance;
	}
	storage.balance = balanceSum;
	$amountSum.innerHTML = humanAmountFormat(storage.balance);
};

const saveToCryptoStorage = () => {
	// need AES encrypt
	localStorage.cryptoStorage = JSON.stringify(storage);
};

if (localStorage.cryptoStorage) {
	// need AES descrypt
	storage = JSON.parse(localStorage.cryptoStorage);
}
else {
	saveToCryptoStorage();
}

document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#main',
		'#welcome',
		'#restore',
		'#create-wallet',
		'#set-password',
		'#login',
		'#user-email',
		'#dashboard',
		'#my-addresses',
		'#new-address',
		'#send',
		'#transactions',
		'#node-address-modal',
		'#node-address',
		'#node-address-modal-btn',
		'#amount-sum',
		'#create-new-wallet-btn',
		'#export-wallet-btn',
		'#logout-btn',
	);

	getBalanceSum();

	const $nodeAddressInput = $nodeAddress.querySelector('.form-control[name="node-address"]');

	if (localStorage.nodeAddress) $nodeAddressInput.value = localStorage.nodeAddress;
	else localStorage.nodeAddress = $nodeAddressInput.value;

	new Modal($nodeAddressModal);

	$nodeAddressModalBtn.addEventListener('click', () => {
		$nodeAddressModal.Modal.show();
	});

	$nodeAddress.addEventListener('submit', (e) => {
		e.preventDefault();
		localStorage.nodeAddress = $nodeAddressInput.value;
		window.location.reload();
	});

	$createNewWalletBtn.addEventListener('click', (e) => {
		e.preventDefault();
		Swal.fire({
			title: 'Are you sure want to create a new wallet?',
			html: 'The current local wallet will be deleted from the current device.<br><b class="text-danger">Please take care of current wallet backup.</b>',
			icon: 'question',
			showCancelButton: true,
			customClass: {
				actions: 'btn-group',
				confirmButton: 'btn btn-success btn-lg',
				cancelButton: 'btn btn-outline-danger btn-lg',
			},
			showCloseButton: true,
		}).then((result) => {
			if (result.value) {
				Swal.fire({
					showCloseButton: true,
					showConfirmButton: false,
					toast: true,
					position: 'top',
					timer: 3000,
					timerProgressBar: true,
					icon: 'success',
					title: 'You deleted the previous local wallet from this device!',
				});
				window.location.hash = 'welcome';
			}
		});
	});

	$logoutBtn.addEventListener('click', () => {
		Swal.fire({
			showCloseButton: true,
			showConfirmButton: false,
			toast: true,
			position: 'top',
			timer: 3000,
			timerProgressBar: true,
			icon: 'success',
			title: 'You logout!',
		});
		window.location.hash = 'login';
	});

	document.querySelectorAll('.copy-val').forEach(($input) => {
		$input.addEventListener('click', () => {
			$input.select();
			copyToBuffer($input, false);
		});
	});
	document.querySelectorAll('.copy-btn').forEach(($btn) => {
		$btn.addEventListener('click', () => {
			const $input = $btn.parentElement.querySelector('.copy-val');
			copyToBuffer($input);
		});
	});

	getBalanceSum();

});

window.addEventListener('hashchange', () => {
	const hash = window.location.hash.substring(1);
	if (hash) {
		const params = hash.split('/');
		if (params[0]) {
			switch (params[0]) {
				case 'main': {
					show($main);
					break;
				}
				case 'welcome': {
					// check wallet
					hide($main, $restore);
					show($welcome);
					break;
				}
				case 'restore': {
					// check wallet
					hide($main, $welcome);
					show($restore);
					break;
				}
				case 'create-wallet': {
					// check wallet
					hide($main, $welcome);
					show($createWallet);
					createWallet();
					break;
				}
				case 'set-password': {
					// check wallet
					hide($main, $createWallet);
					show($setPassword);
					break;
				}
				case 'login': {
					// check wallet
					hide($main);
					show($login);
					setTimeout(() => {
						$login.querySelector('input').focus();
					}, 100);
					break;
				}
				case 'dashboard': {
					hide($createWallet, $myAddresses, $newAddress, $send, $transactions, $restore);
					show($main, $dashboard);
					break;
				}
				case 'my-addresses': {
					hide($dashboard, $newAddress, $send, $transactions);
					show($main, $myAddresses);
					if (typeof myAddressesTableDraw !== 'undefined') myAddressesTableDraw();
					break;
				}
				case 'new-address': {
					hide($myAddresses, $send, $transactions);
					show($main, $newAddress);
					newAddressGenerate();
					break;
				}
				case 'send': {
					hide($myAddresses, $newAddress, $transactions);
					show($main, $send);
					sendFormInit();
					break;
				}
				case 'transactions': {
					hide($dashboard, $newAddress, $send, $myAddresses);
					show($main, $transactions);
					// address = window.location.hash.substring(15);
					// .querySelector('input[name="address"]').value = address;
					if (typeof transactionsTableDraw !== 'undefined') transactionsTableDraw();
					break;
				}
				default: {
					// need 404 page
					window.location.hash = locationDefault;
				}
			}
		}
	}
	else window.location.hash = locationDefault;
});

document.addEventListener('DOMContentLoaded', () => {

	window.dispatchEvent(new CustomEvent('hashchange'));

});

const humanAmountFormat = (amount) => {
	return `<span class="font-weight-bold">${(sb.toBitcoin(amount))}</span> BGL`;
};

const copyToBuffer = ($select, deselect = true) => {
	$select.select();
	document.execCommand('copy');
	Swal.fire({
		showCloseButton: true,
		showConfirmButton: false,
		toast: true,
		position: 'top',
		timer: 3000,
		timerProgressBar: true,
		icon: 'success',
		title: 'Copied to clipboard!',
	});
	$select.blur();
	if (deselect) setTimeout(() => window.getSelection().removeAllRanges(), 3000);
};

const fetchQuery = (url, callback, fetchParams = null, errorFunc = null, swalToast = false, notShowError = null) => {
	fetch(url, fetchParams)
			.then((response) => { return response.json(); })
			.then((responseJson) => {
				// console.log(responseJson);
				if ( ! responseJson.error) callback(responseJson);
				else if ( ! notShowError || notShowError !== responseJson.error) {
					let errorObj = {};
					if (errorFunc) errorObj = errorFunc(responseJson);
					if ( ! errorObj.title) errorObj.title = `Error in response HTTP query to: <a target="_blank" href="${url}">${url}</a>`;
					if ( ! errorObj.message) errorObj.message = responseJson.error;
					const swalParams = {
						showCloseButton: true,
						icon: 'error',
						title: errorObj.title,
						html: errorObj.message,
						customClass: {
							cancelButton: 'btn btn-danger btn-lg',
						},
						showConfirmButton: false,
						showCancelButton: true,
						cancelButtonText: 'Ok',
					};
					if (swalToast) {
						swalParams.toast = true;
						swalParams.position = 'top-end';
						swalParams.timer = 5000;
						swalParams.timerProgressBar = true;
						swalParams.showCancelButton = false;
					}
					Swal.fire(swalParams);
				}
			});

};

const getAddressInfo = (address, callback) => {
	const url = `http${urlSecure}://bitgesellexplorer.com/ext/getaddress/${address}`;
	fetchQuery(url, (responseJson) => {
		callback(responseJson);
	}, null, () => {
		return {
			title: `Error in get address info query: <a target="_blank" href="${url}">${url}</a>`,
		};
	});
};

const getAddressBalance = (address, callback) => {
	const url = `http${urlSecure}://bitgesellexplorer.com/ext/getbalance/${address}`;
	fetchQuery(url, (responseJson) => {
		callback(responseJson);
	}, null, () => {
		return {
			title: `Error in get address balance query: <a target="_blank" href="${url}">${url}</a>`,
		};
	}, true, 'address not found.');
};
