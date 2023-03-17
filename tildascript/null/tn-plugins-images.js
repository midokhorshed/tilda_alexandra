///////////////////////////////
////// TUI image editor
//////

function tn_tui_editimage(elem_id, editcalback) {
	var $el = $('#' + elem_id);

	var imageSrc = elem__getFieldValue($el, 'img');
	if (!imageSrc) imageSrc = elem__getFieldValue($el, 'bgimg');
	if (!imageSrc) imageSrc = elem__getFieldValue($el, 'tipimg');

	if (typeof imageSrc == 'undefined') {
		console.log('imgsrc is undefined');
		return;
	}

	window.upload_saveAs = function (dataURL, name) {
		editcalback(dataURL, name);

		window.tuiEditor.destroy();
		$('#tuiEditorTildaWidget').remove();
		window.tu_flag_widget_ui_focus = false;
		window.tuiEditor = false;
	};

	if (window.tuiEditor) {
		document.querySelector('.tui__editor-container').style.display = 'block';
	}

	tn_tui_onReady(imageSrc);
}

function tn_tui_initImageEditor(imageSrc) {
	if (typeof imageSrc == 'undefined') {
		console.log('imageSrc is undefined');
		return;
	}

	if (imageSrc.indexOf('tildacdn.info') > 0) {
		var pos = imageSrc.lastIndexOf('/');
		if (pos != imageSrc.length - 1) {
			imageSrc = imageSrc.substring(0, pos + 1);
		}
	} else if (imageSrc.substring(0, 1) == '/') {
		imageSrc = 'https://tilda.cc' + imageSrc;
	}

	window.tuiEditor = new tui.ImageEditor('#tui-image-editor-container', {
		includeUI: {
			menu: ['crop', 'flip', 'rotate', 'text', 'draw', 'filter' /* 'shape', 'icon' */],
			loadImage: {
				path: imageSrc,
				name: 'SampleImage',
			},
			theme: {
				'common.bi.image': '',
				'common.bisize.width': '251px',
				'common.bisize.height': '21px',
				'common.backgroundImage': 'none',
				'common.backgroundColor': '#1e1e1e',
				'common.border': '0px',

				// header
				'header.backgroundImage': 'none',
				'header.backgroundColor': 'transparent',
				'header.border': '0px',

				// load button
				/*
        'loadButton.backgroundColor': '#fff',
        'loadButton.border': '1px solid #ddd',
        'loadButton.color': '#222',
        'loadButton.fontFamily': '\'Noto Sans\', sans-serif',
        'loadButton.fontSize': '12px',
        */
				// download button
				'downloadButton.backgroundColor': '#fa876b' /* '#fdba3b', */,
				'downloadButton.border': '1px solid #fa876b',
				'downloadButton.color': '#fff',
				'downloadButton.fontFamily': "'Noto Sans', sans-serif",
				'downloadButton.fontSize': '12px',

				// main icons
				'menu.normalIcon.path': '/tpl/tuieditor/dist/svg/icon-d.svg',
				'menu.normalIcon.name': 'icon-d',
				'menu.activeIcon.path': '/tpl/tuieditor/dist/svg/icon-b.svg',
				'menu.activeIcon.name': 'icon-b',
				'menu.disabledIcon.path': '/tpl/tuieditor/dist/svg/icon-a.svg',
				'menu.disabledIcon.name': 'icon-a',
				'menu.hoverIcon.path': '/tpl/tuieditor/dist/svg/icon-c.svg',
				'menu.hoverIcon.name': 'icon-c',
				'menu.iconSize.width': '24px',
				'menu.iconSize.height': '24px',

				// submenu primary color
				'submenu.backgroundColor': '#1e1e1e',
				'submenu.partition.color': '#3c3c3c',

				// submenu icons
				'submenu.normalIcon.path': '/tpl/tuieditor/dist/svg/icon-d.svg',
				'submenu.normalIcon.name': 'icon-d',
				'submenu.activeIcon.path': '/tpl/tuieditor/dist/svg/icon-c.svg',
				'submenu.activeIcon.name': 'icon-c',
				'submenu.iconSize.width': '32px',
				'submenu.iconSize.height': '32px',

				// submenu labels
				'submenu.normalLabel.color': '#8a8a8a',
				'submenu.normalLabel.fontWeight': 'lighter',
				'submenu.activeLabel.color': '#fff',
				'submenu.activeLabel.fontWeight': 'lighter',

				// checkbox style
				'checkbox.border': '0px',
				'checkbox.backgroundColor': '#fff',

				// range style
				'range.pointer.color': '#fff',
				'range.bar.color': '#666',
				'range.subbar.color': '#d1d1d1',

				'range.disabledPointer.color': '#414141',
				'range.disabledBar.color': '#282828',
				'range.disabledSubbar.color': '#414141',

				'range.value.color': '#fff',
				'range.value.fontWeight': 'lighter',
				'range.value.fontSize': '11px',
				'range.value.border': '1px solid #353535',
				'range.value.backgroundColor': '#151515',
				'range.title.color': '#fff',
				'range.title.fontWeight': 'lighter',

				// colorpicker style
				'colorpicker.button.border': '1px solid #1e1e1e',
				'colorpicker.title.color': '#fff',
			},
			menuBarPosition: 'top',
			usageStatistics: false,
		},
		cssMaxWidth: 800,
		cssMaxHeight: 600,
		usageStatistics: false,
	});

	window.onresize = function () {
		if (window.tuiEditor) {
			window.tuiEditor.ui.resizeEditor();
		} else {
			setTimeout(function () {
				window.onresize();
			}, 300);
		}
	};
}

