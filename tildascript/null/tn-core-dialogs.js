function tn_showShortcuts() {
	$('body').append(
		'<table class="tn-shortcuts"><tr><td style="width:100%;height:100%; vertical-align:top;"><div class="tn-close-icon tn-close-icon_light"></div><div class="tn-shortcuts__main"></div></td></tr></table>',
	);
	var str =
		'<table class="tn-shortcuts__table">' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left" style="padding-top:30px;">Change Resolution Mode</td>' +
		'<td class="tn-shortcuts__right" style="padding-top:30px;">' +
		cmdSymbol() +
		' <span class="tn-shortcuts__plus">+</span> 1 <span class="tn-shortcuts__plus">..</span> 5</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Hide Grid</td>' +
		'<td class="tn-shortcuts__right">G</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Hide Settings</td>' +
		'<td class="tn-shortcuts__right">TAB</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Hide UI</td>' +
		'<td class="tn-shortcuts__right">F</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Undo</td>' +
		'<td class="tn-shortcuts__right">' +
		cmdSymbol() +
		' <span class="tn-shortcuts__plus">+</span> Z</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Save</td>' +
		'<td class="tn-shortcuts__right">' +
		cmdSymbol() +
		' <span class="tn-shortcuts__plus">+</span> S</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Copy Element</td>' +
		'<td class="tn-shortcuts__right">' +
		cmdSymbol() +
		' <span class="tn-shortcuts__plus">+</span> C</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Paste Element</td>' +
		'<td class="tn-shortcuts__right">' +
		cmdSymbol() +
		' <span class="tn-shortcuts__plus">+</span> V</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Move Element</td>' +
		'<td class="tn-shortcuts__right"><span class="tn-shortcuts__plus">(</span>Shift <span class="tn-shortcuts__plus">+</span><span class="tn-shortcuts__plus">)</span> Arrows</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Delete Element</td>' +
		'<td class="tn-shortcuts__right">Backspace</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Change Opacity</td>' +
		'<td class="tn-shortcuts__right">0 <span class="tn-shortcuts__plus">..</span> 9</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Lock Element</td>' +
		'<td class="tn-shortcuts__right">L</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Change Font Size</td>' +
		'<td class="tn-shortcuts__right">+ <span class="tn-shortcuts__plus">or</span> -</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Change Line Spacing</td>' +
		'<td class="tn-shortcuts__right">' +
		cmdSymbol() +
		' <span class="tn-shortcuts__plus">+</span> Top/Down</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Change Letter Spacing</td>' +
		'<td class="tn-shortcuts__right">' +
		cmdSymbol() +
		' <span class="tn-shortcuts__plus">+</span> Left/Right</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Select All</td>' +
		'<td class="tn-shortcuts__right">' +
		cmdSymbol() +
		' <span class="tn-shortcuts__plus">+</span> A</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Layers: Hide/Show</td>' +
		'<td class="tn-shortcuts__right">' +
		cmdSymbol() +
		' <span class="tn-shortcuts__plus">+</span> L</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Guides: Add Horizontal</td>' +
		'<td class="tn-shortcuts__right">' +
		cmdSymbol() +
		' <span class="tn-shortcuts__plus">+</span> H</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Guides: Add Vertical</td>' +
		'<td class="tn-shortcuts__right">' +
		cmdSymbol() +
		' <span class="tn-shortcuts__plus">+</span> ⇧ <span class="tn-shortcuts__plus">+</span> H</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Group</td>' +
		'<td class="tn-shortcuts__right">' +
		cmdSymbol() +
		' <span class="tn-shortcuts__plus">+</span> G</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Ungroup</td>' +
		'<td class="tn-shortcuts__right">' +
		cmdSymbol() +
		' <span class="tn-shortcuts__plus">+</span> ⇧ <span class="tn-shortcuts__plus">+</span> G</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Measure to selection</td>' +
		'<td class="tn-shortcuts__right">Click <span class="tn-shortcuts__plus">+</span> ' +
		optionSymbol() +
		'</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Zoom In</td>' +
		'<td class="tn-shortcuts__right">' +
		cmdSymbol() +
		' <span class="tn-shortcuts__plus">+</span> +</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Zoom Out</td>' +
		'<td class="tn-shortcuts__right">' +
		cmdSymbol() +
		' <span class="tn-shortcuts__plus">+</span> −</td>' +
		'</tr>' +
		'<tr class="tn-shortcuts__tr">' +
		'<td class="tn-shortcuts__left">Resize from center</td>' +
		'<td class="tn-shortcuts__right">' +
		cmdSymbol() +
		' <span class="tn-shortcuts__plus">+</span> Resize</td>' +
		'</tr>' +
		'<table>';

	$('.tn-shortcuts__main').html(str);

	var $tnShortcuts = $('.tn-shortcuts');
	$tnShortcuts.click(function () {
		$tnShortcuts.remove();
	});

	$('.tn-close-icon').click(function () {
		$tnShortcuts.remove();
	});
}
function tn_showHelloPopup() {
	$('body').append(
		'<table class="tn-hello"><tr><td style="width:100%;height:100%; vertical-align:middle;"><div class="tn-hello__main"></div></td></tr></table>',
	);
	var str = '';

	str += '<table class="tn-hello__table">';
	str += '<tr class="tn-hello__tr">';
	str += '<td class="tn-hello__td" style="padding-top:50px;padding-bottom:50px;">';

	str += '<div style="padding-top:0px;"><div class="tn-hello__img"></div></div>';
	str +=
		'<div style="padding-top: 40px; padding-bottom:5px;font-size: 16px; letter-spacing:2px; opacity:0.5;">WELCOME TO:</div>';
	str += '<div style="font-size: 50px; font-weight:bold;"><span style="color:#ed5d28;">ZERO</span>&nbsp;BLOCK</div>';
	str +=
		'<div style="padding-top:10px; padding-bottom:50px;font-size: 30px; font-weight:light;">Turn any idea into reality by designing unique blocks. Enjoy full control over each element, use advanced features, adapt and animate your content as you want it.</div>';
	str += '<div class="tn-hello__btn"><div class="tn-hello__btn-label">DESIGN NOW</div></div>';

	str += '</td>';
	str += '</tr>';
	str += '<table>';
	$('.tn-hello__main').html(str);

	var $tnHello = $('.tn-hello');
	$tnHello.click(function () {
		$tnHello.remove();
	});
}
function tn_missedfonts__find() {
	var el;
	var v;

	if (typeof window.fonts == 'undefined') return;
	if (!window.fonts.length) return;

	$('.tn-elem').each(function () {
		el = $(this);
		for (var i = 0; i < 4; i++) {
			if (i == 0) v = el.attr('data-field-fontfamily-value');
			if (i == 1) v = el.attr('data-field-inputfontfamily-value');
			if (i == 2) v = el.attr('data-field-buttonfontfamily-value');
			if (i == 3) v = el.attr('data-field-fieldfontfamily-value');

			if (typeof v != 'undefined' && v != '') {
				var fontexist = '';
				window.fonts.forEach(function (item) {
					if (item == '') fontexist = 'y';
					if (v == item) fontexist = 'y';
				});
				if (fontexist == '') {
					console.log('font is missed: ' + v);
					if (typeof window.fonts_missed == 'undefined') window.fonts_missed = {};
					window.fonts_missed[v] = v;
				}
			}
		}
	});
	if (!window.tn_role_dev && typeof window.fonts_missed != 'undefined') {
		tn_missedfonts__showpopup();
	}
}

