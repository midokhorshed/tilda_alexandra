function tp__convertRecordtoZero(recordid) {
	var convertBtn = document.querySelector('.pe-zero-convert-btn');
	if (convertBtn) convertBtn.style.display = 'none';
	var convertNotice = document.querySelector('.pe-zero-convert-notice');
	if (convertNotice) convertNotice.style.display = 'block';

	var buttonStyle = 'display: -webkit-flex; display: flex; -webkit-align-items: center; align-items: center; box-sizing: border-box; width: 240px; padding: 15px 20px; cursor: pointer; ';

	var str = '';
	str += '<div style="font-size:14px; color:#777; padding-top:25px;">';
	str += '{{convert_warning}}';
	str += '<a href="javascript:tp__convertRecordtoZero_do(' + recordid + ');" style="' + buttonStyle + ' margin-top:10px; background-color:#000; color:#fff;">{{convert}}</a>';
	str += '<a href="javascript:tp__convertRecordtoZero_cancel();" style="' + buttonStyle + 'margin-top:5px; border:1px solid rgba(0,0,0,0.1);">{{cancel}}</a>';
	str += '</div>';

	str = tc__translate(str, 'record__dict');
	convertNotice.innerHTML = str;
}

function tp__convertRecordtoZero_cancel() {
	var convertBtn = document.querySelector('.pe-zero-convert-btn');
	if (convertBtn) convertBtn.style.display = 'block';
	var convertNotice = document.querySelector('.pe-zero-convert-notice');
	if (convertNotice) convertNotice.style.display = 'none';
}

function tp__convertRecordtoZero_do(recordid) {
	showLoadIcon();
	td__ajax({
		type: 'POST',
		url: '/page/submit/',
		dataToSend: {comm: 'converttozero', pageid: window.pageid, recordid: recordid},
		dataType: 'text',
		onSuccess: function (data) {
			hideLoadIcon();
			if (data == '' || data == 'OK') {
				edrec__closeEditForm();
				var rec = document.querySelector('#record' + recordid);
				edrec__scrollTo(document.querySelector('html'), rec.offsetTop - 100, 700);
				tp__updateRecord(recordid);
			} else {
				check_logout(data);
				alert(data);
			}
			tp__updateUndoButton();
		},
		onError: function () {
			alert('Request error (convert block to ZeroBlock)');
			hideLoadIcon();
			location.reload();
		},
		timeout: 1000 * 25,
	});
}

function tp__openZero(recordid, flag_replacestate) {
	var pageid = window.pageid;
	console.log('func: tn_openeditor');
	var body = document.body;
	body.classList.add('t396__body_overflow_hidden');
	body.setAttribute('data-zero-opened-recordid', recordid);
	var intercomContainer = document.querySelector('#intercom-container');
	if (intercomContainer) intercomContainer.classList.add('t396__display_none');
	var c = Math.random().toString(36).substring(7);
	var iframeStr = '<iframe class="t396__iframe" src="/zero/?recordid=' + recordid + '&pageid=' + pageid + '&iframe=y&nocash=' + c + '" width="100vw" height="100vh"></iframe>';
	body.insertAdjacentHTML('beforeend', iframeStr);
	var iframeEl = document.querySelector('.t396__iframe');
	iframeEl.focus();

	if (window.history.replaceState) {
		if (flag_replacestate == 'replacestate') {
			window.history.replaceState({module: 'zero', recordid: recordid}, '', '/zero/?recordid=' + recordid + '&pageid=' + pageid);
		} else {
			window.history.pushState({module: 'zero', recordid: recordid}, '', '/zero/?recordid=' + recordid + '&pageid=' + pageid);
		}
	}
}

function tn_close(recordid, pageid) {
	tp__closeZero(recordid, pageid);
}
function tp__closeZero(recordid, pageid) {
	if (typeof recordid == 'undefined') {
		recordid = document.body.getAttribute('data-zero-opened-recordid');
		if (typeof recordid != 'undefined' && recordid != '') recordid = recordid * 1;
	}
	console.log('func: tn_close. rec:' + recordid);
	var zeroIframe = document.querySelector('.t396__iframe');
	if (zeroIframe && zeroIframe.parentNode !== null) {
		zeroIframe.parentNode.removeChild(zeroIframe);
	}
	var body = document.body;
	body.classList.remove('t396__body_overflow_hidden');
	body.removeAttribute('data-zero-opened-recordid');

	var intercomContainer = document.querySelector('#intercom-container');
	if (intercomContainer) intercomContainer.classList.remove('t396__display_none');

	if (recordid > 0) {
		tp__updateRecord(recordid);
		var rec = document.querySelector('#record' + recordid);
		var offset = rec.getBoundingClientRect().top + window.pageYOffset;
		if (offset) {
			edrec__scrollTo(document.querySelector('html'), offset - 100, 700);
		}
	}
	if (window.history.replaceState) {
		if (pageid > 0) {
			window.history.pushState(null, '', '/page/?pageid=' + pageid);
		}
	}
}

window.onpopstate = function (e) {
	if (typeof e.state == 'undefined' || e.state === null) {
		if (document.body.classList.contains('t396__body_overflow_hidden')) {
			tp__closeZero();
		}
	} else if (typeof e.state.module != 'undefined' && e.state.module == 'zero') {
		tp__openZero(e.state.recordid, 'replacestate');
	}
};