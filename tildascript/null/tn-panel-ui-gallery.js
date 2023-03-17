function control__drawUi__galleryupload(elem_id) {
	$(document).ready(function () {
		var $c = $('[data-control-field=imgs]');
		var value = $c.attr('data-control-value');
		var $el = $('#' + elem_id);
		var galleryData = JSON.parse(value);
		var str = '';

		var showVideoSettings = $.grep(galleryData, function (item) {
			return item.li_youtube || item.li_viemo;
		}).length;

		var showCaptionSettings = $.grep(galleryData, function (item) {
			return item.li_imgtitle;
		}).length;

		var $inp;
		var $fdiv;
		var $flabel;
		var $fdel;
		var $freplace;
		var $ftext;

		if (!showVideoSettings) {
			$('.tn-settings .sui-panel__section-playicon').css('display', 'none');
		}

		if (!showCaptionSettings) {
			$('.tn-settings .sui-panel__section-font').css('display', 'none');
		}

		str +=
			'<div class="position:relative;">' +
			'<input data-tu-multiple="yes" type="text" value="' +
			value +
			'" name="imgs" class="sui-input">' +
			'</div>' +
			'<table class="sui-file-div">';

		galleryData = galleryData.filter(function (img) {
			if (img.li_img) str += control__drawUi__galleryupload_imgPreview(img);
			return img.li_img;
		});

		str += '</table>';

		$c.html(str);

		$inp = $('[name=imgs]');
		$fdiv = $c.find('.sui-file-div');
		$flabel = $c.find('.sui-file-label');
		$fdel = $c.find('.sui-file-del');
		$freplace = $c.find('.sui-file-replace-trigger');
		$ftext = $c.find('.sui-file-settings');

		if (
			value !== '' &&
			value != '/img/imgfishsquare.gif' &&
			value != '//tilda.ws/img/imgfishsquare.gif' &&
			value != 'https://tilda.ws/img/imgfishsquare.gif'
		) {
			$flabel.html('...' + value.substr(value.length - 15));
			$fdiv.css('display', 'block');
		} else {
			$flabel.html('');
			$fdiv.css('display', 'none');
		}

		$inp.change(function () {
			var v = $(this).val();
			var galleryData = JSON.parse(value);
			var updatedGelleryData;
			var deletedImgId;
			var img;
			var newImgs;
			var newImgData;
			var imgId;
			var updatedData;
			var filewidth;
			var fileheight;

			$(this).closest('.sui-form-group').attr('data-control-value', v);

			v = JSON.parse(v);

			if (v.type === 'del') {
				updatedGelleryData = [];
				deletedImgId = v.payload;

				for (var i = 0; i < galleryData.length; i++) {
					img = galleryData[i];

					if (img.lid != deletedImgId) updatedGelleryData.push(img);
				}

				galleryData = updatedGelleryData;
			} else if (v.type === 'add') {
				newImgs = v.payload;

				for (var j = 0; j < newImgs.length; j++) {
					newImgData = newImgs[j];

					galleryData[galleryData.length] = {
						lid: newImgData.tuInfo.uuid,
						li_img: newImgData.tuInfo.cdnUrl,
						li_imgalt: '',
						li_imgtitle: '',
						li_imgurl: '',
						li_imgtarget: false,
						li_imgnofollow: false,
						li_youtube: '',
						li_vimeo: '',
					};
				}
			} else if (v.type === 'update') {
				imgId = v.payload.imgId;
				updatedData = v.payload.updatedData;
				galleryData = tn_slds_updateSlideData(galleryData, imgId, updatedData);
			}

			v = JSON.stringify(galleryData);

			elem__setFieldValue($el, 'imgs', v);
			elem__renderView($el);
			panelSettings__updateUi($el, 'imgs');

			filewidth = elem__getFieldValue($el, 'filewidth');
			fileheight = elem__getFieldValue($el, 'fileheight');

			if (v != '' && v != '/img/imgfishsquare.gif') {
				$flabel.html(
					'...' +
						v.substr(v.length - 15) +
						(filewidth > 0 && fileheight > 0 ? ' (' + filewidth + 'x' + fileheight + ')' : ''),
				);

				$fdiv.css('display', 'block');
			} else {
				$flabel.html('');
				$fdiv.css('display', 'none');
			}

			tn_set_lastChanges();
		});

		$fdel.click(function () {
			var $el = $('#' + elem_id);

			tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);

			$inp.val(
				JSON.stringify({
					type: 'del',
					payload: $(this).attr('data-img-id'),
				}),
			);

			$inp.trigger('change');
		});

		$ftext.on('click', function () {
			var imgId = $(this).closest('tr').attr('data-img-id');
			var $popup = $('.tn-gallery-popup[data-img-id=' + imgId + ']');

			if ($popup.length) {
				$popup.remove();
			} else {
				$('.tn-gallery-popup').remove();
				tn_slds_showPopup(imgId, $el);
			}
		});

		$freplace.each(function () {
			var $this = $(this);
			var elementid = $this.attr('id');

			if (!elementid) {
				elementid = 'tuwidget' + parseInt(Math.floor(Math.random() * (999999 - 99999 + 1)) + 99999, 10);
				$this.attr('id', elementid);
			}

			TUWidget.init($this).done(function (file) {
				var $c = $('[data-control-field=imgs]');
				var value = JSON.parse($c.attr('data-control-value'));
				var $el = $('#' + elem_id);
				var imgId = $this.closest('tr').attr('data-img-id');
				var imgData;

				tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);

				for (var i = 0; i < value.length; i++) {
					imgData = value[i];

					if (imgId == imgData.lid) {
						imgData.li_img = file.tuInfo.cdnUrl;
						break;
					}
				}

				elem__setFieldValue($el, 'imgs', JSON.stringify(value));

				if (file.tuInfo.width > 1) elem__setFieldValue($el, 'filewidth', file.tuInfo.width, '', '');
				if (file.tuInfo.height > 1)
					elem__setFieldValue($el, 'fileheight', file.tuInfo.height, '', '', window.tn.topResolution);

				elem__renderView($el);
				panelSettings__updateUi($el, 'imgs');
				panelSettings__updateUi($el, 'width');
				panelSettings__updateUi($el, 'left');
				panelSettings__updateUi($el, 'top');
			});
		});

		$inp.each(function () {
			var $this = $(this);
			var elementid = $this.attr('id');

			if (!elementid) {
				elementid = 'tuwidget' + parseInt(Math.floor(Math.random() * (999999 - 99999 + 1)) + 99999, 10);
				$this.attr('id', elementid);
			}

			TUWidget.init($this).done(function (data) {
				var addData = {
					type: 'add',
					payload: data,
				};

				tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);

				$inp.val(JSON.stringify(addData));
				$inp.trigger('change');
			});
		});
	});

	$('.sui-file-div tbody').sortable({
		helper: 'clone',
		opacity: 0.8,
		revert: false,
		tolerance: 'pointer',
		axis: 'y',
		update: function () {
			var $c = $('[data-control-field=imgs]');
			var value = JSON.parse($c.attr('data-control-value'));
			var $el = $('#' + elem_id);
			var imgDataObject = {};
			var sortedImgList = [];
			var imgData;
			var imgId;

			for (var i = 0; i < value.length; i++) {
				imgData = value[i];
				imgDataObject[imgData.lid] = imgData;
			}

			$('.sui-file-div tbody tr').each(function () {
				sortedImgList.push($(this).attr('data-img-id'));
			});

			for (var j = 0; j < sortedImgList.length; j++) {
				imgId = sortedImgList[j];
				sortedImgList[j] = imgDataObject[imgId];
			}

			value = JSON.stringify(sortedImgList);

			elem__setFieldValue($el, 'imgs', value);
			elem__renderView($el);
			panelSettings__updateUi($el, 'imgs');
		},
	});
}