function tn_tui_onReady(imageSrc) {
	window.tu_flag_widget_ui_focus = true;
	if (!window.tuiEditor) {
		if (!window.tuiEditorLoad) {
			if ($('#tuiEditorTildaScriptVersion').length == 0) {
				var styleTui = document.createElement('link');
				styleTui.rel = 'stylesheet';
				styleTui.href = '/front/css/tui.min.css';
				document.documentElement.appendChild(styleTui);

				var scriptTui = document.createElement('script');
				scriptTui.src = '/front/js/tui-im-edit.min.js';
				scriptTui.id = 'tuiEditorTildaScriptVersion';
				document.documentElement.appendChild(scriptTui);

				scriptTui.onload = scriptTui.onerror = function () {
					window.tuiEditorLoad = true;
					if (!this.executed) {
						this.executed = true;
						tn_tui_onReady(imageSrc);
					}
				};

				scriptTui.onreadystatechange = function () {
					var self = this;
					if (this.readyState == 'complete' || this.readyState == 'loaded') {
						setTimeout(function () {
							self.onload();
						}, 0);
					}
				};
			}
		} else {
			tn_tui_addTuiContainer();
			tn_tui_initImageEditor(imageSrc);
		}
	} else {
		var tmp = imageSrc.split('/');
		window.tuiEditor.loadImageFromURL(imageSrc, tmp ? tmp[tmp.length - 1] : 'photo');
	}
}

function tn_tui_addTuiContainer() {
	var $tuiEditorTildaWidget = $('#tuiEditorTildaWidget');
	if ($tuiEditorTildaWidget.length > 0) {
		$tuiEditorTildaWidget.remove();
		window.tu_flag_widget_ui_focus = false;
		window.tuiEditor = false;
	}

	var editorContainer = document.createElement('div');
	editorContainer.id = 'tuiEditorTildaWidget';
	editorContainer.className = 'tui__editor-container';
	editorContainer.innerHTML =
		'<div class="tui__editor-fullscreen_bg"></div>' +
		'<div class="tui__editor-wrap">' +
		'<div class="tui__editor-header">' +
		'<span>Photo Editor</span>' +
		'<span class="tui__editor-header-close"></span>' +
		'</div>' +
		'<div id="tui-image-editor-container"></div>' +
		'</div>';
	document.documentElement.appendChild(editorContainer);

	var buttonClose = document.querySelector('.tui__editor-header-close');
	buttonClose.onclick = function () {
		editorContainer.style.display = 'none';
		window.tuiEditor = false;
		$tuiEditorTildaWidget.remove();
		window.tu_flag_widget_ui_focus = false;
	};
}

