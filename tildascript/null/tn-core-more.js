/* ------------------------ */
/* More */

/* ------------------------ */
/* Redactor and Text */

// function editElementField2(el) {

//     tn_console("func: editElementField");

//     /* close and save other fields opened for edit */
// 	allelems__closeEditMode();
// 	//allelems__unselect();

//     window.waschanged="";
//     window.tn_flag_settings_ui_focus=true;

//     //$('body').removeClass('userselect_none');

//     $("#for_redactor_toolbar").stop();
//     $("#mainmenu").stop();

//     $("#for_redactor_toolbar").html("");
//     $("#for_redactor_toolbar").css("opacity","0");

//     $("#mainmenu").animate({"opacity": "0","top": "-60px"}, 400,"easeInCirc", function() {
//         $("#for_redactor_toolbar").animate({"opacity": "1","top": "0px"}, 300,"easeOutCirc");
//     });

// 	el.attr('data-edit-mode','yes');

//     el.draggable( "disable" );
//     el.resizable( "disable" );

// 	tn_undo__Add('elem_save',window.tn.multi_edit ? window.tn.multi_edit_elems : el);

// 	//el.find('.tn-atom__tip').css('display','block');

// 	$(window).keydown(function (e){

// 	    if ((e.metaKey || e.ctrlKey) && e.keyCode == 86) {
// 		    if($('body').scrollLeft()==0){
// 		    }else{
// 		        window.bdy_left=$('body').scrollLeft();
// 		    }
// 	        window.bdy_top=$('body').scrollTop();
// 			setTimeout(function() {
// 		        $('body').scrollLeft(window.bdy_left);
// 		        $('body').scrollTop(window.bdy_top);
// 			}, 5);
// 			setTimeout(function() {
// 		        $('body').scrollLeft(window.bdy_left);
// 		        $('body').scrollTop(window.bdy_top);
// 			}, 10);
// 			setTimeout(function() {
// 		        $('body').scrollLeft(window.bdy_left);
// 		        $('body').scrollTop(window.bdy_top);
// 			}, 50);
// 	    }

// 	});
//     el.find('.tn-atom__tip-text').redactor({
//         buttons: ['bold', 'italic', 'deleted', 'link',''],
//         focus: true,
//         linebreaks: true,
//         allowedTags: ['p', 'a', 'i', 'b','br','div','del','u','ul','ol','li','sup','sub','em','table','tr','td','th','tbody','thead','strike','span','inline','strong'],
//         replaceDivs: false,
//         cleanOnPaste: true,
//         toolbarExternal: '#for_redactor_toolbar',
//         plugins: ['underline','fontcolorex','fontweight','clearstyle'],
//         dragUpload: false,
//         initCallback: function(e)
//         {
//         },
//         changeCallback: function(html)
//         {
//             window.waschanged="yes";
//         },
//         dropdownShownCallback: function(dropdown, key, button)
//         {
//         },
//         blurCallback: function(e)
//         {
// 			saveElementEditedField2(el);
//         },
//         pasteBeforeCallback: function(html)
//         {
//             html=$.htmlClean(html, {format:true,allowedTags:['div','span','p','h1','h2','h3','a','i','b','br','del','u','ul','ol','li','sup','sub','em','strike','strong'],allowedClasses:[''],allowedAttributes:[['href'],['style'],['rel'],['data-verified'],['data-redactor-tag'],['data-redactor-style']]});
//             html = html.replace(/<h1\s(.*?)>/gi, '<h1>');
//             html = html.replace(/<h1><br\s?\/?><\/h1>/gi, '<br /><br />');
//             html = html.replace(/<h1>([\w\W]*?)<\/h1>/gi, '$1<br /><br />');
//             html = html.replace(/<h2\s(.*?)>/gi, '<h2>');
//             html = html.replace(/<h2><br\s?\/?><\/h2>/gi, '<br /><br />');
//             html = html.replace(/<h2>([\w\W]*?)<\/h2>/gi, '$1<br /><br />');
//             html = html.replace(/<h3\s(.*?)>/gi, '<h3>');
//             html = html.replace(/<h3><br\s?\/?><\/h3>/gi, '<br /><br />');
//             html = html.replace(/<h3>([\w\W]*?)<\/h3>/gi, '$1<br /><br />');
//             html = html.replace(/<div\s(.*?)>/gi, '<div>');
//             html = html.replace(/<div><br\s?\/?><\/div>/gi, '<br />');
//             html = html.replace(/<div>([\w\W]*?)<\/div>/gi, '$1<br />');
//             return html;
//         }

//     });

// }

// function saveElementEditedField2(el) {

// 	tn_console('^^^^^^^^^^ func: saveElementEditedField');

// 	window.tn_flag_settings_ui_focus=false;

// 	$('body').addClass('userselect_none');

//     var value = el.find('.tn-atom__tip-text').redactor('code.get');
//     value=value.replace(/&nbsp;/g, ' ');

//     var styles=el.find('.tn-atom__tip-text').attr('style');

//     el.find('.redactor-box').remove();
//     el.find('.tn-atom__tip').html("<div class='tn-atom__tip-text' field='tipcaption'></div>");
//     el.find('.tn-atom__tip-text').html(value);
//     el.find('.tn-atom__tip-text').attr('style',styles);

//     el.attr('data-edit-mode','');

//     $("#for_redactor_toolbar").finish();
//     $("#mainmenu").finish();

//     $("#for_redactor_toolbar").animate({"opacity": "0","top": "-60px"}, 400,"easeInCirc", function() {
//         $("#for_redactor_toolbar").html("");
//         $("#mainmenu").animate({"opacity": "1","top": "0px"}, 300,"easeOutCirc");
//     });

//     window.waschanged='';

//     tn_set_lastChanges();

//     el.draggable( "enable" );

// 	elem__renderViewOneField(el,'width');
// 	elem__renderViewOneField(el,'left');
// 	elem__renderViewOneField(el,'top');

// 	elem__renderViewOneField(el,'tipposition');
// }

function tn_toggleSettings(isUserAction) {
	if ($('.tn-right-box').hasClass('tn-display-none')) {
		tn_showSettings();
		if (isUserAction) sessionStorage.setItem('tzerosettingspanel', 'on');
	} else {
		tn_hideSettings();
		if (isUserAction) sessionStorage.removeItem('tzerosettingspanel');
	}
}

function tn_showSettings() {
	$('.tn-right-box').removeClass('tn-display-none');
	$('.tn-sett-btn').removeClass('tn-sett-btn_active');
	$('.tn-more-sett').html('Hide Settings');
}

function tn_hideSettings() {
	$('.tn-right-box').addClass('tn-display-none');
	$('.tn-sett-btn').addClass('tn-sett-btn_active');
	$('.tn-more-sett').html('Show Settings');
}

function tn_close() {
	tn_console('func: close');
	var recid = $('.tn-artboard').attr('data-record-id');
	var pageid = $('.tn-artboard').attr('data-page-id');
	artboard__Empty__toLS();
	if (!window.frameElement && pageid > 0) {
		window.location.href = '/page/?pageid=' + pageid;
	} else {
		parent.tn_close(recid, pageid);
	}
}