function control__drawUi__galleryupload_imgPreview(imgData) {
	var str;

	if (typeof imgData == 'undefined') return 'no info...';

	str =
		'<tr class="sui-file-list" data-img-id="' +
		imgData.lid +
		'">' +
		'<td style="vertical-align:top;">' +
		'<label class="sui-label sui-label_imgs-preview">' +
		'<div class="sui-file-replace-trigger sui-image-preview" style="background-image: url(' +
		imgData.li_img +
		');">';

	if (imgData.li_youtube || imgData.li_vimeo) {
		str +=
			'<svg viewBox="0 0 60 60">' +
			'<g stroke="none" stroke-width="1" fill="" fill-rule="evenodd">' +
			'<g class="tn-elem__gallery__play_icon__color-holder" transform="translate(-691.000000, -3514.000000)" fill="#FFFFFF">' +
			'<path d="M721,3574 C737.568542,3574 751,3560.56854 751,3544 C751,3527.43146 737.568542,3514 721,3514 C704.431458,3514 691,3527.43146 691,3544 C691,3560.56854 704.431458,3574 721,3574 Z M715,3534 L732,3544.5 L715,3555 L715,3534 Z"></path>' +
			'</g>' +
			'</g>' +
			'</svg>';
	}

	str +=
		'</div>' +
		'</label>' +
		'</td>' +
		'<td style="width:100%; vertical-align:top;">' +
		'<a href="' +
		imgData.li_img +
		'" target="_blank" style="padding-right: 15px;" class="sui-file-label-imgs">…' +
		imgData.li_img.substr(imgData.li_img.length - 15) +
		'</a>' +
		'<div class="sui-btn sui-file-replace sui-file-replace-trigger" style="margin-left:0; ">Replace</div>' +
		'<div class="sui-btn sui-file-settings" style="margin-left:0; ">Settings</div>' +
		'<div data-img-id="' +
		imgData.lid +
		'" class="sui-btn sui-file-del sui-file-del_no-border">x</div>' +
		'</td>' +
		'</tr>';

	return str;
}
