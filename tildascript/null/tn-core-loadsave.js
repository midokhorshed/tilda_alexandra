function artboard__Save__toLS() {
	tn_console('func: save__Data__Json');

	var recordid = $('.tn-artboard').attr('data-record-id');

	/* get data object */
	/* and convert to json string */
	var allelems_data = allelems__getData__inJson();

	/* clean data */
	allelems_data = allelems__cleanData__inJson(allelems_data);

	var allelems_data_json_str = JSON.stringify(allelems_data);
	var timestamp = allelems_data.timestamp;

	/* Put the object into storage */
	localStorage.setItem('artboard' + recordid + '_data', allelems_data_json_str);
	window.tn.last_save_ls = timestamp;
}

function artboard__Save__toDB(flag_do) {
	tn_console('func: artboard__Save__toDB');
	var $saveBtn = $('.tn-save-btn');
	var $artboard = $('.tn-artboard');

	$saveBtn.addClass('tn-save-btn_processed');
	$saveBtn.find('.tn-save-btn__icon').html('wait');

	var pageid = $artboard.attr('data-page-id');
	var recordid = $artboard.attr('data-record-id');

	/* get data object */
	/* and convert to json string */
	var allelems_data = allelems__getData__inJson(); //todo - переименовать в allelems_and_ab__getData__inJson();

	// todo - вынести в отдельную функцию
	var zb_grid;

	if (allelems_data.ab_gridglobal !== 'block') {
		zb_grid = $artboard.attr('data-project-zb_grid');
		zb_grid = zb_grid ? JSON.parse(zb_grid) : {};

		if (allelems_data.ab_gridcolor) zb_grid.ab_gridcolor = allelems_data.ab_gridcolor;
		if (allelems_data.ab_gridlineopacity) zb_grid.ab_gridlineopacity = allelems_data.ab_gridlineopacity;
		if (allelems_data.ab_gridopacity) zb_grid.ab_gridopacity = allelems_data.ab_gridopacity;
		if (typeof allelems_data.ab_grid !== 'undefined' && allelems_data.ab_grid) zb_grid.ab_grid = allelems_data.ab_grid;

		window.tn.screens.forEach(function (screen) {
			if (typeof allelems_data['ab_grid-res-' + screen] !== 'undefined' && allelems_data['ab_grid-res-' + screen]) {
				zb_grid['ab_grid-res-' + screen] = allelems_data['ab_grid-res-' + screen];
			}
		});

		delete allelems_data.ab_gridcolor;
		delete allelems_data.ab_gridlineopacity;
		delete allelems_data.ab_gridopacity;
		delete allelems_data.ab_grid;

		window.tn.screens.forEach(function (screen) {
			delete allelems_data['ab_grid-res-' + screen];
		});
	} else {
		var isEmptyGridOptions = 0;
		window.tn.screens.forEach(function (screen) {
			if (!allelems_data['ab_grid-res-' + screen]) isEmptyGridOptions += 1;
		});

		if (
			!allelems_data.ab_gridcolor &&
			!allelems_data.ab_gridlineopacity &&
			!allelems_data.ab_gridopacity &&
			!allelems_data.ab_grid &&
			isEmptyGridOptions === window.tn.screens.length
		) {
			allelems_data.ab_gridglobal = '';
		}
	}

	/* clean data */
	allelems_data = allelems__cleanData__inJson(allelems_data);

	var allelems_data_json_str = JSON.stringify(allelems_data);
	var timestamp = allelems_data.timestamp;

	var d = {
		comm: 'savezerocode',
		pageid: pageid,
		recordid: recordid,
		onlythisfield: 'code',
		fromzero: 'yes',
		code: allelems_data_json_str,
	};

	if (zb_grid) {
		zb_grid = Object.keys(zb_grid).length ? JSON.stringify(zb_grid) : 'reset';
		d.zb_grid = zb_grid;
	}

	var ts = Date.now();

	$.ajax({
		type: 'POST',
		url: '/zero/submit/',
		data: d,
		dataType: 'text',
		success: function (respond) {
			setTimeout(function () {
				if (respond == '') {
					$saveBtn.find('.tn-save-btn__icon').html('Ok');
				} else {
					$saveBtn.find('.tn-save-btn__icon').html('Error');
				}

				setTimeout(function () {
					$saveBtn.removeClass('tn-save-btn_processed');
					$saveBtn.find('.tn-save-btn__icon').html('Save');
				}, 700);
			}, 300);

			if (respond == '') {
				window.tn.last_save_db = timestamp;
				$('.tn-saved').html(window.tn.last_save_db);
				artboard__Empty__toLS();
				if (typeof flag_do !== 'undefined' && flag_do === 'close_after_save') {
					tn_close();
				}
				if (typeof flag_do !== 'undefined' && flag_do.indexOf('gorecord_after_save') > -1) {
					var foo = flag_do.split(':');
					tn_openrecords__gorecord(foo[1], foo[2]);
				}
			} else {
				if (typeof respond === 'string' && respond === 'too much data') {
					alert(
						'Saving error: block cannot be saved because it contains too much data. Please create a new Zero Block and move some of the elements there.',
					);
				} else if (typeof respond === 'string' && respond.substring(0, 10) === '<!--tlp-->') {
					// window.location = '/login/';
					// throw new Error("Sorry, you logout!");
					alert(
						'Saving error: changes are not saved. You have logged out. What to do: Do not close this tab. Open a new tab in your browser and log in to your account. Then go back to this tab and try saving your changes again.',
					);
				} else if (typeof respond === 'string' && respond.substring(0, 12) === '<!--tpbaa-->') {
					alert(
						'Saving error: changes are not saved. You have been logged in with another account. What to do: do not close this tab. Open new tab in the browser and log in to your account. Then come back to this tab and try save again.',
					);
				} else {
					alert('Saving error. Please try again latter. Comments: ' + respond);
				}
				console.log('error saving');
				console.log(respond);
			}
		},
		error: function (xhr) {
			var ts_delta = Date.now() - ts;

			if (!(xhr.status == 0 && ts_delta < 100)) {
				try {
					errorLog({e: 'savezero', data: d, xhr: xhr.status, ts: ts_delta});
				} catch (e) {
					//
				}
			}

			$saveBtn.find('.tn-save-btn__icon').html('Error!');
			$saveBtn.css('background-color', 'red');

			setTimeout(function () {
				$saveBtn.removeClass('tn-save-btn_processed');
				$saveBtn.find('.tn-save-btn__icon').html('Save');
				$saveBtn.css('background-color', '#f06847');
			}, 2000);

			alert('Error! Changes are not saved. Please check the internet connection or try again later.');
		},
		timeout: 1000 * 60,
	});
}