function tn_toggleUI() {
	if (window.tn_ui_hidden) {
		tn_showUI();
	} else {
		tn_hideUI();
	}
}

function tn_showUI() {
	$('.tn-mainmenu').removeClass('tn-fullmin-display-none');
	$('.tn-sett-wrapper').removeClass('tn-fullmin-display-none');
	$('.tn-right-box').removeClass('tn-fullmin-display-none');
	$('.tn-canvas-min').removeClass('tn-canvas-min_noborder');
	$('.tn-guides-wrpr').removeClass('tn-canvas-min_noborder');
	$('.tn-left-box').removeClass('tn-canvas-min_noborder');
	tn_showGrid();
	window.tn_ui_hidden = false;
}

function tn_hideUI() {
	$('.tn-mainmenu').addClass('tn-fullmin-display-none');
	$('.tn-sett-wrapper').addClass('tn-fullmin-display-none');
	$('.tn-right-box').addClass('tn-fullmin-display-none');
	$('.tn-canvas-min').addClass('tn-canvas-min_noborder');
	$('.tn-guides-wrpr').addClass('tn-canvas-min_noborder');
	$('.tn-left-box').addClass('tn-canvas-min_noborder');
	tn_hideGrid();
	panelLayers__close();
	window.tn_ui_hidden = true;
}

function tn_tooltip_update() {
	$('.tooltip').each(function () {
		var $this = $(this);
		var isInteractive = !($this.parent('.sui-blocks__item').length || $this.closest('.tn-res-wrapper').length);
		$this.tooltipster({
			'theme': 'tn-tooltip__tooltipster-noir',
			'contentAsHTML': true,
			'content': $this.attr('data-tooltip'),
			interactive: isInteractive,
			position: 'bottom',
		});
	});
}

function lasso__getElems(startX, startY, endX, endY) {
	if (window.tn_flag_sbs_panelopen) panelSBS__close();
	$('.tn-artboard > .tn-elem, .tn-group').each(function () {
		var $el = $(this);
		var isGroup = $el.hasClass('tn-group');

		var el_startX = parseInt($el.css('left'), 10);
		var el_startY = parseInt($el.css('top'), 10);
		var el_endX = el_startX + parseInt($el.width(), 10);
		var el_endY = el_startY + parseInt($el.height(), 10);
		var el_lock = elem__getFieldValue($el, 'lock');
		var x11 = startX;
		var x12 = endX;
		var y11 = startY;
		var y12 = endY;
		var x21 = el_startX;
		var x22 = el_endX;
		var y21 = el_startY;
		var y22 = el_endY;

		var x_overlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21));
		var y_overlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21));
		if (x_overlap * y_overlap > 0 && el_lock !== 'y') {
			if (isGroup) {
				if (group__getFieldValue($el, 'hidden') !== 'y') {
					group__select($el.attr('id'), true);
				}
			} else {
				if (elem__getFieldValue($el, 'invisible') !== 'y') {
					$el.addClass('tn-elem__selected');

					if (this.dataset.elemType === 'text') {
						var outline = $('.tn-outline_selected');
						outline.resizable('option', 'handles', 'w, e');
					}
				}
			}
		}
	});

	if ($('.tn-elem__selected').length) {
		tn_setOutlinePosition('selected');
		tn_showOutline('selected');

		tn_destroyTidyControls();
		tn_createSpacingControls();
	}
}

function floor__mousedown(e) {
	tn_console('func: floor__mousedown');

	addmenu__close();
	moremenu__close();

	var flag_item_selected = 'yes';

	/* show panel setings for Artboard if hasnt any selected item */
	if ($('.tn-elem__selected').length > 0) {
		flag_item_selected = 'yes';
	} else {
		flag_item_selected = '';
	}

	if (typeof e == 'object' && e.shiftKey && flag_item_selected == 'yes') {
		/* if multiselect - do not reset selected items */
	} else {
		/* check propble - input not triggered onchange */
		var needtimeout = $(document.activeElement).hasClass('sui-input');
		if (needtimeout == true) {
			setTimeout(function () {
				allelems__unselect();
			}, 10);
		} else {
			allelems__unselect();
		}
	}

	window.tn_flag_settings_ui_focus = false;
	$('body').css('overflow-x', 'scroll');
	if ($('.tn-elem__highlight').length) $('.tn-elem__highlight').removeClass('tn-elem__highlight');
	tn_console_runtime();
}

function tn_drawguides(res) {
	tn_console('func: tn_drawguides: res' + res);
	var $tnGuides = $('.tn-guides');
	if ($tnGuides.length) {
		$tnGuides.remove();
	}

	$('body .tn-layout').append('<div class="tn-guides"></div>');
}

function tn_drawguides_updateHeight() {
	var $tnGuidesLine = $('.tn-guides__line');
	if ($tnGuidesLine.length) {
		var line_h = 5000;
		if (typeof window.tn.canvas_max_height != 'undefined' && window.tn.canvas_max_height > 5000) {
			line_h = window.tn.canvas_max_height + 1500;
		}
		$tnGuidesLine.css('height', line_h);
	}
}

function tn_showguides() {
	var $tnGuides = $('.tn-guides');
	if ($tnGuides.length) {
		$tnGuides.remove();
	} else {
		tn_drawguides();
		ab__renderGrid();
	}
}

function tn_tab() {
	if ($('.tn-right-box .tn-settings').length == 0) {
		floor__mousedown();
	}
	tn_toggleSettings(true);
}

function tn_set_lastChanges() {
	window.tn.last_changes = Date.now();
	$('.tn-changes').html(window.tn.last_changes);
}

