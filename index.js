'use strict';

function hideLoadingOverlay() {
	document.querySelector('#loading-overlay').classList.add('hidden');
}

let 常見字 = new Set();
let 常見字頻序 = {};

fetch('https://cdn.jsdelivr.net/gh/ayaka14732/syyon-vencie@69bc015/texts/%E5%B8%B8%E7%94%A8%E5%AD%97%E9%A0%BB%E5%BA%8F%E8%A1%A8.txt')
	.then((response) => response.text())
	.then((text) => {
		[...text].forEach((字, 頻序) => {
			常見字.add(字);
			常見字頻序[字] = 頻序;
		});
	})
	.catch((err) => {
		alert(err);
	})
	.finally(() => {
		hideLoadingOverlay()
	});

function 創建單字HTML(字頭) {
	const a = document.createElement('a');
	a.classList.add('char');
	a.target = '_blank';
	a.href = `https://ytenx.org/zim?dzih=${encodeURIComponent(字頭)}&dzyen=1`;
	a.innerText = 字頭;
	return a;
}

const cmp = (a, b) => (常見字頻序[a] || 99999) - (常見字頻序[b] || 99999);

function 根據音韻表達式查字(用户輸入) {
	const 顯示哪些字 = document.getElementById('form顯示哪些字').顯示哪些字.value;

	if (顯示哪些字 === '只顯示常用字' && 常見字 == null) {
		alert('Loading, please wait...');
		return;
	}

	try {
		const res = new Set();

		for (const 音韻地位 of Qieyun.iter音韻地位()) {
			if (音韻地位.屬於(用户輸入)) {
				if (顯示哪些字 === '一個音韻地位只顯示一個代表字') {
					res.add(音韻地位.代表字);
				} else {
					for (const { 字頭 } of 音韻地位.條目) {
						if (顯示哪些字 === '顯示所有字' || 常見字.has(字頭)) {
							res.add(字頭);
						}
					}
				}
			}
		}

		const fragment = document.createDocumentFragment();
		for (const 字頭 of [...res].sort(cmp)) {
			fragment.appendChild(創建單字HTML(字頭));
		}

		document.getElementById('outputArea').innerHTML = '';
		document.getElementById('outputArea').appendChild(fragment);
		document.getElementById('errorArea').innerText = '';
	} catch (err) {
		document.getElementById('outputArea').innerHTML = '';
		document.getElementById('errorArea').innerText = `${err}\n${err.stack}`;
	}
}

function 根據音韻描述查字(用户輸入) {
	const 顯示哪些字 = document.getElementById('form顯示哪些字').顯示哪些字.value;

	let 音韻地位;
	try {
		音韻地位 = Qieyun.音韻地位.from描述(用户輸入);
	} catch (err) {
		document.getElementById('outputArea').innerHTML = '';
		document.getElementById('errorArea').innerText = `${err}\n${err.stack}`;
		return;
	}

	const res = new Set();

	if (顯示哪些字 === '一個音韻地位只顯示一個代表字' && 音韻地位.代表字 != null) {
		res.add(音韻地位.代表字);
	} else {
		for (const { 字頭 } of 音韻地位.條目) {
			if (顯示哪些字 === '顯示所有字' || 常見字.has(字頭)) {
				res.add(字頭);
			}
		}
	}

	const fragment = document.createDocumentFragment();
	for (const 字頭 of [...res].sort(cmp)) {
		fragment.appendChild(創建單字HTML(字頭));
	}

	document.getElementById('outputArea').innerHTML = '';
	document.getElementById('outputArea').appendChild(fragment);
	document.getElementById('errorArea').innerText = '';
}

function 查詢() {
	const 查詢方式 = document.forms['query'].elements['查詢方式'].value
	const 用户輸入 = document.forms['query'].elements['用户輸入'].value.trim()
	const 處理 = {
		'音韻表達式': 根據音韻表達式查字,
		'音韻描述': 根據音韻描述查字
	}
	處理[查詢方式](用户輸入)
}

function 佔位符(查詢方式) {
	return {
		'音韻表達式': '冬韻 平聲',
		'音韻描述': '云三虞上'
	}[查詢方式]
}