//////
////// END TUI image editor //////
//////////////////////////////////

function tn_openImageSearchPopup(elem_id, field) {
	var recid = '';
	if (typeof window.tn.artboard_id != 'undefined' && window.tn.artboard_id > 0) recid = window.tn.artboard_id;
	var imgid = elem_id;

	var tis_version = 2; /* window.location.search.indexOf('dev=yes') >= 0 ? 2 : 1; */
	if (tis_version == 2 && typeof tis__showImageSearch != 'function') {
		if ($('#js-tis-imagesearch').length == 0) {
			$('body').append(
				'<script id="js-tis-imagesearch" type="text/javascript" src="https://front.tildacdn.com/ccimagesearch/js/t__imagesearch.min.js"></script>' +
					'<link rel="stylesheet" href="https://front.tildacdn.com/ccimagesearch/css/t_imagesearch.min.css" >',
			);
		}
	}
	if (tis_version != 2) {
		$('body').append('<link href="/front/css/t-popups.min.css" rel="stylesheet">');
		$('body').append('<script src="/front/js/t-popups.min.js"  type="text/javascript"></script>');

		var s =
			'<div class="td-popup" id="popup_searchandselectimages">' +
			'<div class="td-popup__wrap">' +
			'<div class="td-popup-window"></div>' +
			'</div>' +
			'</div>' +
			'<style>.td-popup a{text-decoration:none;} .td-popup .imagesearch__item-tags{color:#000;} #popup_searchandselectimages ul{margin-top:0;margin-bottom:10px;} #popup_searchandselectimages .ss-btn{padding:13px 29px 15px;font-size:16px;}</style>';
		$('body').append(s);
	}
	$('.pe-imagesearch-btn').css('opacity', '0.4').css('pointer-events', 'none');

	setTimeout(function () {
		$(document).ready(
			(function () {
				var $initlink = $('#' + imgid)
					.closest('.js-image-box')
					.find('a[data-imagesearch-type]');
				var type = $initlink && $initlink.data('imagesearch-type') ? $initlink.data('imagesearch-type') : '';
				$.ajax({
					type: 'POST',
					url: '/projects/submit/searchimages/',
					data: {
						imgid: imgid,
						imgcallback: 'tn_insertImageFromSearch',
						imgtype: type,
						recid: recid,
						tn_field: field,
						tn_elem_id: elem_id,
						v: tis_version,
					},
					dataType: 'text',
					success: function (data) {
						window.tn_flag_settings_ui_focus = true;
						$('.pe-imagesearch-btn').css('opacity', '1').css('pointer-events', 'auto');

						if (tis_version && tis_version == 2) {
							data = $.parseJSON(data);
							if (!data.userid) {
								alert('Not found user');
								return;
							}
							var cntWait = 0;

							var waitLoad_tis__showImageSearch = function (imgid, userid, userhash, insertimagecalback) {
								if (cntWait >= 75) {
									alert('Request Timeout Image Search');
									location.reload();
									return false;
								}
								if (tis_version == 2 && typeof tis__showImageSearch != 'function') {
									setTimeout(function () {
										cntWait++;
										waitLoad_tis__showImageSearch(imgid, userid, userhash, insertimagecalback);
									}, 200);
								} else {
									tis__showImageSearch(imgid, userid, userhash, insertimagecalback);
								}
							};
							waitLoad_tis__showImageSearch(
								imgid,
								data.userid,
								data.userhash,
								data.imgcallback || 'tn_insertImageFromSearch',
							);
						} else {
							var $popupSearchSelectImages = $('#popup_searchandselectimages');
							$('body').addClass('td-body_popup-opened');
							$popupSearchSelectImages.css('z-index', '2001');
							$popupSearchSelectImages.addClass('td-popup_opened');
							$popupSearchSelectImages.find('.td-popup-window').html(data);
							$popupSearchSelectImages.fadeIn('fast');
							init_popup();
						}
					},
					error: function () {
						alert('Request Timeout');
						$('.pe-imagesearch-btn').css('opacity', '1').css('pointer-events', 'auto');
					},
					timeout: 1000 * 30,
				});
			})(this),
		);
	}, 700);
}