/*
function tn_testAnimation(){

	if(typeof window.tn.testanimation=='undefined'){

		var el;
		window.tn.testanimation='on';

		$('.tn-mainmenu').addClass('tn-testanim-display-none');
		$('.tn-sett-wrapper').addClass('tn-testanim-display-none');
		$('.tn-right-box').addClass('tn-testanim-display-none');

		$('body').append('<div class="tn-testanim-layer"></div>');
		$('.tn-testanim-layer').click(function() {
			tn_testAnimation__stop();
		});

		$(".tn-elem").each(function() {
			el=$(this);

			var animduration=el.attr('data-field-animduration-value');
			if(animduration==''){
				var ab=$('.tn-artboard');
				animduration=ab__getFieldValue(ab,'height');
			}else{
				animduration=parseInt( animduration );
			}

			var animtriggerhook = el.attr('data-field-animtriggerhook-value');
			if(typeof animtriggerhook=='undefined' || animtriggerhook=='')animtriggerhook=1;
			animtriggerhook = parseFloat(animtriggerhook);

			var animoffset= parseInt( el.attr('data-field-animoffset-value') );
			var animparallax= parseInt( el.attr('data-field-animparallax-value') );
			var elem_id=el.attr('data-elem-id');

			$('body').append('<div id="indicators_'+el.attr('data-elem-id')+'" class="tn-anim-indicators" style="opacity:0;"></div>');

			if(typeof animparallax!='undefined' && isNaN(animparallax)==false && animparallax>0){

				window.tn.animcontroller = new ScrollMagic.Controller({});

				var scene = new ScrollMagic.Scene({triggerElement: '.tn-canvas-max', duration: animduration, triggerHook: animtriggerhook, offset: animoffset})
								.setTween("#"+elem_id, {y: animparallax+'%', ease: Linear.easeNone})
								.addIndicators({parent: "#indicators_"+el.attr('data-elem-id'), name: ""+el.attr('data-elem-type')})
								.addTo(window.tn.animcontroller);

				window.tn.scenes[elem_id]=scene;
			}

		});

		$(".tn-elem__selected").each(function() {
			var el=$(this);
			$('#indicators_'+el.attr('data-elem-id')).css('opacity','1');
		});


	}else{

		tn_testAnimation__stop();

	}

}


function tn_testAnimation__stop(){

	if(typeof window.tn.testanimation=='undefined'){


	}else{

		var el;
		window.tn.testanimation=undefined;

		$('.tn-mainmenu').removeClass('tn-testanim-display-none');
		$('.tn-sett-wrapper').removeClass('tn-testanim-display-none');
		$('.tn-right-box').removeClass('tn-testanim-display-none');

		$('.tn-testanim-layer').remove();
		$('.sui-btn-anim').html('Test Animation');

		$(".tn-elem").each(function() {
			el=$(this);
			var elem_id=el.attr('data-elem-id');
			if(typeof window.tn.scenes[elem_id]!='undefined'){
				window.tn.scenes[elem_id].removeIndicators();
				window.tn.scenes[elem_id].destroy(true);
				window.tn.scenes[elem_id]=undefined;
				el.css('transform','');
				$('.tn-anim-indicators').remove();
			}
		});

		allelems__renderView();

	}

}
*/

function tn_console(str) {
	var func = arguments.callee.caller.name.toString();
	if (window.tn_comments == 1) {
		if (typeof str == 'undefined') str = 'func: ' + func;
		console.log(str);
	}
	if (window.tn_comments_deltatime == 1) {
		window['tn_microtime_' + func] = performance.now();
	}
}

function tn_console_runtime(str) {
	if (window.tn_comments_deltatime == 1) {
		var func = arguments.callee.caller.name.toString();
		if (typeof str == 'undefined') str = 'func: ' + func + ' runtime';
		console.log(str + ': ' + (performance.now() - window['tn_microtime_' + func]));
	}
}

function tn_anim__playAll() {
	var animatedElems =
		window.tn.curResolution >= 1200
			? $('.tn-elem[data-field-animstyle-value!=""]')
			: $('.tn-elem[data-field-animstyle-value!=""][data-field-animmobile-value="y"]');
	/* if it was already played */
	if (animatedElems.hasClass('t-animate_started')) {
		animatedElems.css({
			'transition-duration': '0s',
			'transition-delay': '0s',
		});
		animatedElems.removeClass('t-animate, t-animate_started');
	}
	animatedElems.addClass('t-animate');
	animatedElems.each(function () {
		var curElem = $(this);
		tn_anim__setElemAnimStyle(curElem);
		tn_anim__setElemDelay(curElem);
		tn_anim__removeClassesAndAttrs(curElem);
	});
	setTimeout(function () {
		animatedElems.addClass('t-animate_started');
		$('body').addClass('t-body_anim-test');
	}, 300);
}

function tn_anim__playElem(elem) {
	if (window.tn.multi_edit && elem.length > 1) {
		elem.each(function (i, el) {
			tn_anim__updateAnimState($(el));
		});
	} else {
		tn_anim__updateAnimState(elem);
	}
}

function tn_anim__updateAnimState(elem) {
	/* if it was already played */
	if (elem.hasClass('t-animate_started')) {
		elem.css('transition-duration', '0s');
		elem.removeClass('t-animate t-animate_started');
	}
	elem.addClass('t-animate');
	tn_anim__setElemAnimStyle(elem);
	setTimeout(function () {
		elem.addClass('t-animate_started');
		$('body').addClass('t-body_anim-test');
	}, 300);
	tn_anim__removeClassesAndAttrs(elem);
}

function tn_anim__removeClassesAndAttrs(elem) {
	elem.on('TransitionEnd webkitTransitionEnd oTransitionEnd MSTransitionEnd', function (e) {
		var $this = $(this);
		if (e.originalEvent.propertyName == 'box-shadow') {
			console.log('box-shadow return');
			return;
		}
		$this.css({
			'transition-duration': '0s',
			'transition-delay': '0s',
		});
		$this[0].offsetHeight;
		$this.removeClass('t-animate t-animate_started');
		$this.removeAttr('data-animate-style data-animate-scale data-animate-distance');
		$this.css({
			'transition-duration': '',
			'transition-delay': '',
			'transform': '',
		});
		if ($('.t-animate').length == 0 || window.tn.multi_edit) {
			$('body').removeClass('t-body_anim-test');
		}
		$this.off(e);
	});
}

function tn_anim__setElemAnimStyle(elem) {
	var elemStyle = elem__getFieldValue(elem, 'animstyle');
	var elemDuration = elem__getFieldValue(elem, 'animduration');
	elem.css({
		'transition-duration': '0s',
		'transition-delay': '0s',
	});
	elem.attr('data-animate-style', elemStyle);
	/*check element custom distance*/
	var elemDistance = elem__getFieldValue(elem, 'animdistance');
	if (typeof elemDistance != 'undefined' && elemDistance != '') {
		elemDistance = elemDistance.replace('px', '');
		elem.attr('data-animate-distance', elemDistance);
		if (elemStyle == 'fadeinup') {
			elem.css('transform', 'translate3d(0,' + elemDistance + 'px,0)');
		}
		if (elemStyle == 'fadeindown') {
			elem.css('transform', 'translate3d(0,-' + elemDistance + 'px,0)');
		}
		if (elemStyle == 'fadeinleft') {
			elem.css('transform', 'translate3d(' + elemDistance + 'px,0,0)');
		}
		if (elemStyle == 'fadeinright') {
			elem.css('transform', 'translate3d(-' + elemDistance + 'px,0,0)');
		}
	}
	/*check element custom scale*/
	var elemScale = elem__getFieldValue(elem, 'animscale');
	if (typeof elemScale != 'undefined' && elemScale != '') {
		elem.css('transform', 'scale(' + elemScale + ')');
		elem.attr('data-animate-scale', elemScale);
	}
	elem[0].offsetHeight;
	if (typeof elemDuration != 'undefined' && elemDuration != '') {
		elem.css('transition-duration', elemDuration + 's');
	} else {
		elem.css('transition-duration', '');
	}
}

function tn_anim__setElemDelay(elem) {
	var curElemDelay = elem__getFieldValue(elem, 'animdelay');
	if (typeof curElemDelay != 'undefined' && curElemDelay != '') {
		elem.css('transition-delay', curElemDelay + 's');
	}
}