function tn_missedfonts__showpopup() {
	var str =
		'<div id="missedfonts_popup" class="tn-missedfonts-popup">' +
		'<div class="tn-missedfonts-popup__wrp">' +
		'<div><b>Missing fonts: some fonts used in this block are not installed in the Site Settings.</b> Select a font to replace the missing one(s) in all elements:<br><br>';

	$.each(window.fonts_missed, function (key) {
		str += '<div>' + 'Missing font: ' + key + '<br> Replace with: ' + '<select name="sb_' + key + '">';

		window.fonts.forEach(function (fitem) {
			str += '<option value="' + fitem + '">' + fitem + '</option>';
		});

		str += '</select>' + '</div>' + '<br><br>';
	});

	str +=
		'<div class="sui-btn sui-btn-missedfonts-ignore">Ignore</div>' +
		'<div class="sui-btn sui-btn-missedfonts-replaceall">Replace all</div>' +
		'</div>' +
		'</div>' +
		'</div>';

	$('body').append(str);

	$('.sui-btn-missedfonts-ignore').click(function () {
		tn_missedfonts__closepopup();
	});
	$('.sui-btn-missedfonts-replaceall').click(function () {
		tn_missedfonts__replaceall();
		tn_missedfonts__closepopup();
	});
}

function tn_missedfonts__closepopup() {
	$('#missedfonts_popup').remove();
	delete window.fonts_missed;
}

