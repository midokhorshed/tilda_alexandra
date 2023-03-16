function control__drawUi__upload(elem_id, field) {
	$(document).ready(function () {
		var $c = $('[data-control-field=' + field + ']');
		var value = $c.attr('data-control-value');
		var $el = $('#' + elem_id);
		var type = $el.attr('data-elem-type');
		var isUploadedImg = tn_isUploadedImage($el);
		var str = '';
		var $inp;
		var $fdiv;
		var $flabel;
		var $fdel;
		var $freset;
		var $fedit;
		var $fupload;
		var $fwarning;
		var $ferror;

		str +=
			'<div class="sui-input-upload-div">' +
			'<input type="text" value="' +
			value +
			'" name="' +
			field +
			'" class="sui-input">';

		if ($el.attr('data-elem-type') != 'tooltip') {
			str +=
				'<a href="javascript:tn_openImageSearchPopup(\'' +
				elem_id +
				"','" +
				field +
				'\');" class="sui-imagesearch-btn pe-imagesearch-btn tooltip" data-tooltip="Search the library"><div class="pe-imagesearch-btn__icon"></div></a>';
		}

		str +=
			'</div>' +
			'<table class="sui-file-div">' +
			'<tr>' +
			'<td style="vertical-align:top;">' +
			'<label class="sui-label">File</label>' +
			'</td>' +
			'<td style="width:100%; vertical-align:top;">' +
			'<div class="sui-file-label"></div>' +
			'<div class="sui-btn sui-btn_sm sui-file-del">Delete</div>';

		if (field == 'img') str += '<div class="sui-btn sui-btn_sm sui-file-reset">Original size</div>';
		if (value.indexOf('.svg') === -1) str += '<div class="sui-btn sui-btn_sm sui-file-edit">Edit</div>';
		if (!isUploadedImg) {
			str += "<div class='sui-file-error'>The image is too large, please resize it.</div>";
			str +=
				"<div class='sui-file-warning'>The image is being uploaded from Figma's servers. Cliсk \"Upload to Tilda\" to complete the import.</div>";
			str += "<div class='sui-btn sui-file-upload'>Upload to Tilda</div>";
		}

		str += '</td></tr></table>';

		$c.html(str);

		$inp = $('.tn-settings [name=' + field + ']');
		$fdiv = $c.find('.sui-file-div');
		$flabel = $c.find('.sui-file-label');
		$fdel = $c.find('.sui-file-del');
		$freset = $c.find('.sui-file-reset');
		$fedit = $c.find('.sui-file-edit');
		$fupload = $c.find('.sui-file-upload');
		$fwarning = $c.find('.sui-file-warning');
		$ferror = $c.find('.sui-file-error');

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

		if (!isUploadedImg) {
			var isUploadError = elem__getFieldValue($el, 'uploaderror') === 'y';
			$('.sui-file-del, .sui-file-reset, .sui-file-edit').css('display', 'none');
			if (isUploadError) {
				$ferror.css('display', 'block');
				$fupload.css('display', 'none');
				$fwarning.css('display', 'none');
			} else {
				$fupload.css('display', 'inline-block');
				$fwarning.css('display', 'inline-block');
				$ferror.css('display', 'none');
			}
		}

		$inp.change(function () {
			var v = $(this).val();
			var isNewUrlFromTilda = tn_isUploadedImage(v);
			var filewidth;
			var fileheight;
			var elem_type;

			if (isNewUrlFromTilda) {
				$('.sui-file-del, .sui-file-reset, .sui-file-edit').css('display', 'inline-block');
				$fupload.css('display', 'none');
				$fwarning.css('display', 'none');
				$ferror.css('display', 'none');
				elem__emptyField($el, 'amazonsrc');
				elem__emptyField($el, 'uploaderror');
				if (!isUploadedImg) {
					tn_updateOutlineDescription();
				}
			}

			$(this).closest('.sui-form-group').attr('data-control-value', v);

			elem__setFieldValue($el, field, v);
			elem__renderViewOneField($el, field);

			var bgPosition = elem__getFieldValue($el, 'bgposition');
			if (type === 'shape') {
				if (bgPosition === 'custom') {
					elem__setFieldValue($el, 'bgposition', 'center center', 'render');
					elem__setFieldValue($el, 'bgposition_imgpos', '', 'render');
					elem__setFieldValue($el, 'bgposition_imgsize', '', 'render');
				}

				panelSettings__updateUi($el, 'bgposition');
			}

			filewidth = elem__getFieldValue($el, 'filewidth');
			fileheight = elem__getFieldValue($el, 'fileheight');

			if (filewidth > 0 && fileheight > 0) {
				$freset.css('display', 'inline-block');
			} else {
				$freset.css('display', 'none');
			}

			if (v != '' && v != '/img/imgfishsquare.gif') {
				$flabel.html(
					'...' +
						v.substr(v.length - 15) +
						(filewidth > 0 && fileheight > 0 ? ' (' + filewidth + 'x' + fileheight + ')' : ''),
				);
				$fdiv.css('display', 'block');

				if (v.indexOf('.svg') === -1) {
					$fedit.css('display', 'inline-block');
				} else {
					$fedit.css('display', 'none');
				}
			} else {
				$flabel.html('');
				$fdiv.css('display', 'none');
			}

			elem_type = $el.attr('data-elem-type');

			if (field == 'bgimg' && elem_type == 'video') {
				elem__renderViewOneField($el, 'youtubeid');
				elem__renderViewOneField($el, 'vimeoid');
				elem__renderViewOneField($el, 'mp4video');
			}

			tn_set_lastChanges();
		});

		$fupload.click(function () {
			$fupload.html('Uploading');
			tn_uploadImageToTilda(value, function (file) {
				if (!file.error) {
					$inp.val(file.cdnUrl);
					if (file.width > 1) elem__setFieldValue($el, 'filewidth', file.width, '', '', window.tn.topResolution);
					if (file.height > 1) elem__setFieldValue($el, 'fileheight', file.height, '', '', window.tn.topResolution);
					$inp.trigger('change');
					elem__emptyField($el, 'amazonsrc');
					tn_updateOutlineDescription();
					tn_figma__checkAmazonImages();
					$fwarning.css('display', 'none');
				} else {
					elem__setFieldValue($el, 'uploaderror', 'y');
					$ferror.css('display', 'block');
				}

				tn_set_lastChanges();
			});
		});

		$fdel.click(function () {
			var $el = $('#' + elem_id);

			tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);

			if (field == 'img') {
				$inp.val('/img/imgfishsquare.gif');
			} else {
				$inp.val('');
			}

			$inp.trigger('change');
		});

		$freset.click(function () {
			var $el = $('#' + elem_id);
			var filewidth;
			var fileheight;

			tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);

			filewidth = elem__getFieldValue($el, 'filewidth');
			fileheight = elem__getFieldValue($el, 'filewidth');

			if (filewidth > 0 && fileheight > 0) {
				elem__setFieldValue($el, 'width', filewidth, 'render', 'updateui');
				elem__setFieldValue($el, 'height', fileheight);
			}

			tn_setOutlinePosition('selected');
		});

		$fedit.click(function () {
			tn_tui_editimage(elem_id, function (dataURL) {
				$inp.data('tildaupload').uploadFileFromURL(dataURL);
				window.tu_flag_widget_ui_focus = false;
			});
		});

		$inp.each(function () {
			var $this = $(this);
			var elementid;

			elementid = $this.attr('id');

			if (!elementid) {
				elementid = 'tuwidget' + parseInt(Math.floor(Math.random() * (999999 - 99999 + 1)) + 99999);
				$this.attr('id', elementid);
			}

			var $inpContainer = $inp.closest('.sui-form-group');
			$inpContainer.addClass('sui-form-group_placeholder-upload');
			setTimeout(function () {
				if ($('#' + elementid).length === 0) return;
				TUWidget.init($this).done(function (file) {
					console.log(file.tuInfo);
					console.log(file.tuInfo.cdnUrl);

					tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);

					if (file.tuInfo.width > 1) {
						elem__setFieldValue($el, 'filewidth', file.tuInfo.width);
					} else {
						elem__delFieldValue($el, 'filewidth');
					}

					if (file.tuInfo.height > 1) {
						elem__setFieldValue($el, 'fileheight', file.tuInfo.height);
					} else {
						elem__delFieldValue($el, 'fileheight');
					}

					$inp.val(file.tuInfo.cdnUrl);
					$inp.trigger('change');

					$el
						.find('img')
						.one('load', function () {
							elem__renderViewOneField($el, 'top');
						})
						.each(function () {
							if (this.complete) $(this).load();
						});

					setTimeout(function () {
						$('#' + elementid + '-previews')
							.removeClass('tu-popup-progressbar-completed')
							.removeClass('tu-processing')
							.removeClass('tu-image-preview')
							.removeClass('tu-success')
							.removeClass('tu-complete')
							.addClass('tu-popup-progressbar-start');
					}, 3000);

					$this.removeClass('sui-input_placeholder-color');
				});
				$inpContainer.removeClass('sui-form-group_placeholder-upload');
			}, 1);
		});
	});
}