function tn_receivers__openEditor(elem_id) {
	window.tn_flag_settings_ui_focus = true;
	var $body = $('body');

	var s =
		'<div class="tn-wincode" data-code-elem-id="' +
		elem_id +
		'" style="position:fixed; z-index:10000; top:0; left:0; display:block; overflow-y: auto; overflow-x:hidden; width:100%; height:100vh; background-color:#fff;">' +
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
		'<div style="display:block;width:720px;margin:auto;padding:20px;padding-top:100px;">' +
		'<div class="receiverslist__wrapper"></div>' +
		'</div>' +
		'</div>' +
		'</div>' +
		'</div>';

	$body.append(s);

	window.lang = 'EN';
	window.lireplaces = '';

	$body.addClass('tn-body_lockscroll');

	$('.tn-code-save-btn').click(function () {
		var receivers = '';
		var receivers_names = '';
		$('.receiverslist__wrapper')
			.find(':checkbox:checked')
			.each(function () {
				receivers += $(this).attr('value') + ',';
				receivers_names += $(this).parent().find('span').text() + ', ';
			});
		if (receivers != '') receivers = receivers.replace(/(^,)|(,$)/g, '');
		if (receivers_names != '') {
			receivers_names = tn_stripTags(receivers_names);
			receivers_names = tn_escapeHtml(receivers_names);
			receivers_names = receivers_names.replaceAll('"', '');
		}

		var elemid = $('.tn-wincode').attr('data-code-elem-id');
		var $el = $('#' + elemid);

		elem__setFieldValue($el, 'receivers', receivers);
		elem__setFieldValue($el, 'receivers_names', receivers_names);
		control__drawUi__receivers(elem_id);

		$('.tn-wincode').remove();
		window.tn_flag_settings_ui_focus = false;
		$body.removeClass('tn-body_lockscroll');

		if (receivers != '') tn_set_lastChanges();
	});

	$('.tn-code-close-btn').click(function () {
		$('.tn-wincode').remove();
		$body.removeClass('tn-body_lockscroll');
		window.tn_flag_settings_ui_focus = false;
	});

	var pageid = $('.tn-artboard').attr('data-page-id');
	var recordid = $('.tn-artboard').attr('data-record-id');

	$.ajax({
		type: 'POST',
		url: '/zero/get/',
		data: {
			comm: 'getzeroreceivers',
			pageid: pageid,
			recordid: recordid,
		},
		dataType: 'text',
		success: function (respond) {
			var el = $('#' + elem_id);
			tn_receivers__drawReceiversList(el, respond);
		},
		error: function () {
			alert('Some error loading and get receivers. Check an internet connection or try again later.');
		},
	});
}

function tn_receivers__drawReceiversList(el, datastr) {
	if (typeof datastr == 'undefined' || datastr == '') datastr = '{}';
	var isDataJson = datastr[0] === '{';
	if (!isDataJson) {
		$('.receiverslist__wrapper').html(datastr);
		return;
	}
	var data = JSON.parse(datastr);
	var formintegrations;
	var receivers_arr;

	if (typeof data == 'object') {
		if (typeof data['formintegrations'] == 'object') {
			formintegrations = data['formintegrations'];
		} else {
			formintegrations = {};
		}
	} else {
		data = {};
		formintegrations = {};
	}

	var receivers = elem__getFieldValue(el, 'receivers');
	if (typeof receivers != 'undefined' && receivers != '') {
		receivers_arr = receivers.split(',');
	} else {
		receivers_arr = [];
	}

	var str =
		'<div style="font-weight:300;margin-bottom: 20px;">Form submissions are automatically stored in the <a href="https://tilda.cc/projects/leads/?projectid=' +
		window.tildaprojectid +
		'" target="_blank" style="color:#f06847;text-decoration:none;">Leads section</a> of the website. You can always connect data capture services integrated with Tilda.</div>' +
		'<label class="pe-label" style="font-weight: bold; margin-bottom: 20px;">Connected services:</label>';

	if (typeof formintegrations != 'object' || formintegrations.length == 0) {
		str +=
			'<div class="pe-hint" style="padding-top: 0px;">You have not connected any service yet</div><br>' +
			'<a href="/projects/settings/?projectid=' +
			projectid +
			'#tab=ss_menu_forms" class="pe-btn-black" style="color: #ffffff !important; font-weight: 500;">Connect</a>';
	} else {
		for (var key in formintegrations) {
			var integ = formintegrations[key];
			var checked = '';
			for (var i = 0; i < receivers_arr.length; i++) {
				if (receivers_arr[i] == integ.hash) {
					checked = 'checked=""';
				}
			}
			str +=
				'<label class="pe-label" style="font-size:18px;margin-bottom:12px;">' +
				'<input type="checkbox" name="integs[]" value="' +
				integ.hash +
				'" ' +
				checked +
				' data-form-type="' +
				integ.type +
				'">' +
				'<span>' +
				integ.type +
				': ' +
				integ.name +
				'</span>' +
				'</label>';
		}
	}

	str +=
		'<div style="font-weight:300;margin-top: 20px;">You can receive form submissions to your email, Google Sheets, or any other integrated service such as MailChimp, SendGrid, Trello, Slack, etc. Assign services in the Site Settings → <a href="/projects/settings/?projectid=' +
		window.tildaprojectid +
		'#tab=ss_menu_forms" target="_blank" style="color:#f06847;text-decoration:none;">Forms</a>. Learn more about connecting data capture services in our <a href="http://help.tilda.ws/forms" target="_blank" style="color:#f06847;text-decoration:none;">Help Center</a>.</div>';

	$('.receiverslist__wrapper').html(str);
}

function tn_alert(msg) {
	var str =
		'<div id="alert_popup" style="width:100%;position:fixed;z-index:9999;top:0;left:0;height:100vh;background-color:rgba(255,255,255,0.5);">' +
		'<div style="width:400px;margin:0 auto;margin-top:40px;background-color:#ccc;padding:40px;box-shadow:0px 0px 26px 1px rgba(0,0,0,0.10);">' +
		'<div>' +
		msg +
		'<br><br>' +
		'<div class="sui-btn sui-btn_sm sui-btn-alert-ok">OK</div>' +
		'</div>' +
		'</div>' +
		'</div>';

	$('body').append(str);

	$('.sui-btn-alert-ok').click(function () {
		$('#alert_popup').remove();
	});
}

function tn_addSnapToggle() {
	var $snapDisableButton = $('.tn-more-snap');
	var isSnapDisabled = false;
	var isSnapDisabledLocal = tn_getLocalField('isSnapDisabled');

	if (isSnapDisabledLocal === null) {
		tn_setLocalField('isSnapDisabled', isSnapDisabled);
	} else {
		isSnapDisabled = isSnapDisabledLocal;
	}

	tn_setSnapButtonText(isSnapDisabled);

	$snapDisableButton.on('click', function () {
		tn_toggleSnap();
	});
}

function tn_toggleSnap() {
	var isSnapDisabled = tn_getLocalField('isSnapDisabled');
	var isDisabledAfter;

	if (isSnapDisabled) {
		tn_enableSnap();
		isDisabledAfter = false;
	} else {
		tn_disableSnap();
		isDisabledAfter = true;
	}

	tn_setSnapButtonText(isDisabledAfter);
	tn_setLocalField('isSnapDisabled', isDisabledAfter);
}