function tn_missedfonts__replaceall() {
	$.each(window.fonts_missed, function (key) {
		var replace = $('#missedfonts_popup')
			.find('[name="sb_' + key + '"]')
			.val();
		console.log('font:' + key + '  ->> repl: ' + replace);

		$('.tn-elem').each(function () {
			var el = $(this);
			var v = el.attr('data-field-fontfamily-value');
			for (var i = 0; i < 4; i++) {
				if (i == 0) v = el.attr('data-field-fontfamily-value');
				if (i == 1) v = el.attr('data-field-inputfontfamily-value');
				if (i == 2) v = el.attr('data-field-buttonfontfamily-value');
				if (i == 3) v = el.attr('data-field-fieldfontfamily-value');

				if (typeof v != 'undefined' && v != '' && v == key) {
					el.attr('data-field-fontfamily-value', replace);
					console.log('font replaced: ' + replace);
				}
			}
		});
	});
	allelems__renderView();
	tn_missedfonts__closepopup();
}
function tn_openrecords__showpopup() {
	var str =
		'<div id="openrecords_popup" style="width:100%;position:fixed;z-index:9999;top:0;left:0;height:100vh;background-color:rgba(255,255,255,0.5);">' +
		'<div style="width:400px;margin:0 auto;margin-top:40px;background-color:#fff;padding:40px;box-shadow:0px 0px 26px 1px rgba(0,0,0,0.10);">' +
		'<div>Open record on this page<br><br>' +
		'<div id="openrecords_popup_recordslist"></div><br>' +
		'<div class="sui-btn sui-btn_sm sui-btn-openrecords-close">Close</div>' +
		'</div>' +
		'</div>' +
		'</div>';

	$('body').append(str);

	$('.sui-btn-openrecords-close').click(function () {
		tn_openrecords__closepopup();
	});

	/* load list */
	tn_openrecords__loadRecordsList();
}

function tn_openrecords__closepopup() {
	$('#openrecords_popup').remove();
	delete window.fonts_missed;
}

function tn_openrecords__loadRecordsList() {
	tn_console('func: tn_openrecords__loadRecordsList');

	var pageid = $('.tn-artboard').attr('data-page-id');
	var recordid = $('.tn-artboard').attr('data-record-id');

	var d = {};
	d['comm'] = 'getrecordslist';
	d['pageid'] = pageid;
	d['recordid'] = recordid;

	$.ajax({
		type: 'POST',
		url: '/zero/get/',
		data: d,
		dataType: 'text',
		success: function (respond) {
			var data_json_str = respond;
			var data = JSON.parse(data_json_str);
			tn_console(data);

			var cur_recordid = $('.tn-artboard').attr('data-record-id');

			var str = '';
			data.forEach(function (rec) {
				str +=
					'<div class="sui-btn-openrecords-open" data-openrecords-open-recordid="' +
					rec.id +
					'" data-openrecords-open-pageid="' +
					rec.pageid +
					'">Block #' +
					rec.id +
					(cur_recordid == rec.id ? ' <span style="opacity:0.3;">(current)</span>' : '') +
					'</div>';
			});

			$('#openrecords_popup_recordslist').html(str);

			$('.sui-btn-openrecords-open').click(function () {
				var recordid = $(this).attr('data-openrecords-open-recordid');
				var pageid = $(this).attr('data-openrecords-open-pageid');
				if (window.tn.last_changes > window.tn.last_save_db) {
					tn_openrecords__beforeGo(recordid, pageid);
				} else {
					tn_openrecords__gorecord(recordid, pageid);
				}
				tn_openrecords__closepopup();
			});
		},
		error: function () {},
	});
}

function tn_openrecords__beforeGo(recordid, pageid) {
	$('body').append(
		'<table class="tn-dialog"><tr><td class="tn-dialog__td"><div class="tn-close-icon"></div><div class="tn-dialog__content"></div></td></tr></table>',
	);
	var str =
		'<div style="text-align:center;">' +
		'<div style="font-size:36px; padding: 40px 0px;">Last changes haven\'t been saved. Do you want to save it?</div>' +
		'<table width="100%">' +
		'<tr>' +
		'<td style="padding-right:5px;"><div class="tn-dialog__btn tn-dialog__openrecords__btn-go"><div class="tn-dialog__btn-icon">Don\'t Save</div></div></td>' +
		'<td style="padding-right:5px;"><div class="tn-dialog__btn tn-dialog__btn_primary tn-dialog__openrecords__btn-save"><div class="tn-dialog__btn-icon">Save and Continue</div></div></td>' +
		'</tr>' +
		'</table>' +
		'</div>';

	$('.tn-dialog__content').html(str);

	$('.tn-dialog__openrecords__btn-save').click(function () {
		artboard__Save__toDB('gorecord_after_save:' + recordid + ':' + pageid);
	});

	$('.tn-dialog__openrecords__btn-go').click(function () {
		tn_openrecords__gorecord(recordid, pageid);
	});

	$('.tn-close-icon').click(function () {
		$('.tn-dialog').remove();
	});
}

function tn_openrecords__gorecord(recordid, pageid) {
	var c = Math.random().toString(36).substring(7);

	if (!window.frameElement && pageid > 0) {
		window.location.href = '/zero/?recordid=' + recordid + '&pageid=' + pageid + '&nocash=' + c;
	} else {
		parent.document.querySelector('.t396__iframe').src =
			'/zero/?recordid=' + recordid + '&pageid=' + pageid + '&nocash=' + c;
		window.top.location.href = '/zero/?recordid=' + recordid + '&pageid=' + pageid + '&nocash=' + c;
	}
}
