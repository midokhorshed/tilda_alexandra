function tn_html__openEditor(elem_id) {
	window.tn_flag_settings_ui_focus = true;
	var value = $('#' + elem_id)
		.find('.tn-atom__html-textarea')
		.val();
	var $body = $('body');

	var s = '';
	s +=
		'<div class="tn-wincode" data-code-elem-id="' +
		elem_id +
		'" style="position:fixed; z-index:10000; top:0; left:0; display:table; width:100%; height:100vh; background-color:#aaa;">';

	s += '<div style="display:table-row;">';
	s +=
		'<div style="display:table-cell; width:100%; height:60px; background-color:#000; text-align:right; vertical-align:middle;">';
	s += '<table width="150px" style="float:right;">';
	s += '<tr>';
	s +=
		'<td style="width:160px; padding-right:20px;"><div class="tn-code-save-btn" style="width:160px;"><div class="tn-code-save-btn__icon">Close & Update</div></div></td>';
	s += '</tr>';
	s += '</table>';
	s += '</div>';
	s += '</div>';

	s += '<div style="display:table-row;">';
	s += '<div style="display:table-cell; width:100%; height:100%; background-color:#eee;">';
	s += '<pre id="aceeditor" style="width:100%;height:100vh;"></pre>';
	s += '</div>';
	s += '</div>';

	s += '</div>';
	$body.append(s);

	$('.tn-wincode pre').text(value);

	var aceeditor = ace.edit('aceeditor');
	aceeditor.setTheme('ace/theme/github');
	aceeditor.session.setMode('ace/mode/html');
	aceeditor.setAutoScrollEditorIntoView(true);
	aceeditor.setOption('minLines', 10);
	aceeditor.setOption('maxLines', 30);

	$body.addClass('tn-body_lockscroll');

	$('.tn-code-save-btn').click(function () {
		var value = aceeditor.getValue();
		var parsedHtml = new DOMParser().parseFromString(value + '<div id="tilda"></div>', 'text/html');
		if (parsedHtml.body.querySelector('#tilda') == null) {
			alert("Can't save, end tag is missing. Invalid HTML may cause problems with markup. Please fix it.");
			return;
		}

		var elemid = $('.tn-wincode').attr('data-code-elem-id');
		$('#' + elemid)
			.find('.tn-atom__html-textarea')
			.val(value);
		$('.tn-wincode').remove();
		window.tn_flag_settings_ui_focus = false;
		$body.removeClass('tn-body_lockscroll');
	});

	$('.tn-code-close-btn').click(function () {
		$('.tn-wincode').remove();
		$body.removeClass('tn-body_lockscroll');
		window.tn_flag_settings_ui_focus = false;
	});
}

function tn_form__openEditor(elem_id) {
	window.tn_flag_settings_ui_focus = true;
	var value = $('#' + elem_id)
		.find('.tn-atom__inputs-textarea')
		.val();
	var $body = $('body');

	var s =
		'<div class="tn-wincode" data-code-elem-id="' +
		elem_id +
		'" style="position:fixed; z-index:2000; top:0; left:0; display:block; overflow-y: auto; overflow-x:hidden; width:100%; height:100vh; background-color:#fff;">' +
		'<div style="display:table;width:100%; position:fixed; z-index:1000; width:100%;">' +
		'<div style="display:table-cell; width:100%; height:60px; background-color:#000; text-align:right; vertical-align:middle;">' +
		'<table width="150px" style="float:right;">' +
		'<tr>' +
		'<td style="width:160px; padding-right:20px;"><div class="tn-code-save-btn" style="width:160px;"><div class="tn-code-save-btn__icon">Close & Update</div></div></td>' +
		'</tr>' +
		'</table>' +
		'</div>' +
		'</div>' +
		'<div style="display:table;width:100%;">' +
		'<div style="display:table-cell; width:100%; height:100%; background-color:#fff;">' +
		'<div style="display:block;width:720px;margin:auto;padding:20px;padding-top:80px;">' +
		'<textarea class="editlist__data" name="forminputs" rows="2" id="noredactor" style="height:100px; width:90%; display:none;">' +
		value +
		'</textarea>' +
		'<div class="editlist__wrapper" data-ui-type="edfo" data-foparams=""></div>' +
		'<a href="javascript:edfo__add()" style="font-size:14px; width:720px; font-weight:600; text-align:center; text-transform:uppercase; background-color:#000; color:#fff !important; display:block; padding:20px 0px; text-decoration:none;">Add input field</a><br>' +
		'</div>' +
		'</div>' +
		'</div>' +
		'</div>';

	$body.append(s);

	window.lang = 'EN';
	window.lireplaces = '';

	edfo__init();

	$body.addClass('tn-body_lockscroll').removeClass('userselect_none');

	$('.tn-code-save-btn').click(function () {
		edfo__allitems__getData__inJson();
		var updatedValue = $('.editlist__data').val();
		var elemid = $('.tn-wincode').attr('data-code-elem-id');
		$('#' + elemid)
			.find('.tn-atom__inputs-textarea')
			.val(updatedValue);
		control__drawUi__inputs(elem_id);
		$('.tn-wincode').remove();
		window.tn_flag_settings_ui_focus = false;
		$body.removeClass('tn-body_lockscroll').addClass('userselect_none');
		elem__renderForm($('#' + elemid), updatedValue);
		if (updatedValue !== value) tn_set_lastChanges();
	});

	$('.tn-code-close-btn').click(function () {
		$('.tn-wincode').remove();
		$body.removeClass('tn-body_lockscroll').addClass('userselect_none');
		window.tn_flag_settings_ui_focus = false;
	});
}

function tn_form__preOpenEditor(elem_id) {
	$.getScript('/front/js/t-edrec-form.min.js', function (data, textStatus) {
		if (textStatus == 'success') {
			setTimeout(function () {
				tn_form__openEditor(elem_id);
			}, 500);
		} else {
			alert('Error open edit form inputs in zeroblock');
		}
	});
}