function tn_enableSnap() {
	var $elements = $('.tn-elem, .tn-group');

	$elements.each(function () {
		$(this).draggable('option', 'snap', '.tn-elem:not(.tn-elem__selected), .tn-guide, .tn-canvas-min, .tn-canvas-max');
	});

	$('.tn-outline_selected').resizable(
		'option',
		'snap',
		'.tn-elem, .tn-group, .tn-guide, .tn-canvas-min, .tn-canvas-max',
	);
}

function tn_disableSnap() {
	var $elements = $('.tn-elem, .tn-group');

	$elements.each(function () {
		$(this).draggable('option', 'snap', false);
	});

	$('.tn-outline_selected').resizable('option', 'snap', false);
}

function tn_setSnapButtonText(isSnapDisabled) {
	var buttonText = isSnapDisabled ? 'Enable Snapping' : 'Disable Snapping';
	$('.tn-more-snap').text(buttonText);
}

function tn_getLocalField(key) {
	var stringKey = key.toString();
	var result = localStorage ? localStorage.getItem(stringKey) : null;

	if (stringKey === 'isSnapDisabled') {
		if (result !== null) {
			result = result === 'true' ? true : false;
		}
	}

	return result;
}

function tn_setLocalField(key, value) {
	if (localStorage) {
		localStorage.setItem(key.toString(), value);
	}
}

// input calculation for ui
function tn_calculateInputNumber(str) {
	if (typeof str !== 'string') str = str.toString();

	var strWithoutSpaces = str.replace(/(\s)/gi, '');
	// eslint-disable-next-line no-useless-escape
	var isInvalidStr = tn_validateCalcStr(strWithoutSpaces);
	var openIndex = strWithoutSpaces.lastIndexOf('(');
	var hasBrackets = openIndex < 0 ? false : true;
	var closeIndex;
	var insideExp;
	var changedExp;

	if (isInvalidStr) return parseInt(str, 10);

	while (hasBrackets) {
		closeIndex = strWithoutSpaces.indexOf(')', openIndex);

		insideExp = strWithoutSpaces.slice(openIndex + 1, closeIndex);
		changedExp = tn_calculateAdd(tn_calculateMultiple(insideExp));

		strWithoutSpaces =
			strWithoutSpaces.substring(0, openIndex) + changedExp.toString() + strWithoutSpaces.substring(closeIndex + 1);

		openIndex = strWithoutSpaces.lastIndexOf('(');

		if (openIndex < 0) {
			hasBrackets = false;
		}
	}

	if (!hasBrackets) strWithoutSpaces = tn_calculateAdd(tn_calculateMultiple(strWithoutSpaces));

	return parseFloat(parseFloat(strWithoutSpaces).toFixed(2));
}

function tn_calculateAdd(str) {
	var newStr = str.replace(/(-)/gi, '+-');

	if (newStr[0] === '+') newStr = newStr.slice(1);

	return newStr
		.split('+')
		.reduce(function (sum, current) {
			return sum + parseFloat(current);
		}, 0)
		.toString(10);
}

function tn_calculateMultiple(str) {
	var hasMultiple;
	var newStr = str;

	if (/\//gi.test(newStr)) {
		newStr = newStr.replace(/\/(\d+)/gi, function (match, number1) {
			return '*' + (1 / parseFloat(number1)).toString(10);
		});
	}

	hasMultiple = /\*/gi.test(newStr);

	while (hasMultiple) {
		newStr = newStr.replace(/(\d+\.?\d*)\*(\d+\.?\d*)/gi, function (match, number1, number2) {
			return (parseFloat(number1) * parseFloat(number2)).toString(10);
		});

		hasMultiple = /\*/gi.test(newStr);
	}

	return newStr;
}

function tn_validateCalcStr(str) {
	// eslint-disable-next-line no-useless-escape
	var invalidSymbRegExp = /[^\d\+\-\*\/\(\)\.]|(\/0)|[\+\-\*\/]{2,}/gi;
	var hasInvalidSymb = invalidSymbRegExp.test(str);
	var hasInvalidBrackets = tn_hasIncorrectBrackets(str);
	var isInvalidStr = hasInvalidSymb || hasInvalidBrackets;

	return isInvalidStr;
}

function tn_hasIncorrectBrackets(str) {
	var openBracketsCount = 0;
	var i = 0;

	while (openBracketsCount >= 0 && i < str.length) {
		if (str[i] === '(') {
			openBracketsCount++;
		} else if (str[i] === ')') {
			openBracketsCount--;
		}

		i++;
	}

	return openBracketsCount !== 0 ? true : false;
}

function tn_isUploadedImage(data) {
	var url = data;
	if (typeof data !== 'string') {
		var field = data.attr('data-elem-type') === 'image' ? 'img' : 'bgimg';
		url = elem__getFieldValue(data, field);
	}

	if (typeof url === 'undefined') return true;

	return url.indexOf('static.tildacdn.com') >= 0;
}

function tn_uploadImageToTilda(url, callback) {
	$.ajax({
		type: 'POST',
		dataType: 'json',
		url: 'https://upload.tildacdn.com/api/upload/',
		data: {
			'url': url,
			'publickey': Tildaupload_PUBLICKEY,
			'uploadkey': Tildaupload_UPLOADKEY || '',
		},
		success: function (json) {
			if (json && json.result.length > 0) {
				var file = json.result[0];
				callback(file);
			} else {
				alert('Error. ' + json.error);
			}
		},
	});
}

function tn_createAbMoveEvent() {
	var moveShape = document.querySelector('.tn-move-shape');
	var isMoveStarted = false;
	var mouseStartCoords;
	var windowStartOffset;

	moveShape.addEventListener('mousedown', function (event) {
		if (window.isSpaceDown) {
			isMoveStarted = true;
			moveShape.style.cursor = 'grabbing';

			mouseStartCoords = {
				x: event.clientX,
				y: event.clientY,
			};

			windowStartOffset = {
				x: window.scrollX,
				y: window.scrollY,
			};
		}
	});

	document.addEventListener('mousemove', function (event) {
		var mouseOffsetX;
		var mouseOffsetY;
		var windowOffsetX;
		var windowOffsetY;

		if (window.isSpaceDown && isMoveStarted) {
			mouseOffsetX = event.clientX - mouseStartCoords.x;
			mouseOffsetY = event.clientY - mouseStartCoords.y;

			windowOffsetX = windowStartOffset.x - mouseOffsetX;
			windowOffsetY = windowStartOffset.y - mouseOffsetY;

			window.scrollTo(windowOffsetX, windowOffsetY);
		}
	});

	document.addEventListener('mouseup', function () {
		moveShape.style.cursor = '';
		isMoveStarted = false;
	});
}

function tn_addMoveShape() {
	var layout = document.querySelector('.tn-layout');
	var moveShape = document.createElement('div');

	moveShape.classList.add('tn-move-shape');

	layout.appendChild(moveShape);
}

function tn_showMoveShape() {
	var moveShape = document.querySelector('.tn-move-shape');
	moveShape.style.display = 'block';
}