function artboard__Load__fromLS() {
	tn_console('func: artboard__Load__fromLS');

	$('.tn-elem').each(function () {
		var $el = $(this);
		$el.remove();
	});

	var $artboard = $('.tn-artboard');
	var recordid = $artboard.attr('data-record-id');
	var data_json_str = localStorage.getItem('artboard' + recordid + '_data');
	var data = JSON.parse(data_json_str);

	tn_console(data);
	artboard__Build(data);
	ab__renderGrid();
	tn_hideFullscreenLoader();

	return data;
}

function artboard__Load__fromDB() {
	tn_console('func: artboard__Load__fromDB');

	var $artboard = $('.tn-artboard');
	var pageid = $artboard.attr('data-page-id');
	var recordid = $artboard.attr('data-record-id');

	var d = {
		comm: 'getzerocode',
		pageid: pageid,
		recordid: recordid,
	};

	$.ajax({
		type: 'POST',
		url: '/zero/get/',
		data: d,
		dataType: 'text',
		success: function (respond) {
			var data_json_str = respond;
			var data = JSON.parse(data_json_str);
			if (data_json_str.length > 70000) tn_showFullscreenLoader();
			tn_console(data);

			/*check localstorage version */
			var flag_loaded_from_LS = '';
			if (
				!window.tn_role_dev &&
				localStorage.getItem('artboard' + recordid + '_data') !== null &&
				data !== null &&
				typeof data['timestamp'] !== 'undefined' &&
				data['timestamp'] > 0
			) {
				var foo = localStorage.getItem('artboard' + recordid + '_data');
				if (typeof foo == 'string') {
					var bar = JSON.parse(foo);
					if (
						typeof bar === 'object' &&
						typeof bar['timestamp'] !== 'undefined' &&
						bar['timestamp'] > data['timestamp']
					) {
						var delta_ts = new Date().getTime() - bar['timestamp'];
						if (delta_ts > 0 && delta_ts < 60 * 60 * 3 * 1000) {
							tn_console('You have unsaved changes in LocalStorage.');
							var delta_m = Math.ceil(delta_ts / 1000 / 60);
							if (
								confirm(
									'We have found a local unsaved version of this block (created nearly ' +
										(delta_m > 120 ? Math.ceil(delta_m / 60) + ' hours' : delta_m + ' mins') +
										' ago). Would you like to restore it?',
								)
							) {
								data = bar;
								flag_loaded_from_LS = 'y';
							}
						}
					}
				}
			}
			if (flag_loaded_from_LS == '') {
				artboard__Empty__toLS();
			}

			setTimeout(function () {
				artboard__Build(data);
				ab__renderGrid();
				tn_hideFullscreenLoader();
			}, 50);
		},
		error: function () {
			tn_hideFullscreenLoader();
			ab__renderGrid();
		},
	});
}

function tn_showSaveDialog__beforeClose() {
	$('body').append(
		'<table class="tn-dialog"><tr><td class="tn-dialog__td"><div class="tn-close-icon"></div><div class="tn-dialog__content"></div></td></tr></table>',
	);
	var str =
		'<div style="text-align:center;">' +
		'<div style="font-size:36px; padding: 40px 0px;">Last changes haven\'t been saved. Do you want to save it?</div>' +
		'<table width="100%">' +
		'<tr>' +
		'<td style="padding-right:5px;"><div class="tn-dialog__btn tn-dialog__btn-close"><div class="tn-dialog__btn-icon">Don\'t Save</div></div></td>' +
		'<td style="padding-right:5px;"><div class="tn-dialog__btn tn-dialog__btn_primary tn-dialog__btn-save"><div class="tn-dialog__btn-icon">Save and Close</div></div></td>' +
		'</tr>' +
		'</table>' +
		'</div>';

	$('.tn-dialog__content').html(str);

	$('.tn-dialog__btn-save').click(function () {
		/* artboard__Save__toLS(); */
		artboard__Save__toDB('close_after_save');
	});

	$('.tn-dialog__btn-close').click(function () {
		$(window).unbind('beforeunload');
		tn_close();
	});

	$('.tn-close-icon').click(function () {
		$('.tn-dialog').remove();
	});
}