/*
function tn_openImageSearchPopup(elem_id,field){
	var recid='';
	if(typeof window.tn.artboard_id!='undefined' && window.tn.artboard_id>0)recid=window.tn.artboard_id;
	var imgid=elem_id;
	$('body').append('<link href="/tpl/css/t-popups.css?6" rel="stylesheet">');
	$('body').append('<script src="/tpl/js/t-popups.js?4"  type="text/javascript"></script>');

	var s='';
	s+='<div class="td-popup" id="popup_searchandselectimages"><div class="td-popup__wrap"><div class="td-popup-window">';
	s+='</div></div></div>';
	s+='<style>.td-popup a{text-decoration:none;} .td-popup .imagesearch__item-tags{color:#000;} #popup_searchandselectimages ul{margin-top:0;margin-bottom:10px;} #popup_searchandselectimages .ss-btn{padding:13px 29px 15px;font-size:16px;}</style>';
	$('body').append(s);

	$('.pe-imagesearch-btn').css('opacity','0.4').css('pointer-events','none');

	setTimeout(function() {
		$(document).ready(function(self){
			var $initlink = $('#'+imgid).closest('.js-image-box').find('a[data-imagesearch-type]');
			var type = $initlink && $initlink.data('imagesearch-type') ? $initlink.data('imagesearch-type') : '';
			$.ajax({
				type: "POST",
				url: "/projects/submit/searchimages/",
				data: {'imgid':imgid, 'imgcallback':'tn_insertImageFromSearch', 'imgtype':type, 'recid':recid, 'tn_field':field, 'tn_elem_id':elem_id},
				dataType : "text",
				success: function(data){
					window.tn_flag_settings_ui_focus=true;
					$('.pe-imagesearch-btn').css('opacity','1').css('pointer-events','auto');

					$('body').addClass('td-body_popup-opened');
					$('#popup_searchandselectimages').css('z-index','2001');
					$('#popup_searchandselectimages').addClass('td-popup_opened');
					$('#popup_searchandselectimages').find('.td-popup-window').html(data);
					$('#popup_searchandselectimages').fadeIn('fast');
					init_popup();
					$(document).keyup(keyUpFunc);

				},
				error: function(){
					alert('Request Timeout');
					$('.pe-imagesearch-btn').css('opacity','1').css('pointer-events','auto');
				},
				timeout: 1000*30
			});
		}(this));
	}, 700);
}


function closepopup() {
  $('.tn-searchandselectimages').remove();
}
*/

function tn_insertImageFromSearch(imgid, src) {
	var elem_id = imgid;
	var $el = $('#' + elem_id);
	var field = 'img';
	if ($el.attr('data-elem-type') == 'shape' || $el.attr('data-elem-type') == 'video') field = 'bgimg';
	var inp = $('.tn-settings [name=' + field + ']');
	inp.data('tildaupload').uploadFileFromURL(src);
}