function tn_hideMoveShape() {
	var moveShape = document.querySelector('.tn-move-shape');
	moveShape.style.display = '';
}

function tn_initMinicolors($inp, field, val, elType) {
	var $inputContainer = $inp.parent('.sui-input-div');
	var placeholderClass = 'sui-input-div__' + field + 'placeholder-style';
	var placeholderStyle;

	if (tn_isGradientJSON(val)) {
		val = tn_parseGradientFromJSON(val);
	}

	placeholderStyle = 'background: ' + val + ';';

	if (!val) {
		placeholderStyle =
			'background: url(https://tilda.cc/front/css/jquery.minicolors.png);' + 'background-position: -80px 0;';
	}
	var placeholderColor =
		'<style class="' +
		placeholderClass +
		'">' +
		'[data-control-field="' +
		field +
		'"] .sui-input-div_placeholder-color:before' +
		'{' +
		placeholderStyle +
		'}' +
		'</style>';
	$inputContainer.append(placeholderColor);

	$inputContainer.addClass('sui-input-div_placeholder-color');

	setTimeout(function () {
		var $degreesInputs;
		if (
			field == 'gridcolor' ||
			field == 'slds_arrowcolor' ||
			field == 'slds_arrowcolorhover' ||
			field == 'bordercolor' ||
			field == 'shadowcolor' ||
			field == 'colorhover' ||
			field == 'bordercolorhover' ||
			field == 'inputcolor' ||
			field == 'inputbgcolor' ||
			field == 'inputbordercolor' ||
			field == 'inputelscolor' ||
			field == 'inputtitlecolor' ||
			field == 'buttoncolor' ||
			field == 'buttonbordercolor' ||
			field == 'buttonhovercolor' ||
			field == 'buttonhoverbgcolor' ||
			field == 'buttonhoverbordercolor' ||
			field == 'buttonbgcolor' ||
			(elType == 'button' && field == 'color') ||
			(elType == 'tooltip' && field == 'color') ||
			field == 'filtercolor' ||
			field == 'filtercolor2' ||
			field == 'slds_arrowbgcolor' ||
			field == 'slds_arrowbgcolorhover'
		) {
			$inp.minicolors();
		} else if (typeof $inp.minigradients !== 'undefined') {
			$inp.minigradients();
		}

		$degreesInputs = $('.minigradients__degree-panel__angle');

		$degreesInputs.on('focus', function () {
			window.tn_flag_settings_ui_focus = true;
		});

		$degreesInputs.on('blur', function () {
			window.tn_flag_settings_ui_focus = true;
		});

		$inputContainer.removeClass('sui-input-div_placeholder-color');
		$('.' + placeholderClass).remove();
	}, 1);
}

// gradients

function tn_loadMinigradients() {
	var script = document.createElement('script');
	var styles = document.createElement('link');

	script.src = 'https://front.tildacdn.com/minicolors/jquery.minigradients/jquery.minigradients.min.js';

	styles.rel = 'stylesheet';
	styles.href = 'https://front.tildacdn.com/minicolors/jquery.minigradients/jquery.minigradients.min.css';

	document.head.appendChild(script);
	document.head.appendChild(styles);
}

function tn_isGradientJSON(string) {
	var isGradient;
	var gradientObject;

	try {
		gradientObject = JSON.parse(string);

		if (gradientObject.type === 'linear' || gradientObject.type === 'radial') {
			isGradient = true;
		} else {
			isGradient = false;
		}
	} catch (error) {
		isGradient = false;
	}

	return isGradient;
}

function tn_isGradientStyle(string) {
	return /(-gradient\()/gim.test(string);
}

function tn_parseGradientFromJSON(gradJSON) {
	if (tn_isGradientStyle(gradJSON)) {
		gradValue = gradJSON;
	} else {
		var gradProps = typeof gradJSON === 'string' ? JSON.parse(gradJSON) : gradJSON;
		var gradValue = '';
		var colorString = '';

		gradProps.colors.forEach(function (colorProps) {
			colorString += ', ' + colorProps.color + ' ' + colorProps.stop + '%';
		});

		if (gradProps.type === 'linear') {
			gradValue = 'linear-gradient(' + gradProps.angle + 'deg' + colorString + ')';
		}

		if (gradProps.type === 'radial') {
			colorString = colorString.slice(2);
			gradValue = 'radial-gradient(' + colorString + ')';
		}
	}

	return gradValue;
}

function tn_parseJSONfromGradient(gradientString) {
	var colorsRegExp = /rgba?\(\d{1,3}\s?,\s?\d{1,3}\s?,\s?\d{1,3}(\s?,\s?[01](\.\d{1,2})?)?\)/gim;
	var stopRegExp = /\d{1,3}%/gim;
	var gradObj = {};
	var colorObjects = [];
	var colorStrings;
	var stopStrings;
	var i;

	if (gradientString.indexOf('linear') !== -1) {
		gradObj.type = 'linear';
		gradObj.angle = parseInt(/(\d{1,3})deg/gim.exec(gradientString)[1], 10);
	}

	if (gradientString.indexOf('radial') !== -1) {
		gradObj.type = 'radial';
		gradObj.angle = 90;
	}

	colorStrings = gradientString.match(colorsRegExp);
	stopStrings = gradientString.match(stopRegExp);

	if (colorStrings && stopStrings && colorStrings.length === stopStrings.length) {
		for (i = 0; i < colorStrings.length; i++) {
			colorObjects.push({
				color: colorStrings[i],
				stop: parseInt(stopStrings[i]),
			});
		}
	}

	gradObj.colors = colorObjects;

	return JSON.stringify(gradObj);
}

function tn_addSectionHandlers() {
	var section;
	if (typeof window.tn_sections_min == 'object') {
		for (var i = 0; i < window.tn_sections_min.length; i++) {
			section = window.tn_sections_min[i];
			if (section === 'ovrflw') continue;
			$('[data-section-name=' + section + ']').addClass('sui-panel__section_closed');
		}

		if (window.tn.multi_edit) {
			['link', 'border', 'shadow'].forEach(function (sectionName) {
				$('[data-section-name="' + sectionName + '"]').addClass('sui-panel__section_closed');
				if (window.tn_sections_min.indexOf(sectionName) === -1) window.tn_sections_min.push(sectionName);
			});
		}

		//добавляем событие на клик по названию секции
		$('.sui-panel__section')
			.find('.sui-label_title')
			.click(function () {
				var $thisSection = $(this).parents('.sui-panel__section');
				var currentSection = $thisSection.attr('data-section-name');
				var isClosed = window.tn_sections_min.indexOf(currentSection) >= 0;
				var newSections;

				$thisSection.toggleClass('sui-panel__section_closed');

				if (!isClosed) {
					window.tn_sections_min.push(currentSection);
				} else {
					newSections = $.grep(window.tn_sections_min, function (section) {
						return section !== currentSection;
					});
					window.tn_sections_min = newSections;
				}

				//update sessionstorage
				if (window.sessionStorage) {
					sessionStorage.setItem('tn_sections_min', JSON.stringify(window.tn_sections_min));
				}
			});
	}
}

function tn_replaceSingleQuotes(str) {
	if (str) str = str.replaceAll("'", '"');
	return str;
}

function tn_replaceDoubleQuotes(str) {
	if (str) str = str.replaceAll('"', "'");
	return str;
}

// change spacing by mouse

function tn_showFullscreenLoader() {
	var loaderHtml = '<div class="tn-loader">' + '<img src="https://tilda.cc/tpl/img/ajax-loader.gif">' + '</div>';

	$('body').append(loaderHtml);
	$('body').addClass('tn-body_lockscroll');
}

function tn_hideFullscreenLoader() {
	$('.tn-loader').remove();
	$('body').removeClass('tn-body_lockscroll');
}

function tn_getFiltersInfo(effectName) {
	var filterInfo = {};

	switch (effectName) {
		case 'blur':
		case 'bd_blur':
			filterInfo.type = 'blur';
			filterInfo.default = 0;
			filterInfo.units = 'px';
			filterInfo.slider = {min: 0, max: 50, step: 1};
			filterInfo.isBackdrop = effectName === 'bd_blur';
			break;
		case 'brightness':
		case 'bd_brightness':
			filterInfo.type = 'brightness';
			filterInfo.default = 100;
			filterInfo.units = '%';
			filterInfo.slider = {min: 0, max: 1000, step: 50};
			filterInfo.isBackdrop = effectName === 'bd_brightness';
			break;
		case 'contrast':
		case 'bd_contrast':
			filterInfo.type = 'contrast';
			filterInfo.default = 100;
			filterInfo.units = '%';
			filterInfo.slider = {min: 0, max: 1000, step: 50};
			filterInfo.isBackdrop = effectName === 'bd_contrast';
			break;
		case 'grayscale':
		case 'bd_grayscale':
			filterInfo.type = 'grayscale';
			filterInfo.default = 0;
			filterInfo.units = '%';
			filterInfo.slider = {min: 0, max: 100, step: 5};
			filterInfo.isBackdrop = effectName === 'bd_grayscale';
			break;
		case 'hue-rotate':
		case 'bd_hue-rotate':
			filterInfo.type = 'hue-rotate';
			filterInfo.default = 0;
			filterInfo.units = 'deg';
			filterInfo.slider = {min: -360, max: 360, step: 5};
			filterInfo.isBackdrop = effectName === 'bd_hue-rotate';
			break;
		case 'invert':
		case 'bd_invert':
			filterInfo.type = 'invert';
			filterInfo.default = 0;
			filterInfo.units = '%';
			filterInfo.slider = {min: 0, max: 100, step: 5};
			filterInfo.isBackdrop = effectName === 'bd_invert';
			break;
		case 'saturate':
		case 'bd_saturate':
			filterInfo.type = 'saturate';
			filterInfo.default = 100;
			filterInfo.units = '%';
			filterInfo.slider = {min: 0, max: 1000, step: 50};
			filterInfo.isBackdrop = effectName === 'bd_saturate';
			break;
		case 'sepia':
		case 'bd_sepia':
			filterInfo.type = 'sepia';
			filterInfo.default = 0;
			filterInfo.units = '%';
			filterInfo.slider = {min: 0, max: 100, step: 5};
			filterInfo.isBackdrop = effectName === 'bd_sepia';
			break;

		default:
			break;
	}

	return filterInfo;
}

function tn_parseCSSFilter(filterString) {
	if (!filterString) return false;
	var filterData = {
		isBackdrop: false,
		type: '',
		value: 0,
	};

	var splittedString = filterString.split(' ');
	if (!splittedString || !splittedString[1]) return false;

	var filterValue = splittedString[1].split('(');

	filterData.isBackdrop = splittedString[0].indexOf('backdrop') >= 0;
	filterData.type = filterValue[0];
	filterData.value = parseInt(filterValue[1], 10);

	return filterData;
}

function tn_generateFilter(effectName, value) {
	var filterInfo = tn_getFiltersInfo(effectName);
	var filtervalue = filterInfo.default;
	if (typeof value !== 'undefined') filtervalue = value;

	var filterString = filterInfo.isBackdrop ? 'backdrop-filter' : 'filter';
	filterString += ': ' + filterInfo.type + '(';
	filterString += filtervalue + filterInfo.units + ');';

	return filterString;
}

function tn_checkIsEffectsMixed($elems) {
	var data = {isTypeMixed: false, isValueMixed: false};
	var commonEffectData = null;
	$elems.each(function () {
		var $elem = $(this);
		var effects = elem__getFieldValue($elem, 'effects');
		effects = tn_parseCSSFilter(effects);

		if (commonEffectData === null) {
			commonEffectData = effects;
			return;
		}

		if (commonEffectData.type !== effects.type || commonEffectData.isBackdrop !== effects.isBackdrop) {
			data.isTypeMixed = true;
		}

		if (commonEffectData.value !== effects.value) {
			data.isValueMixed = true;
		}

		if (data.isTypeMixed && data.isValueMixed) return false;
	});

	return data;
}

/* ------------------------ */
/* Common */

function getRandomInt(min, max) {
	var r = Math.floor(Math.random() * (max - min + 1)) + min;
	r = parseInt(r / 10, 10) * 10;
	return r;
}

// TODO: this function for what?
function tn_stick_div_to_mouse(divname) {
	var $mouseX;
	var $mouseY;
	var $xp;
	var $yp;

	if (typeof $xp === 'undefined') {
		$mouseX = 0;
		$mouseY = 0;
		$xp = 350;
		$yp = 100;
	}

	$(document).mousemove(function (e) {
		$mouseX = e.pageX;
		$mouseY = e.pageY;
	});

	window.stickloop = setInterval(function () {
		$xp += ($mouseX + 20 - $xp) / 12;
		$yp += ($mouseY + 0 - $yp) / 12;

		$(divname).css({left: $xp + 'px', top: $yp + 'px'});
	}, 5);
}

function getContrastYIQ(hexcolor) {
	var r = parseInt(hexcolor.substr(0, 2), 16);
	var g = parseInt(hexcolor.substr(2, 2), 16);
	var b = parseInt(hexcolor.substr(4, 2), 16);
	var yiq = (r * 299 + g * 587 + b * 114) / 1000;

	return yiq >= 128 ? 'black' : 'white';
}

function tn_luma(color) {
	var rgb = typeof color === 'string' ? tn_hex2rgb(color) : color;

	return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function tn_hex2rgb(hexStr) {
	//note: hexStr should be #rrggbb
	var hex = parseInt(hexStr.substring(1), 16);
	var r = (hex & 0xff0000) >> 16;
	var g = (hex & 0x00ff00) >> 8;
	var b = hex & 0x0000ff;

	return [r, g, b];
}

function tn_hex2rgba(hexStr, opacity) {
	var a = hexStr.replace(/#/, '');
	if (a.length === 3) hexStr = '#' + a[0] + a[0] + a[1] + a[1] + a[2] + a[2];
	var hex = parseInt(hexStr.substring(1), 16);
	var r = (hex & 0xff0000) >> 16;
	var g = (hex & 0x00ff00) >> 8;
	var b = hex & 0x0000ff;

	return [r, g, b, parseFloat(opacity)];
}

function tn_rgb2hex(rgbColor) {
	var rgb = rgbColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	if (rgb === null) {
		rgb = rgbColor.match(/^rgb\((([0-9]*[.])?[0-9]+),\s*(([0-9]*[.])?[0-9]+),\s*(([0-9]*[.])?[0-9]+)\)$/);
		if (rgb === null) return;
		rgb[1] = parseFloat(rgb[1]) * 255.0;
		rgb[2] = parseFloat(rgb[3]) * 255.0;
		rgb[3] = parseFloat(rgb[5]) * 255.0;
	}

	var hex = function hex(x) {
		return ('0' + parseInt(x, 10).toString(16)).slice(-2);
	};

	return '#' + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

//Returns a random number between min (inclusive) and max (exclusive)
function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

function getRandomizer(bottom, top) {
	return Math.floor(Math.random() * (1 + top - bottom)) + bottom;
}

String.prototype.replaceAll = function (search, replacement) {
	var target = this;
	return target.replace(new RegExp(search, 'g'), replacement);
};

$.fn.scrollGuard = function (selector) {
	return this.on('wheel', function (e) {
		var $this = $(this);

		if (selector) {
			$this = $(selector);
		}

		if (e.originalEvent.deltaY < 0) {
			// scrolling up
			return $this.scrollTop() > 0;
		} else {
			// scrolling down
			return $this.scrollTop() + $this.innerHeight() < $this[0].scrollHeight;
		}
	});
};

function tn_stripTags(str) {
	if (str) {
		str = str.replace(/(<([^>]+)>)/gi, '');
	}

	return str;
}

function tn_parseYoutubelink(url) {
	if (!url || (url.indexOf('.') === -1 && url.length < 13)) return url;
	return tn_parseYoutubeLink__getID(url);
}

function tn_parseYoutubeLink__getID(url) {
	var domainList = ['https://youtube.com/', 'https://www.youtube.com/', 'https://youtu.be/'];
	domainList.forEach(function (domain) {
		url = url.replace(domain, '');
	});
	url = url.replace('shorts/', '').replace('watch?v=', '').replace('embed/', '');
	if (!url) return url;
	return url.split('&')[0].split('?')[0];
}

function tn_parseVimeolink(url) {
	var regExp =
		/https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
	var match = url.match(regExp);

	if (!url || url > 0) {
		return url;
	}

	if (match) {
		return match[3];
	} else {
		return false;
	}
}

function tn_escapeHtml(string) {
	var entityMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
		'/': '&#x2F;',
		'`': '&#x60;',
		'=': '&#x3D;',
	};

	return String(string).replace(/[&<>"'`=/]/g, function (s) {
		return entityMap[s];
	});
}

/* function from tilda-scripts.js */
function t_throttle(fn, threshhold, scope) {
	var last;
	var deferTimer;

	if (!threshhold) threshhold = 250;

	return function () {
		var context = scope || this;
		var now = +new Date();
		var args = arguments;
		var result;

		if (last && now < last + threshhold) {
			clearTimeout(deferTimer);

			deferTimer = setTimeout(function () {
				last = now;
				result = fn.apply(context, args);
			}, threshhold);
		} else {
			last = now;
			result = fn.apply(context, args);
		}

		return result;
	};
}

function t_debounce(fn, threshhold, scope) {
	var last;

	if (!threshhold) threshhold = 250;

	return function () {
		var context = scope || this;
		var now = +new Date();
		var args = arguments;
		var result;

		if (!last || now >= last + threshhold) {
			result = fn.apply(context, args);
		} else {
			result = null;
		}

		last = now;

		return result;
	};
}

// set cursor position
$.fn.setCursorPosition = function (pos) {
	this.each(function (index, elem) {
		if (elem.setSelectionRange) {
			elem.setSelectionRange(pos, pos);
		} else if (elem.createTextRange) {
			var range = elem.createTextRange();
			range.collapse(true);
			range.moveEnd('character', pos);
			range.moveStart('character', pos);
			range.select();
		}
	});
	return this;
};

function calcMedian(values) {
	values.sort(function (a, b) {
		return a - b;
	});
	var half = Math.floor(values.length / 2);

	if (values.length % 2) {
		return values[half];
	} else {
		return (values[half - 1] + values[half]) / 2.0;
	}
}

function percentage(num, per) {
	return (num / 100) * per;
}

function sortElemsByZindex(elems) {
	var sortedElems = elems.sort(function (el1, el2) {
		var $el1 = $(el1);
		var $el2 = $(el2);

		var el1Index = $el1.hasClass('tn-group')
			? group__getLowestZIndexInGroup($el1.attr('id'))
			: elem__getFieldValue($el1, 'zindex');

		var el2Index = $el2.hasClass('tn-group')
			? group__getLowestZIndexInGroup($el2.attr('id'))
			: elem__getFieldValue($el2, 'zindex');

		return parseInt(el1Index) < parseInt(el2Index);
	});

	return sortedElems;
}

function cmdSymbol() {
	return navigator.platform.indexOf('Mac') > -1 ? '⌘' : 'Ctrl';
}

function optionSymbol() {
	return navigator.platform.indexOf('Mac') > -1 ? '⌥' : 'Alt';
}

function isDefaultTildaFont(font) {
	var defaultFonts = [
		'Open Sans',
		'PT Sans',
		'PT Serif',
		'Roboto',
		'Roboto Condensed',
		'Ubuntu',
		'Playfair Display',
		'Source Code Pro',
		'Noto Sans',
		'Noto Serif',
		'IBM Plex Sans',
		'IBM Plex Serif',
		'Montserrat',
		'Arial',
		'Georgia',
		'Times New Roman',
		'FuturaPT',
		'Circe',
		'CirceRounded',
		'Mediator',
		'MediatorSerif',
		'ReformaGrotesk',
		'GraphikTT',
		'DrukTextWideTT',
		'KazimirText',
		'OpinionPro',
		'OrchideaPro',
		'IskraCYR',
	];
	return defaultFonts.indexOf(font) > -1;
}

function changeFontWeightToNearest(weight) {
	weight = parseInt(weight, 10);
	if (weight <= 200) return 100;
	if (weight <= 300) return 300;
	if (weight <= 400) return 400;
	if (weight <= 500) return 500;
	if (weight <= 600) return 600;
	return 700;
}

function tn_copyToClipboard(str) {
	var el = document.createElement('textarea');
	el.value = str;
	el.setAttribute('readonly', '');
	el.style.position = 'absolute';
	el.style.left = '-9999px';
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
}

function tn_onFuncLoad(funcName, okFunc, startTime) {
	if (typeof window[funcName] === 'function') {
		okFunc();
	} else {
		setTimeout(function checkFuncExist() {
			if (typeof window[funcName] === 'function') {
				okFunc();
				return;
			}
			if (
				((!startTime && document.readyState === 'complete') || Date.now() - startTime > 10000) &&
				typeof window[funcName] !== 'function'
			) {
				throw new Error(funcName + ' is undefined');
			}
			setTimeout(checkFuncExist, 100);
		});
	}
}