function tn_slds_showPopup(imgId, el) {
	var $images = $('[data-control-field=imgs]');
	var value = JSON.parse($images.attr('data-control-value'));
	var data = tn_slds_getCurrentSlide(value, imgId, true);
	var imgData = data.currentSlide;
	var imgIndex = data.currentIndex + 1;
	var isUpdated = false;

	$('body').append(
		'<table class="tn-gallery-popup sui-panel__section" data-img-id="' +
			imgData.lid +
			'">' +
			'<tr>' +
			'<td class="tn-gallery-popup__title">' +
			'<span>Slide #' +
			imgIndex +
			'</span><img class="tn-gallery-popup__title__close" src="img/modalClosebutton.png" width="15px">' +
			'</td>' +
			'</tr>' +
			'</table>',
	);

	var $popup = $('.tn-gallery-popup');
	var popupTop = $('.sui-panel__section-gallery-imgs').position().top + 70;
	if (popupTop < 70) popupTop = 70;
	$popup.css('top', popupTop + 'px');

	var getData = function () {
		var updatedData = {
			li_imgalt: $('.tn-gallery-popup__input_alt').val(),
			li_imgtitle: $('.tn-gallery-popup__input_title').val(),
			li_imgurl: $('.tn-gallery-popup__input_url').val(),
			li_imgtarget: $('.tn-gallery-popup__checkbox_target').prop('checked'),
			li_imgnofollow: $('.tn-gallery-popup__checkbox_nofollow').prop('checked'),
			li_youtube: tn_parseYoutubelink($('.tn-gallery-popup__input_youtube').val()),
			li_vimeo: tn_parseVimeolink($('.tn-gallery-popup__input_vimeo').val()),
		};

		if (!updatedData.li_youtube) updatedData.li_youtube = '';
		if (!updatedData.li_vimeo) updatedData.li_vimeo = '';

		return updatedData;
	};

	var checkFields = function () {
		var data = getData();
		var $popupCheckboxTarget = $('.tn-gallery-popup__checkbox_target');
		var $popupInputYoutube = $('.tn-gallery-popup__input_youtube');
		var $popupInputVimeo = $('.tn-gallery-popup__input_vimeo');

		$popup.find('.sui-input-checkbox').removeClass('sui-input-checkbox_disable').find('input').attr('disabled', false);
		$popup.find('.sui-input').removeClass('sui-input_disable').attr('disabled', false);

		if ($popupInputYoutube.val() || $popupInputVimeo.val()) {
			$popupCheckboxTarget
				.parent('.sui-input-checkbox')
				.addClass('sui-input-checkbox_disable')
				.find('input')
				.attr('disabled', true);
			$('.tn-gallery-popup__checkbox_nofollow')
				.parent('.sui-input-checkbox')
				.addClass('sui-input-checkbox_disable')
				.find('input')
				.attr('disabled', true);
			$('.tn-gallery-popup__input_url').addClass('sui-input_disable').attr('disabled', true);
			$popupCheckboxTarget.prop('checked', false);
			$('.tn-gallery-popup__checkbox_nofollow').prop('checked', false);
		} else if (data.li_imgurl) {
			$popupInputYoutube.addClass('sui-input_disable').attr('disabled', true);
			$popupInputVimeo.addClass('sui-input_disable').attr('disabled', true);
		}
	};

	var str =
		'<table class="tn-gallery-popup__table">' +
		'<tr class="tn-gallery-popup__tr">' +
		'<td class="tn-gallery-popup__td">' +
		'<input class="sui-input tn-gallery-popup__input tn-gallery-popup__input_title" type="text" value="' +
		imgData.li_imgtitle +
		'" placeholder="Image caption">' +
		'<input class="sui-input tn-gallery-popup__input tn-gallery-popup__input_alt" type="text" value="' +
		imgData.li_imgalt +
		'" placeholder="Image alt for SEO">' +
		'<input class="sui-input tn-gallery-popup__input tn-gallery-popup__input_youtube" type="text" value="' +
		imgData.li_youtube +
		'" placeholder="Youtube video link or id">' +
		'<input class="sui-input tn-gallery-popup__input tn-gallery-popup__input_vimeo" type="text" value="' +
		imgData.li_vimeo +
		'" placeholder="Vimeo video link or id">' +
		'<input class="sui-input tn-gallery-popup__input tn-gallery-popup__input_url" type="text" value="' +
		imgData.li_imgurl +
		'" placeholder="Link url">' +
		'<label class="sui-input-checkbox"><input class="tn-gallery-popup__checkbox tn-gallery-popup__checkbox_target" type="checkbox">Open link in new tab</label>' +
		'<label class="sui-input-checkbox"><input class="tn-gallery-popup__checkbox tn-gallery-popup__checkbox_nofollow" type="checkbox">Rel nofollow</label>' +
		'</td>' +
		'</tr>' +
		'<table>';

	$popup.append(str);
	$('.tn-gallery-popup__checkbox_target').prop('checked', imgData.li_imgtarget);
	$('.tn-gallery-popup__checkbox_nofollow').prop('checked', imgData.li_imgnofollow);
	checkFields(imgData);

	var $popupInputs = $('.tn-gallery-popup .tn-gallery-popup__table input');

	var updateData = function () {
		var updatedData = getData();
		var imgsValue = JSON.parse(elem__getFieldValue(el, 'imgs'));
		imgsValue = tn_slds_updateSlideData(imgsValue, imgId, updatedData);

		var showVideoSettings = $.grep(imgsValue, function (item) {
			return item.li_youtube || item.li_viemo;
		}).length;
		$('.tn-settings .sui-panel__section-playicon').css('display', showVideoSettings ? 'block' : 'none');

		var showCaptionSettings = $.grep(imgsValue, function (item) {
			return item.li_imgtitle;
		}).length;
		$('.tn-settings .sui-panel__section-font').css('display', showCaptionSettings ? 'block' : 'none');

		var stringImgsValue = JSON.stringify(imgsValue);
		el.find('.tn-atom__slds-imgs-textarea').val(stringImgsValue);

		elem__setFieldValue(el, 'imgs', stringImgsValue);
		elem__renderView(el);
		setTimeout(function () {
			panelSettings__updateUi(el, 'imgs');
		});
		isUpdated = false;
	};

	$popupInputs.change(updateData);
	$popupInputs.keyup(checkFields);
	$popupInputs.focusin(function () {
		window.tn_flag_settings_ui_focus = true;
		isUpdated = true;
	});
	$popupInputs.focusout(function () {
		window.tn_flag_settings_ui_focus = false;
	});
	$popup.on('remove', function () {
		if (isUpdated) updateData();
	});

	$(document).off('mouseup');
	$(document).on('mouseup', function (e) {
		var $settingsBtn = $('.sui-file-list[data-img-id="' + imgId + '"] .sui-file-settings');
		if (!$settingsBtn.is(e.target) && !$popup.is(e.target) && $popup.has(e.target).length === 0) {
			e.stopPropagation();
			$popup.remove();
		}
	});
	$('.tn-gallery-popup__title__close').click(function () {
		$popup.remove();
	});
}

/* Not used */
function tn_slds_getArrowWidthBySize(size) {
	var bgSize = {
		7: 30,
		9: 40,
		11: 50,
		15: 50,
	};
	return bgSize[size];
}

function tn_slds_getCurrentSlide(value, lid, withIndex) {
	var currentSlide;
	var currentIndex;
	for (var i = 0; i < value.length; i++) {
		if (value[i].lid == lid) {
			currentIndex = i;
			currentSlide = value[i];
			break;
		}
	}
	if (withIndex) {
		return {currentSlide: currentSlide, currentIndex: currentIndex};
	}
	return currentSlide;
}

function tn_slds_updateSlideData(value, lid, newData) {
	var updatedValue = value;
	for (var i = 0; i < updatedValue.length; i++) {
		if (updatedValue[i].lid == lid) {
			updatedValue[i] = $.extend({}, updatedValue[i], newData);
			break;
		}
	}
	return updatedValue;
}
