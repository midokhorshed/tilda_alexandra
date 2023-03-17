/* ------------------------ */
/* Create Element */

function addElem(data, isFake) {
	var $el;
	if (data.elem_type == 'text') {
		$el = addText(data, isFake);
	}
	if (data.elem_type == 'image') {
		$el = addImage(data, isFake);
	}
	if (data.elem_type == 'shape') {
		$el = addShape(data, isFake);
	}
	if (data.elem_type == 'button') {
		$el = addButton(data, isFake);
	}
	if (data.elem_type == 'video') {
		$el = addVideo(data, isFake);
	}
	if (data.elem_type == 'tooltip') {
		$el = addTooltip(data, isFake);
	}
	if (data.elem_type == 'html') {
		$el = addHtml(data, isFake);
	}
	if (data.elem_type == 'form') {
		$el = addForm(data, isFake);
	}
	if (data.elem_type == 'gallery') {
		$el = addGallery(data, isFake);
	}
	if (data.elem_type == 'vector') {
		$el = addVector(data, isFake);
	}

	return $el;
}

/**
 * Создание фейковго элемента необходимо при мультиредактировании
 * Все общие настройки записываются в него и именно они отображаются в панели настроек
 *
 * @param {object} data
 * @param {string} fields_str
 * @returns {jkElement}
 */
function addFake(data, fields_str) {
	tn_console('func: addFFake');
	data.elem_id = Date.now();

	/* add wrapper */
	$('.tn-artboard').append(
		// prettier-ignore
		'<div class="tn-elem tn-elem__fake" id="' + data.elem_id + '" data-elem-id="' + data.elem_id + '" data-elem-type="fake"><div class="tn-atom"></div></div>',
	);
	var $el = $('#' + data.elem_id);
	var fields = fields_str.split(',');
	$el.attr('data-fields', fields_str);

	/* set field values */
	addElem__setFieldValues($el, fields, data);

	return $el;
}

function addElem__setFieldValues($el, fields, data) {
	fields.forEach(function (field) {
		if (field === 'inputs') return;

		var value = data[field];
		elem__setFieldValue($el, field, value, '', '', window.tn.topResolution);

		/* set other resolutions */
		var v;
		window.tn.screens.forEach(function (s, i) {
			if (s == window.tn.topResolution) return; //continue (skip)

			v = data[field + '-res-' + s];
			if (typeof v !== 'undefined') elem__setFieldValue($el, field, v, '', '', s);
		});
	});
}

function addText(data, isFake) {
	tn_console('func: addText');

	/* in has not init values */
	if (typeof data !== 'object') {
		data = {
			elem_id: Date.now(),
			elem_type: 'text',
			text: get__Rendom__Text(),
		};

		var $wndframe = $('body').parent();
		var $canvasMax = $('.tn-canvas-max');

		if ($wndframe.scrollTop() > $canvasMax.offset().top) {
			data.top = $wndframe.scrollTop() - $canvasMax.offset().top + 80;
			if (data.top > parseInt($canvasMax.height(), 10)) {
				data.top = 20;
				$wndframe.animate({scrollTop: $('.tn-canvas-min').offset().top - 90}, 200);
			}
		} else {
			data.top = '20';
		}

		data.left = '20';
		data.width = '560';
		data.fontsize = '20';
		data.lineheight = '1.55';
		data.color = '#000000';
		data.zindex = allelems__getHighestZIndex() + 1;

		if (typeof window.tn.textfont != 'undefined' && window.tn.textfont != 'undefined' && window.tn.textfont != '') {
			data.fontfamily = window.tn.textfont;
		} else {
			data.fontfamily = 'Arial';
		}
		if (
			typeof window.tn.textfontweight != 'undefined' &&
			window.tn.textfontweight != 'undefined' &&
			window.tn.textfontweight != ''
		) {
			data.fontweight = window.tn.textfontweight;
		} else {
			data.fontweight = '400';
		}
	}

	if (!data.elem_id) data.elem_id = Date.now();

	if (!isFake) {
		if (typeof data.rotate == 'undefined') data.rotate = '0';
		if (typeof data.opacity == 'undefined') data.opacity = '1';
		if (typeof data.container == 'undefined') data.container = 'grid';
		if (typeof data.axisy == 'undefined') data.axisy = 'top';
		if (typeof data.axisx == 'undefined') data.axisx = 'left';
		if (typeof data.link == 'undefined') data.link = '';
		if (typeof data.linktarget == 'undefined') data.linktarget = '';
		if (typeof data.relnofollow == 'undefined') data.relnofollow = '';
		if (typeof data.borderwidth == 'undefined') data.borderwidth = '';
		if (typeof data.borderstyle == 'undefined') data.borderstyle = '';
		if (typeof data.bordercolor == 'undefined') data.bordercolor = '';
		if (typeof data.borderradius == 'undefined') data.borderradius = '';
		if (typeof data.lock == 'undefined') data.lock = '';
		if (typeof data.invisible == 'undefined') data.invisible = '';
		if (typeof data.leftunits == 'undefined') data.leftunits = 'px';
		if (typeof data.topunits == 'undefined') data.topunits = 'px';
		if (typeof data.color == 'undefined') data.color = '';
		if (typeof data.classname == 'undefined') data.classname = '';
		if (typeof data.widthunits == 'undefined') data.widthunits = 'px';
		if (typeof data.tag == 'undefined') data.tag = 'div';
		if (typeof data.align == 'undefined') data.align = 'left';
		if (typeof data.letterspacing == 'undefined') data.letterspacing = '0';
		if (typeof data.pevent == 'undefined') data.pevent = '';
		if (typeof data.layer == 'undefined') data.layer = '';
		if (typeof data.animstyle == 'undefined') data.animstyle = '';
		if (typeof data.animduration == 'undefined') data.animduration = '';
		if (typeof data.animdelay == 'undefined') data.animdelay = '';
		if (typeof data.animscale == 'undefined') data.animscale = '';
		if (typeof data.animdistance == 'undefined') data.animdistance = '';
		if (typeof data.animtriggeroffset == 'undefined') data.animtriggeroffset = '';
		if (typeof data.animprx == 'undefined') data.animprx = '';
		if (typeof data.animprxs == 'undefined') data.animprxs = '';
		if (typeof data.animprxdx == 'undefined') data.animprxdx = '';
		if (typeof data.animprxdy == 'undefined') data.animprxdy = '';
		if (typeof data.animfix == 'undefined') data.animfix = '';
		if (typeof data.animfixdist == 'undefined') data.animfixdist = '';
		if (typeof data.animfixtrgofst == 'undefined') data.animfixtrgofst = '';
		if (typeof data.effects == 'undefined') data.effects = '';
	}

	if (typeof data.fontweight !== 'undefined' && !isNaN(parseInt(data.fontweight, 10))) {
		if (parseInt(data.fontweight, 10) % 100 !== 0) {
			data.variationweight = data.fontweight;
			data.fontweight = 'variation';
		}
	}
	if (data.widthunits === '') data.widthunits = 'px';
	if (data.topunits === '') data.topunits = 'px';
	if (typeof data.text == 'undefined') data.text = '';
	if (typeof data.sbsevent == 'undefined') data.sbsevent = '';
	if (typeof data.sbsloop == 'undefined') data.sbsloop = '';

	var elem_id = data.elem_id;
	var elem_type = data.elem_type;

	/* add wrapper */
	$('.tn-artboard').append(
		'<div class="tn-elem' +
			(isFake ? ' tn-elem__fake' : '') +
			'" id="' +
			elem_id +
			'" data-elem-id="' +
			elem_id +
			'" data-elem-type="' +
			elem_type +
			'"></div>',
	);
	var $el = $('#' + elem_id);

	/* add element html and fish content */
	$el.html('<div class="tn-atom" field="tn_text_' + data.elem_id + '"></div>');
	data.text = data.text.replace(/<font(.*?[^<])>/gi, '');
	data.text = data.text.replace(/<\/font>/gi, '');
	$el.find('.tn-atom').html(window.ver_redactor === 'q' ? Quill.addNbspMarkers(data.text) : data.text);

	/* add data atributes */
	var fields_str =
		'groupid,classname,top,left,align,fontsize,width,color,fontfamily,lineheight,fontweight,variationweight,letterspacing,lettercase,opacity,rotate,zindex,container,axisx,axisy,tag,link,linktarget,relnofollow,animduration,animdelay,animdistance,animscale,animtriggeroffset,animprx,animprxs,animprxdy,animprxdx,animfix,animfixdist,animfixtrgofst,animmobile,lock,invisible,leftunits,topunits,widthunits,pevent,animstyle,sbsevent,sbstrg,sbstrgofst,sbsloop,sbsopts,sbstrgels,layer,effects';
	var fields = fields_str.split(',');
	$el.attr('data-fields', fields_str);

	/* add ui edit clicks */
	elem__addUiClickEvents__text($el);

	/* add events listners and reacts */
	$el.on('elementSelected', '', {elem_id: elem_id}, panelSettings__open);
	$el.on('elementSelected', '', {elem_id: elem_id}, layers__hightlight);
	$el.on('elementUnselected', '', {elem_id: elem_id}, layers__hightlight);

	/* set field values */
	addElem__setFieldValues($el, fields, data);

	/* render elem view */
	elem__renderView($el);

	/* fix on safari resize handle */
	$el.append('<div class="ui-pseudo-handle-fix-e"></div>');
	$el.append('<div class="ui-pseudo-handle-fix-w"></div>');

	if (elem__getFieldValue($el, 'lock') == 'y') {
		$el.draggable('disable');
	}

	if (elem__getFieldValue($el, 'invisible') == 'y') {
		$el.addClass('tn-elem__invisible');
	}

	return $el;
}

function addImage(data, isFake) {
	tn_console('func: addImage');

	/* in has not init values */
	if (typeof data !== 'object') {
		data = {
			elem_id: Date.now(),
			elem_type: 'image',
			img: 'https://tilda.ws/img/imgfishsquare.gif',
		};

		var $wndframe = $('body').parent();
		var $canvasMax = $('.tn-canvas-max');

		if ($wndframe.scrollTop() > $canvasMax.offset().top) {
			data.top = $wndframe.scrollTop() - $canvasMax.offset().top + 80;
			if (data.top > parseInt($canvasMax.height())) {
				data.top = 20;
				$wndframe.animate({scrollTop: $('.tn-canvas-min').offset().top - 90}, 200);
			}
		} else {
			data.top = '20';
		}

		data.left = '20';
		data.width = '200';
		data.zindex = allelems__getHighestZIndex() + 1;
	}

	if (!data.elem_id) data.elem_id = Date.now();

	if (!isFake) {
		if (typeof data.width == 'undefined') data.width = '10';
		if (typeof data.rotate == 'undefined') data.rotate = '0';
		if (typeof data.opacity == 'undefined') data.opacity = '1';
		if (typeof data.container == 'undefined') data.container = 'grid';
		if (typeof data.axisy == 'undefined') data.axisy = 'top';
		if (typeof data.axisx == 'undefined') data.axisx = 'left';
		if (typeof data.link == 'undefined') data.link = '';
		if (typeof data.linktarget == 'undefined') data.linktarget = '';
		if (typeof data.relnofollow == 'undefined') data.relnofollow = '';
		if (typeof data.borderwidth == 'undefined') data.borderwidth = '';
		if (typeof data.borderstyle == 'undefined') data.borderstyle = '';
		if (typeof data.bordercolor == 'undefined') data.bordercolor = '';
		if (typeof data.borderradius == 'undefined') data.borderradius = '';
		if (typeof data.lock == 'undefined') data.lock = '';
		if (typeof data.invisible == 'undefined') data.invisible = '';
		if (typeof data.leftunits == 'undefined') data.leftunits = 'px';
		if (typeof data.topunits == 'undefined') data.topunits = 'px';
		if (typeof data.shadowcolor == 'undefined') data.shadowcolor = '';
		if (typeof data.classname == 'undefined') data.classname = '';
		if (typeof data.widthunits == 'undefined') data.widthunits = 'px';
		if (typeof data.alt == 'undefined') data.alt = '';
		if (typeof data.filewidth == 'undefined') data.filewidth = '';
		if (typeof data.fileheight == 'undefined') data.fileheight = '';
		if (typeof data.zoomable == 'undefined') data.zoomable = '';
		if (typeof data.lazyoff == 'undefined') data.lazyoff = '';
		if (typeof data.pevent == 'undefined') data.pevent = '';
		if (typeof data.layer == 'undefined') data.layer = '';
		if (typeof data.animstyle == 'undefined') data.animstyle = '';
		if (typeof data.animduration == 'undefined') data.animduration = '';
		if (typeof data.animdelay == 'undefined') data.animdelay = '';
		if (typeof data.animdistance == 'undefined') data.animdistance = '';
		if (typeof data.animscale == 'undefined') data.animscale = '';
		if (typeof data.animtriggeroffset == 'undefined') data.animtriggeroffset = '';
		if (typeof data.animprx == 'undefined') data.animprx = '';
		if (typeof data.animprxs == 'undefined') data.animprxs = '';
		if (typeof data.animprxdx == 'undefined') data.animprxdx = '';
		if (typeof data.animprxdy == 'undefined') data.animprxdy = '';
		if (typeof data.animfix == 'undefined') data.animfix = '';
		if (typeof data.animfixdist == 'undefined') data.animfixdist = '';
		if (typeof data.animfixtrgofst == 'undefined') data.animfixtrgofst = '';
		if (typeof data.shadowcolor == 'undefined') data.shadowcolor = '';
		if (typeof data.shadowopacity == 'undefined') data.shadowopacity = '';
		if (typeof data.shadowblur == 'undefined') data.shadowblur = '';
		if (typeof data.shadowspread == 'undefined') data.shadowspread = '';
		if (typeof data.shadowx == 'undefined') data.shadowx = '';
		if (typeof data.shadowy == 'undefined') data.shadowy = '';
		if (typeof data.amazonsrc == 'undefined') data.amazonsrc = '';
		if (typeof data.uploaderror == 'undefined') data.uploaderror = '';
		if (typeof data.buttonstat == 'undefined') data.buttonstat = '';
		if (typeof data.effects == 'undefined') data.effects = '';
	}

	if (data.widthunits === '') data.widthunits = 'px';
	if (data.topunits === '') data.topunits = 'px';
	if (typeof data.sbsevent == 'undefined') data.sbsevent = '';
	if (typeof data.sbsloop == 'undefined') data.sbsloop = '';

	var elem_id = data.elem_id;
	var elem_type = data.elem_type;

	/* add wrapper */
	$('.tn-artboard').append(
		'<div class="tn-elem' +
			(isFake ? ' tn-elem__fake' : '') +
			' tn-elem__image" id="' +
			elem_id +
			'" data-elem-id="' +
			elem_id +
			'" data-elem-type="' +
			elem_type +
			'"></div>',
	);
	var $el = $('#' + elem_id);

	/* add element html and fish content */
	$el.html('<div class="tn-atom"></div>');

	// prettier-ignore
	$el
		.find('.tn-atom')
		.html('<img src="" class="tn-atom__img" width="100%" style="display:block;" imgfield="tn_img_' + elem_id + '" data-tu-noclick="yes" data-tu-is-image="yes" data-tu-multiple="no">');

	/* add data atributes */
	var fields_str =
		'amazonsrc,uploaderror,groupid,classname,img,width,filewidth,fileheight,top,left,opacity,rotate,zindex,container,axisx,axisy,link,buttonstat,linktarget,relnofollow,borderwidth,borderradius,bordercolor,borderstyle,shadowcolor,shadowopacity,shadowblur,shadowspread,shadowx,shadowy,alt,animduration,animdelay,animdistance,animscale,animtriggeroffset,animprx,animprxs,animprxdy,animprxdx,animfix,animfixdist,animfixtrgofst,animmobile,lock,invisible,leftunits,topunits,widthunits,zoomable,lazyoff,pevent,animstyle,sbsevent,sbstrg,sbstrgofst,sbsloop,sbsopts,sbstrgels,layer,effects';
	var fields = fields_str.split(',');
	$el.attr('data-fields', fields_str);

	/* add ui edit clicks */
	elem__addUiClickEvents__image($el);

	/* add events listners and reacts */
	$el.on('elementSelected', '', {elem_id: elem_id}, panelSettings__open);
	$el.on('elementSelected', '', {elem_id: elem_id}, layers__hightlight);
	$el.on('elementUnselected', '', {elem_id: elem_id}, layers__hightlight);

	/* set field values */
	addElem__setFieldValues($el, fields, data);

	/* render elem view */
	elem__renderView($el);

	$el
		.find('.tn-atom__img')
		.one('load', function () {
			elem__renderViewOneField($el, 'top');
		})
		.each(function () {
			if (this.complete) $(this).load();
		});

	$el.find('.tn-atom__img').on('load', function () {
		tn_setOutlinePosition('selected');
	});

	/* fix on safari resize handle */
	$el.append('<div class="ui-pseudo-handle-fix-e"></div>');
	$el.append('<div class="ui-pseudo-handle-fix-w"></div>');

	if (elem__getFieldValue($el, 'lock') == 'y') {
		$el.draggable('disable');
	}
	if (elem__getFieldValue($el, 'invisible') == 'y') {
		$el.addClass('tn-elem__invisible');
	}

	return $el;
}

function addShape(data, isFake) {
	tn_console('func: addShape');

	/* in has not init values */
	if (typeof data !== 'object') {
		data = {
			elem_id: Date.now(),
			elem_type: 'shape',
		};

		var $wndframe = $('body').parent();
		var $canvasMax = $('.tn-canvas-max');

		if ($wndframe.scrollTop() > $canvasMax.offset().top) {
			data.top = $wndframe.scrollTop() - $canvasMax.offset().top + 80;
			if (data.top > parseInt($canvasMax.height())) {
				data.top = 20;
				$wndframe.animate({scrollTop: $('.tn-canvas-min').offset().top - 90}, 200);
			}
		} else {
			data.top = '20';
		}

		data.left = '20';
		data.width = '100';
		data.height = '100';
		data.bgcolor = '#fff705';
		data.zindex = allelems__getHighestZIndex() + 1;
	}

	if (!data.elem_id) data.elem_id = Date.now();

	if (!isFake) {
		if (typeof data.width == 'undefined') data.width = '1';
		if (typeof data.rotate == 'undefined') data.rotate = '0';
		if (typeof data.opacity == 'undefined') data.opacity = '1';
		if (typeof data.container == 'undefined') data.container = 'grid';
		if (typeof data.axisy == 'undefined') data.axisy = 'top';
		if (typeof data.axisx == 'undefined') data.axisx = 'left';
		if (typeof data.link == 'undefined') data.link = '';
		if (typeof data.linktarget == 'undefined') data.linktarget = '';
		if (typeof data.relnofollow == 'undefined') data.relnofollow = '';
		if (typeof data.borderwidth == 'undefined') data.borderwidth = '';
		if (typeof data.borderstyle == 'undefined') data.borderstyle = '';
		if (typeof data.bordercolor == 'undefined') data.bordercolor = '';
		if (typeof data.borderradius == 'undefined') data.borderradius = '';
		if (typeof data.lock == 'undefined') data.lock = '';
		if (typeof data.invisible == 'undefined') data.invisible = '';
		if (typeof data.leftunits == 'undefined') data.leftunits = 'px';
		if (typeof data.topunits == 'undefined') data.topunits = 'px';
		if (typeof data.shadowcolor == 'undefined') data.shadowcolor = '';
		if (typeof data.classname == 'undefined') data.classname = '';
		if (typeof data.bgimg == 'undefined') data.bgimg = '';
		if (typeof data.bgattachment == 'undefined') data.bgattachment = 'static';
		if (typeof data.bgposition == 'undefined') data.bgposition = 'center center';
		if (typeof data.heightunits == 'undefined') data.heightunits = 'px';
		if (typeof data.widthunits == 'undefined') data.widthunits = 'px';
		if (typeof data.bgcolor == 'undefined') data.bgcolor = '';
		if (typeof data.figure == 'undefined') data.figure = 'rectangle';
		if (typeof data.zoomable == 'undefined') data.zoomable = '';
		if (typeof data.lazyoff == 'undefined') data.lazyoff = '';
		if (typeof data.pevent == 'undefined') data.pevent = '';
		if (typeof data.layer == 'undefined') data.layer = '';
		if (typeof data.animstyle == 'undefined') data.animstyle = '';
		if (typeof data.animduration == 'undefined') data.animduration = '';
		if (typeof data.animdelay == 'undefined') data.animdelay = '';
		if (typeof data.animdistance == 'undefined') data.animdistance = '';
		if (typeof data.animscale == 'undefined') data.animscale = '';
		if (typeof data.animtriggeroffset == 'undefined') data.animtriggeroffset = '';
		if (typeof data.animprx == 'undefined') data.animprx = '';
		if (typeof data.animprxs == 'undefined') data.animprxs = '';
		if (typeof data.animprxdx == 'undefined') data.animprxdx = '';
		if (typeof data.animprxdy == 'undefined') data.animprxdy = '';
		if (typeof data.animfix == 'undefined') data.animfix = '';
		if (typeof data.animfixdist == 'undefined') data.animfixdist = '';
		if (typeof data.animfixtrgofst == 'undefined') data.animfixtrgofst = '';
		if (typeof data.shadowcolor == 'undefined') data.shadowcolor = '';
		if (typeof data.shadowopacity == 'undefined') data.shadowopacity = '';
		if (typeof data.shadowblur == 'undefined') data.shadowblur = '';
		if (typeof data.shadowspread == 'undefined') data.shadowspread = '';
		if (typeof data.shadowx == 'undefined') data.shadowx = '';
		if (typeof data.shadowy == 'undefined') data.shadowy = '';
		if (typeof data.amazonsrc == 'undefined') data.amazonsrc = '';
		if (typeof data.uploaderror == 'undefined') data.uploaderror = '';
		if (typeof data.buttonstat == 'undefined') data.buttonstat = '';
		if (typeof data.effects == 'undefined') data.effects = '';
	}

	if (data.widthunits === '') data.widthunits = 'px';
	if (data.heightunits === '') data.heightunits = 'px';
	if (data.topunits === '') data.topunits = 'px';
	if (typeof data.sbsevent == 'undefined') data.sbsevent = '';
	if (typeof data.sbsloop == 'undefined') data.sbsloop = '';

	var elem_id = data.elem_id;
	var elem_type = data.elem_type;

	/* add wrapper */
	$('.tn-artboard').append(
		'<div class="tn-elem' +
			(isFake ? ' tn-elem__fake' : '') +
			'" id="' +
			elem_id +
			'" data-elem-id="' +
			elem_id +
			'" data-elem-type="' +
			elem_type +
			'"></div>',
	);
	var $el = $('#' + elem_id);

	/* add element html and fish content */
	// prettier-ignore
	$el.html(
		'<div class="tn-atom" bgimgfield="tn_img_' + elem_id + '" data-tu-noclick="yes" data-tu-is-image="yes" data-tu-multiple="no"></div>',
	);

	/* add data atributes */
	var fields_str =
		'amazonsrc,uploaderror,groupid,classname,width,height,figure,bgcolor,bgimg,bgattachment,bgposition,bgposition_imgpos,bgposition_imgsize,top,left,opacity,rotate,zindex,container,axisx,axisy,link,buttonstat,linktarget,relnofollow,borderwidth,borderradius,bordercolor,borderstyle,shadowcolor,shadowopacity,shadowblur,shadowspread,shadowx,shadowy,animduration,animdelay,animdistance,animscale,animtriggeroffset,animprx,animprxs,animprxdy,animprxdx,animfix,animfixdist,animfixtrgofst,animmobile,lock,invisible,leftunits,topunits,widthunits,heightunits,zoomable,lazyoff,pevent,animstyle,sbsevent,sbstrg,sbstrgofst,sbsloop,sbsopts,sbstrgels,layer,effects';
	var fields = fields_str.split(',');
	$el.attr('data-fields', fields_str);

	/* add ui edit clicks */
	elem__addUiClickEvents__shape($el);

	/* add events listners and reacts */
	$el.on('elementSelected', '', {elem_id: elem_id}, panelSettings__open);
	$el.on('elementSelected', '', {elem_id: elem_id}, layers__hightlight);
	$el.on('elementUnselected', '', {elem_id: elem_id}, layers__hightlight);

	/* set field values */
	addElem__setFieldValues($el, fields, data);

	/* render elem view */
	elem__renderView($el);

	/* fix on safari resize handle */
	$el.append('<div class="ui-pseudo-handle-fix-e"></div>');
	$el.append('<div class="ui-pseudo-handle-fix-w"></div>');

	if (elem__getFieldValue($el, 'lock') == 'y') {
		$el.draggable('disable');
	}
	if (elem__getFieldValue($el, 'invisible') == 'y') {
		$el.addClass('tn-elem__invisible');
	}

	if (data.figure == 'line') {
		$el.find('.ui-resizable-s').css('display', 'none');
		$el.find('.ui-resizable-n').css('display', 'none');
		$el.find('.ui-resizable-se').css('display', 'none');
		$el.find('.ui-resizable-sw').css('display', 'none');
		$el.find('.ui-resizable-ne').css('display', 'none');
		$el.find('.ui-resizable-nw').css('display', 'none');
		$el.resizable('option', 'grid', '1,1');
	}

	return $el;
}

function addButton(data, isFake) {
	tn_console('func: addButton');

	/* in has not init values */
	if (typeof data !== 'object') {
		data = {
			elem_id: Date.now(),
			elem_type: 'button',
			caption: "LET'S GO!",
		};

		var wndframe = $('body').parent();
		var $canvasMax = $('.tn-canvas-max');

		if (wndframe.scrollTop() > $canvasMax.offset().top) {
			data.top = wndframe.scrollTop() - $canvasMax.offset().top + 80;
			if (data.top > parseInt($canvasMax.height())) {
				data.top = 20;
				wndframe.animate({scrollTop: $('.tn-canvas-min').offset().top - 90}, 200);
			}
		} else {
			data.top = '20';
		}

		data.left = '20';
		data.width = '200';
		data.height = '55';
		data.fontsize = '14';
		data.fontfamily = 'Arial';
		data.fontweight = '600';
		data.lineheight = '1.55';
		data.color = '#ffffff';
		data.bgcolor = '#000000';
		data.zindex = allelems__getHighestZIndex() + 1;
		data.borderradius = '30';
		data.speedhover = '0.2';
	}

	if (!data.elem_id) data.elem_id = Date.now();

	if (!isFake) {
		if (typeof data.width == 'undefined') data.width = '1';
		if (typeof data.rotate == 'undefined') data.rotate = '0';
		if (typeof data.opacity == 'undefined') data.opacity = '1';
		if (typeof data.container == 'undefined') data.container = 'grid';
		if (typeof data.axisy == 'undefined') data.axisy = 'top';
		if (typeof data.axisx == 'undefined') data.axisx = 'left';
		if (typeof data.link == 'undefined') data.link = '';
		if (typeof data.linktarget == 'undefined') data.linktarget = '';
		if (typeof data.relnofollow == 'undefined') data.relnofollow = '';
		if (typeof data.buttonstat == 'undefined') data.buttonstat = '';
		if (typeof data.borderwidth == 'undefined') data.borderwidth = '';
		if (typeof data.borderstyle == 'undefined') data.borderstyle = '';
		if (typeof data.bordercolor == 'undefined') data.bordercolor = '';
		if (typeof data.borderradius == 'undefined') data.borderradius = '';
		if (typeof data.lock == 'undefined') data.lock = '';
		if (typeof data.invisible == 'undefined') data.invisible = '';
		if (typeof data.leftunits == 'undefined') data.leftunits = 'px';
		if (typeof data.topunits == 'undefined') data.topunits = 'px';
		if (typeof data.shadowcolor == 'undefined') data.shadowcolor = '';
		if (typeof data.classname == 'undefined') data.classname = '';
		if (typeof data.letterspacing == 'undefined') data.letterspacing = '0';
		if (typeof data.align == 'undefined') data.align = 'center';
		if (typeof data.colorhover == 'undefined') data.colorhover = '';
		if (typeof data.bordercolorhover == 'undefined') data.bordercolorhover = '';
		if (typeof data.bgcolorhover == 'undefined') data.bgcolorhover = '';
		if (typeof data.speedhover == 'undefined') data.speedhover = '';
		if (typeof data.color == 'undefined') data.color = '';
		if (typeof data.bgcolor == 'undefined') data.bgcolor = '';
		if (typeof data.caption == 'undefined') data.caption = '';
		if (typeof data.layer == 'undefined') data.layer = '';
		if (typeof data.pevent == 'undefined') data.pevent = '';
		if (typeof data.animstyle == 'undefined') data.animstyle = '';
		if (typeof data.animduration == 'undefined') data.animduration = '';
		if (typeof data.animdelay == 'undefined') data.animdelay = '';
		if (typeof data.animdistance == 'undefined') data.animdistance = '';
		if (typeof data.animscale == 'undefined') data.animscale = '';
		if (typeof data.animtriggeroffset == 'undefined') data.animtriggeroffset = '';
		if (typeof data.animprx == 'undefined') data.animprx = '';
		if (typeof data.animprxs == 'undefined') data.animprxs = '';
		if (typeof data.animprxdx == 'undefined') data.animprxdx = '';
		if (typeof data.animprxdy == 'undefined') data.animprxdy = '';
		if (typeof data.animfix == 'undefined') data.animfix = '';
		if (typeof data.animfixdist == 'undefined') data.animfixdist = '';
		if (typeof data.animfixtrgofst == 'undefined') data.animfixtrgofst = '';
		if (typeof data.shadowcolor == 'undefined') data.shadowcolor = '';
		if (typeof data.shadowopacity == 'undefined') data.shadowopacity = '';
		if (typeof data.shadowblur == 'undefined') data.shadowblur = '';
		if (typeof data.shadowspread == 'undefined') data.shadowspread = '';
		if (typeof data.shadowx == 'undefined') data.shadowx = '';
		if (typeof data.shadowy == 'undefined') data.shadowy = '';
		if (typeof data.effects == 'undefined') data.effects = '';
	}

	if (typeof data.fontweight !== 'undefined' && !isNaN(parseInt(data.fontweight, 10))) {
		if (parseInt(data.fontweight, 10) % 100 !== 0) {
			data.variationweight = data.fontweight;
			data.fontweight = 'variation';
		}
	}
	if (data.topunits === '') data.topunits = 'px';
	if (typeof data.sbsevent == 'undefined') data.sbsevent = '';
	if (typeof data.sbsloop == 'undefined') data.sbsloop = '';

	var elem_id = data.elem_id;
	var elem_type = data.elem_type;

	// prettier-ignore
	$('.tn-artboard').append(
		'<div class="tn-elem' + (isFake ? ' tn-elem__fake' : '') + '" id="' + elem_id + '" data-elem-id="' + elem_id + '" data-elem-type="' + elem_type + '"></div>',
	);
	var $el = $('#' + elem_id);

	/* add element html and fish content */
	$el.html('<div class="tn-atom" field="tn_text_' + data.elem_id + '"></div>');
	$el.find('.tn-atom').html(data.caption);

	/* add data atributes */
	var fields_str =
		'groupid,classname,top,left,align,fontsize,width,height,color,fontfamily,lineheight,fontweight,variationweight,letterspacing,lettercase,bgcolor,opacity,rotate,zindex,container,axisx,axisy,caption,link,linktarget,relnofollow,buttonstat,borderwidth,borderradius,bordercolor,borderstyle,shadowcolor,shadowopacity,shadowblur,shadowspread,shadowx,shadowy,pevent,animduration,animdelay,animdistance,animscale,animtriggeroffset,animprx,animprxs,animprxdy,animprxdx,animfix,animfixdist,animfixtrgofst,animmobile,bgcolorhover,bordercolorhover,colorhover,speedhover,lock,invisible,leftunits,topunits,animstyle,sbsevent,sbstrg,sbstrgofst,sbsloop,sbsopts,sbstrgels,layer,effects';
	var fields = fields_str.split(',');
	$el.attr('data-fields', fields_str);

	/* add ui edit clicks */
	elem__addUiClickEvents__button($el);

	/* add events listners and reacts */
	$el.on('elementSelected', '', {elem_id: elem_id}, panelSettings__open);
	$el.on('elementSelected', '', {elem_id: elem_id}, layers__hightlight);
	$el.on('elementUnselected', '', {elem_id: elem_id}, layers__hightlight);

	/* set field values */
	addElem__setFieldValues($el, fields, data);

	/* render elem view */
	elem__renderView($el);

	/* fix on safari resize handle */
	$el.append('<div class="ui-pseudo-handle-fix-e"></div>');
	$el.append('<div class="ui-pseudo-handle-fix-w"></div>');

	if (elem__getFieldValue($el, 'lock') == 'y') {
		$el.draggable('disable');
	}
	if (elem__getFieldValue($el, 'invisible') == 'y') {
		$el.addClass('tn-elem__invisible');
	}

	return $el;
}

function addVideo(data, isFake) {
	tn_console('func: addVideo');

	/* in has not init values */
	if (typeof data !== 'object') {
		data = {
			elem_id: Date.now(),
			elem_type: 'video',
		};

		var wndframe = $('body').parent();
		var $canvasMax = $('.tn-canvas-max');

		if (wndframe.scrollTop() > $canvasMax.offset().top) {
			data.top = wndframe.scrollTop() - $canvasMax.offset().top + 80;
			if (data.top > parseInt($canvasMax.height())) {
				data.top = 20;
				wndframe.animate({scrollTop: $('.tn-canvas-min').offset().top - 90}, 200);
			}
		} else {
			data.top = '20';
		}

		data.left = '20';
		data.width = '760';
		data.height = '420';
		data.bgcolor = '#000';
		data.zindex = allelems__getHighestZIndex() + 1;
		data.vidtype = 'y';
	}

	if (!data.elem_id) data.elem_id = Date.now();

	if (!isFake) {
		if (typeof data.width == 'undefined') data.width = '10';
		if (typeof data.rotate == 'undefined') data.rotate = '0';
		if (typeof data.opacity == 'undefined') data.opacity = '1';
		if (typeof data.container == 'undefined') data.container = 'grid';
		if (typeof data.axisy == 'undefined') data.axisy = 'top';
		if (typeof data.axisx == 'undefined') data.axisx = 'left';
		if (typeof data.lock == 'undefined') data.lock = '';
		if (typeof data.invisible == 'undefined') data.invisible = '';
		if (typeof data.leftunits == 'undefined') data.leftunits = 'px';
		if (typeof data.topunits == 'undefined') data.topunits = 'px';
		if (typeof data.shadowcolor == 'undefined') data.shadowcolor = '';
		if (typeof data.classname == 'undefined') data.classname = '';
		if (typeof data.bgimg == 'undefined') data.bgimg = '';
		if (typeof data.heightunits == 'undefined') data.heightunits = 'px';
		if (typeof data.widthunits == 'undefined') data.widthunits = 'px';
		if (typeof data.animstyle == 'undefined') data.animstyle = '';
		if (typeof data.animduration == 'undefined') data.animduration = '';
		if (typeof data.animdelay == 'undefined') data.animdelay = '';
		if (typeof data.animdistance == 'undefined') data.animdistance = '';
		if (typeof data.animscale == 'undefined') data.animscale = '';
		if (typeof data.animtriggeroffset == 'undefined') data.animtriggeroffset = '';
		if (typeof data.animprx == 'undefined') data.animprx = '';
		if (typeof data.animprxs == 'undefined') data.animprxs = '';
		if (typeof data.animprxdx == 'undefined') data.animprxdx = '';
		if (typeof data.animprxdy == 'undefined') data.animprxdy = '';
		if (typeof data.animfix == 'undefined') data.animfix = '';
		if (typeof data.animfixdist == 'undefined') data.animfixdist = '';
		if (typeof data.animfixtrgofst == 'undefined') data.animfixtrgofst = '';
		if (typeof data.youtubeid == 'undefined') data.youtubeid = '';
		if (typeof data.vimeoid == 'undefined') data.vimeoid = '';
		if (typeof data.vimeohash == 'undefined') data.vimeohash = '';
		if (typeof data.mp4video == 'undefined') data.mp4video = '';
		if (typeof data.showinfo == 'undefined') data.showinfo = '';
		if (typeof data.mute == 'undefined') data.mute = '';
		if (typeof data.loop == 'undefined') data.loop = '';
		if (typeof data.startsec == 'undefined') data.startsec = '';
		if (typeof data.endsec == 'undefined') data.endsec = '';
		if (typeof data.autoplay == 'undefined') data.autoplay = '';
		if (typeof data.layer == 'undefined') data.layer = '';
		if (typeof data.shadowcolor == 'undefined') data.shadowcolor = '';
		if (typeof data.shadowopacity == 'undefined') data.shadowopacity = '';
		if (typeof data.shadowblur == 'undefined') data.shadowblur = '';
		if (typeof data.shadowspread == 'undefined') data.shadowspread = '';
		if (typeof data.shadowx == 'undefined') data.shadowx = '';
		if (typeof data.shadowy == 'undefined') data.shadowy = '';
	}

	if (data.widthunits === '') data.widthunits = 'px';
	if (data.heightunits === '') data.heightunits = 'px';
	if (data.topunits === '') data.topunits = 'px';
	if (typeof data.sbsevent == 'undefined') data.sbsevent = '';
	if (typeof data.sbsloop == 'undefined') data.sbsloop = '';

	/* support old version */
	if (typeof data.vidtype == 'undefined') {
		data.vidtype = 'y';
		if (data.vimeoid !== '') data.vidtype = 'v';
		if (data.mp4video !== '') data.vidtype = 'html';
	}

	var elem_id = data.elem_id;
	var elem_type = data.elem_type;

	/* add wrapper */
	$('.tn-artboard').append(
		'<div class="tn-elem' +
			(isFake ? ' tn-elem__fake' : '') +
			'" id="' +
			elem_id +
			'" data-elem-id="' +
			elem_id +
			'" data-elem-type="' +
			elem_type +
			'"></div>',
	);
	var $el = $('#' + elem_id);

	// prettier-ignore
	$el.html(
		'<div class="tn-atom" bgimgfield="tn_img_' + elem_id + '" data-tu-noclick="yes" data-tu-is-image="yes" data-tu-multiple="no" style="background-position:center center; background-color:#000; height: 100%;"></div>',
	);

	/* add data atributes */
	var fields_str =
		'groupid,classname,width,height,bgimg,top,left,opacity,rotate,zindex,container,axisx,axisy,vidtype,youtubeid,vimeoid,vimeohash,mp4video,showinfo,mute,loop,autoplay,startsec,endsec,shadowcolor,shadowopacity,shadowblur,shadowspread,shadowx,shadowy,animduration,animdelay,animdistance,animscale,animtriggeroffset,animprx,animprxs,animprxdy,animprxdx,animfix,animfixdist,animfixtrgofst,animmobile,lock,invisible,leftunits,topunits,widthunits,heightunits,animstyle,sbsevent,sbstrg,sbstrgofst,sbsloop,sbsopts,sbstrgels,layer';
	var fields = fields_str.split(',');
	$el.attr('data-fields', fields_str);

	/* add ui edit clicks */
	elem__addUiClickEvents__video($el);

	/* add events listners and reacts */
	$el.on('elementSelected', '', {elem_id: elem_id}, panelSettings__open);
	$el.on('elementSelected', '', {elem_id: elem_id}, layers__hightlight);
	$el.on('elementUnselected', '', {elem_id: elem_id}, layers__hightlight);

	/* set field values */
	addElem__setFieldValues($el, fields, data);

	/* render elem view */
	elem__renderView($el);

	/* fix on safari resize handle */
	$el.append('<div class="ui-pseudo-handle-fix-e"></div>');
	$el.append('<div class="ui-pseudo-handle-fix-w"></div>');

	if (elem__getFieldValue($el, 'lock') == 'y') {
		$el.draggable('disable');
	}
	if (elem__getFieldValue($el, 'invisible') == 'y') {
		$el.addClass('tn-elem__invisible');
	}

	return $el;
}

function addHtml(data, isFake) {
	tn_console('func: addHtml');

	/* in has not init values */
	if (typeof data !== 'object') {
		data = {
			elem_id: Date.now(),
			elem_type: 'html',
		};

		var wndframe = $('body').parent();
		var $canvasMax = $('.tn-canvas-max');

		if (wndframe.scrollTop() > $canvasMax.offset().top) {
			data.top = wndframe.scrollTop() - $canvasMax.offset().top + 80;
			if (data.top > parseInt($canvasMax.height())) {
				data.top = 20;
				wndframe.animate({scrollTop: $('.tn-canvas-min').offset().top - 90}, 200);
			}
		} else {
			data.top = '20';
		}

		data.left = '20';
		data.width = '560';
		data.height = '170';
		data.code =
			window.oplan === '0'
				? '<div>Embed HTML-code is not available on Free plan. Please upgrade your subscription.</div>'
				: '<div>Hello world!</div>';
		data.zindex = allelems__getHighestZIndex() + 1;
	}

	if (!data.elem_id) data.elem_id = Date.now();

	if (!isFake) {
		if (typeof data.container == 'undefined') data.container = 'grid';
		if (typeof data.axisy == 'undefined') data.axisy = 'top';
		if (typeof data.axisx == 'undefined') data.axisx = 'left';
		if (typeof data.lock == 'undefined') data.lock = '';
		if (typeof data.invisible == 'undefined') data.invisible = '';
		if (typeof data.leftunits == 'undefined') data.leftunits = 'px';
		if (typeof data.topunits == 'undefined') data.topunits = 'px';
		if (typeof data.classname == 'undefined') data.classname = '';
		if (typeof data.heightunits == 'undefined') data.heightunits = 'px';
		if (typeof data.widthunits == 'undefined') data.widthunits = 'px';
		if (typeof data.code == 'undefined') data.code = '';
		if (typeof data.layer == 'undefined') data.layer = '';
		if (typeof data.animstyle == 'undefined') data.animstyle = '';
		if (typeof data.animduration == 'undefined') data.animduration = '';
		if (typeof data.animdelay == 'undefined') data.animdelay = '';
		if (typeof data.animdistance == 'undefined') data.animdistance = '';
		if (typeof data.animscale == 'undefined') data.animscale = '';
		if (typeof data.animtriggeroffset == 'undefined') data.animtriggeroffset = '';
		if (typeof data.animprx == 'undefined') data.animprx = '';
		if (typeof data.animprxs == 'undefined') data.animprxs = '';
		if (typeof data.animprxdx == 'undefined') data.animprxdx = '';
		if (typeof data.animprxdy == 'undefined') data.animprxdy = '';
		if (typeof data.animfix == 'undefined') data.animfix = '';
		if (typeof data.animfixdist == 'undefined') data.animfixdist = '';
		if (typeof data.animfixtrgofst == 'undefined') data.animfixtrgofst = '';
	}

	if (data.widthunits === '') data.widthunits = 'px';
	if (data.heightunits === '') data.heightunits = 'px';
	if (data.topunits === '') data.topunits = 'px';
	if (typeof data.sbsevent == 'undefined') data.sbsevent = '';
	if (typeof data.sbsloop == 'undefined') data.sbsloop = '';

	var elem_id = data.elem_id;
	var elem_type = data.elem_type;

	/* add wrapper */
	$('.tn-artboard').append(
		'<div class="tn-elem' +
			(isFake ? ' tn-elem__fake' : '') +
			'" id="' +
			elem_id +
			'" data-elem-id="' +
			elem_id +
			'" data-elem-type="' +
			elem_type +
			'"></div>',
	);
	var $el = $('#' + elem_id);

	/* add element html and fish content */
	$el.html('<div class="tn-atom" style="background-color:rgba(29, 29, 29, 0.9);vertical-align:top;"></div>');
	/* el.find(".tn-atom").html("<div class='tn-atom__html-wrapp'><pre><code class='tn-atom__html-code'></code></pre><textarea class='tn-atom__html-textarea' style='height:1px;opacity:0;'></textarea></div>"); */
	$el
		.find('.tn-atom')
		.html('<div class="tn-atom__html-wrapp"><textarea class="tn-atom__html-textarea"></textarea></div>');

	/* el.find('.tn-atom__html-code').text(data.code); */
	$el.find('.tn-atom__html-textarea').val(data.code);

	/* add data atributes */
	var fields_str =
		'groupid,classname,width,height,top,left,zindex,container,axisx,axisy,code,animduration,animdelay,animdistance,animscale,animtriggeroffset,animprx,animprxs,animprxdy,animprxdx,animfix,animfixdist,animfixtrgofst,animmobile,lock,invisible,leftunits,topunits,widthunits,heightunits,animstyle,sbsevent,sbstrg,sbstrgofst,sbsloop,sbsopts,sbstrgels,layer';
	var fields = fields_str.split(',');
	$el.attr('data-fields', fields_str);

	/* add ui edit clicks */
	elem__addUiClickEvents__html($el);

	/* add events listners and reacts */
	$el.on('elementSelected', '', {elem_id: elem_id}, panelSettings__open);
	$el.on('elementSelected', '', {elem_id: elem_id}, layers__hightlight);
	$el.on('elementUnselected', '', {elem_id: elem_id}, layers__hightlight);

	/* set field values */
	addElem__setFieldValues($el, fields, data);

	/* render elem view */
	elem__renderView($el);

	/* fix on safari resize handle */
	$el.append('<div class="ui-pseudo-handle-fix-e"></div>');
	$el.append('<div class="ui-pseudo-handle-fix-w"></div>');

	if (elem__getFieldValue($el, 'lock') == 'y') {
		$el.draggable('disable');
	}
	if (elem__getFieldValue($el, 'invisible') == 'y') {
		$el.addClass('tn-elem__invisible');
	}

	/*
	el.find('pre code').each(function(i, block) {
		hljs.highlightBlock(block);
	});
	*/

	/*
	window.tn_elem_html_updatesize_timerid = setInterval(function() {
		$('.tn-atom__html-code').each(function(i, block) {
			var foo=$(this).
		});
	}, 2000);
	*/

	return $el;
}

function addTooltip(data, isFake) {
	tn_console('func: addTooltip');

	/* in has not init values */
	if (typeof data !== 'object') {
		data = {
			elem_id: Date.now(),
			elem_type: 'tooltip',
		};

		var wndframe = $('body').parent();
		var $canvasMax = $('.tn-canvas-max');

		if (wndframe.scrollTop() > $canvasMax.offset().top) {
			data.top = wndframe.scrollTop() - $canvasMax.offset().top + 80;
			if (data.top > parseInt($canvasMax.height())) {
				data.top = 20;
				wndframe.animate({scrollTop: $('.tn-canvas-min').offset().top - 90}, 200);
			}
		} else {
			data.top = '120';
		}

		data.left = '140';
		data.width = '25';

		data.zindex = allelems__getHighestZIndex() + 1;
		data.tipcaption = 'Curiosity about life in all its aspects, I think, is still the secret of great creative people.';
		data.align = 'left';

		data.bgcolor = '#ff7300';

		data.tipbgcolor = '#ffffff';
		data.tipradius = '10';
		data.tipwidth = '280';
		data.tipshadowblur = '15';

		data.shadowcolor = '#000000';
		data.shadowopacity = '0.3';
		data.shadowblur = '20';

		data.fontsize = '14';
		data.lineheight = '1.4';
		data.color = '#000000';

		if (typeof window.tn.textfont != 'undefined' && window.tn.textfont != 'undefined' && window.tn.textfont != '') {
			data.fontfamily = window.tn.textfont;
		} else {
			data.fontfamily = 'Arial';
		}
		if (
			typeof window.tn.textfontweight != 'undefined' &&
			window.tn.textfontweight != 'undefined' &&
			window.tn.textfontweight != ''
		) {
			data.fontweight = window.tn.textfontweight;
		} else {
			data.fontweight = '400';
		}
	}

	if (!data.elem_id) data.elem_id = Date.now();

	if (!isFake) {
		if (typeof data.container == 'undefined') data.container = 'grid';
		if (typeof data.axisy == 'undefined') data.axisy = 'top';
		if (typeof data.axisx == 'undefined') data.axisx = 'left';
		if (typeof data.opacity == 'undefined') data.opacity = '1';
		if (typeof data.lock == 'undefined') data.lock = '';
		if (typeof data.invisible == 'undefined') data.invisible = '';
		if (typeof data.leftunits == 'undefined') data.leftunits = 'px';
		if (typeof data.topunits == 'undefined') data.topunits = 'px';
		if (typeof data.align == 'undefined') data.align = 'left';
		if (typeof data.letterspacing == 'undefined') data.letterspacing = '0';
		if (typeof data.layer == 'undefined') data.layer = '';
		if (typeof data.shadowcolor == 'undefined') data.shadowcolor = '';
		if (typeof data.classname == 'undefined') data.classname = '';
		if (typeof data.bgcolor == 'undefined') data.bgcolor = '';
		if (typeof data.bordercolor == 'undefined') data.bordercolor = '';
		if (typeof data.borderwidth == 'undefined') data.borderwidth = '';
		if (typeof data.tipbgcolor == 'undefined') data.tipbgcolor = '';
		if (typeof data.tipradius == 'undefined') data.tipradius = '';
		if (typeof data.tipshadowblur == 'undefined') data.tipshadowblur = '';
		if (typeof data.tipwidth == 'undefined') data.tipwidth = '260';
		if (typeof data.tipposition == 'undefined') data.tipposition = '';
		if (typeof data.tipcaption == 'undefined') data.tipcaption = '';
		if (typeof data.tipimg == 'undefined') data.tipimg = '';
		if (typeof data.tipopen == 'undefined') data.tipopen = '';
		if (typeof data.pinicon == 'undefined') data.pinicon = '';
		if (typeof data.pincolor == 'undefined') data.pincolor = '';
		if (typeof data.animstyle == 'undefined') data.animstyle = '';
		if (typeof data.animduration == 'undefined') data.animduration = '';
		if (typeof data.animdelay == 'undefined') data.animdelay = '';
		if (typeof data.animscale == 'undefined') data.animscale = '';
		if (typeof data.animdistance == 'undefined') data.animdistance = '';
		if (typeof data.animtriggeroffset == 'undefined') data.animtriggeroffset = '';
		if (typeof data.animprx == 'undefined') data.animprx = '';
		if (typeof data.animprxs == 'undefined') data.animprxs = '';
		if (typeof data.animprxdx == 'undefined') data.animprxdx = '';
		if (typeof data.animprxdy == 'undefined') data.animprxdy = '';
		if (typeof data.animfix == 'undefined') data.animfix = '';
		if (typeof data.animfixdist == 'undefined') data.animfixdist = '';
		if (typeof data.animfixtrgofst == 'undefined') data.animfixtrgofst = '';
		if (typeof data.shadowx == 'undefined') data.shadowx = '';
		if (typeof data.shadowy == 'undefined') data.shadowy = '';
	}

	if (typeof data.fontweight !== 'undefined' && !isNaN(parseInt(data.fontweight, 10))) {
		if (parseInt(data.fontweight, 10) % 100 !== 0) {
			data.variationweight = data.fontweight;
			data.fontweight = 'variation';
		}
	}
	if (data.topunits === '') data.topunits = 'px';
	if (typeof data.sbsevent == 'undefined') data.sbsevent = '';
	if (typeof data.sbsloop == 'undefined') data.sbsloop = '';

	var elem_id = data.elem_id;
	var elem_type = data.elem_type;

	/* add wrapper */
	$('.tn-artboard').append(
		'<div class="tn-elem' +
			(isFake ? ' tn-elem__fake' : '') +
			' tn-elem__tooltip" id="' +
			elem_id +
			'" data-elem-id="' +
			elem_id +
			'" data-elem-type="' +
			elem_type +
			'"></div>',
	);
	var $el = $('#' + elem_id);

	/* add element html and fish content */
	// prettier-ignore
	$el.html(
		'<div class="tn-atom tn-atom__pin" bgimgfield="tn_img_' + elem_id + '" data-tu-noclick="yes" data-tu-is-image="yes" data-tu-multiple="no"></div>',
	);
	$el.append(
		'<div class="tn-atom__tip"><div class="tn-atom__tip-text" field="tn_text_' + data.elem_id + '"></div></div>',
	);
	$el.find('.tn-atom__tip-text').html(data.tipcaption);

	/* add data atributes */
	var fields_str =
		'groupid,classname,width,align,bgimg,fontsize,bgcolor,borderwidth,bordercolor,top,left,opacity,color,fontfamily,lineheight,fontweight,variationweight,letterspacing,lettercase,zindex,container,axisx,axisy,shadowcolor,shadowopacity,shadowblur,shadowspread,shadowx,shadowy,lock,invisible,leftunits,topunits,pinicon,pincolor,tipimg,tipbgcolor,tipradius,tipshadowblur,tipwidth,tipposition,tipopen,animduration,animdelay,animdistance,animscale,animtriggeroffset,animprx,animprxs,animprxdy,animprxdx,animfix,animfixdist,animfixtrgofst,animmobile,animstyle,sbsevent,sbstrg,sbstrgofst,sbsloop,sbsopts,sbstrgels,layer';
	var fields = fields_str.split(',');
	$el.attr('data-fields', fields_str);

	/* add ui edit clicks */
	elem__addUiClickEvents__tooltip($el);

	/* add events listners and reacts */
	$el.on('elementSelected', '', {elem_id: elem_id}, panelSettings__open);
	$el.on('elementSelected', '', {elem_id: elem_id}, layers__hightlight);
	$el.on('elementUnselected', '', {elem_id: elem_id}, layers__hightlight);

	/* set field values */
	addElem__setFieldValues($el, fields, data);

	/* render elem view */
	elem__renderView($el);

	/* fix on safari resize handle */
	$el.append('<div class="ui-pseudo-handle-fix-e"></div>');
	$el.append('<div class="ui-pseudo-handle-fix-w"></div>');

	if (elem__getFieldValue($el, 'lock') == 'y') {
		$el.draggable('disable');
	}
	if (elem__getFieldValue($el, 'invisible') == 'y') {
		$el.addClass('tn-elem__invisible');
	}

	$el.resizable('option', 'grid', '1,1');

	setInterval(function () {
		elem__renderViewOneField($el, 'tipposition');
	}, 1000);

	return $el;
}

function addForm(data, isFake) {
	tn_console('func: addHtml');

	/* in has not init values */
	if (typeof data !== 'object') {
		data = {
			elem_id: Date.now(),
			elem_type: 'form',
		};

		var wndframe = $('body').parent();
		var $canvasMax = $('.tn-canvas-max');

		if (wndframe.scrollTop() > $canvasMax.offset().top) {
			data.top = wndframe.scrollTop() - $canvasMax.offset().top + 80;
			if (data.top > parseInt($canvasMax.height())) {
				data.top = 20;
				wndframe.animate({scrollTop: $('.tn-canvas-min').offset().top - 90}, 200);
			}
		} else {
			data.top = '20';
		}

		data.left = '20';
		data.width = '460';

		data.zindex = allelems__getHighestZIndex() + 1;

		data.inputpos = 'v';
		data.inputcolor = '#000';
		data.inputbgcolor = '#fff';
		data.inputbordercolor = '#000';
		data.inputbordersize = '1';
		data.inputfontfamily = 'Arial';
		data.fieldfontfamily = '';
		data.inputfontsize = '16';
		data.inputfontweight = '400';
		data.inputheight = '50';
		data.inputmargbottom = '20';
		data.inputmargright = '20';

		data.inputtitlecolor = '#000';
		data.inputtitlefontsize = '16';
		data.inputtitlefontweight = '400';
		data.inputtitlemargbottom = '5';

		data.inputelsfontsize = '14';
		data.inputelsfontweight = '400';

		data.buttontitle = 'SUBMIT';
		data.buttoncolor = '#fff';
		data.buttonbgcolor = '#000';
		data.buttonwidth = '160';
		data.buttonheight = '50';
		data.buttonmargtop = '';
		data.buttonfontfamilty = 'Arial';
		data.buttonfontweight = '600';
		data.buttonfontsize = '14';

		data.inputs =
			'{"0":{"lid":"1531306243545","ls":"10","loff":"","li_type":"em","li_name":"email","li_title":"Your email","li_ph":"mail@example.com","li_nm":"email"},"1":{"lid":"1531306540094","ls":"20","loff":"","li_type":"nm","li_name":"name","li_title":"Your Name","li_ph":"John Smith","li_nm":"name"}}';
	}

	if (!data.elem_id) data.elem_id = Date.now();

	if (!isFake) {
		if (typeof data.container == 'undefined') data.container = 'grid';
		if (typeof data.axisy == 'undefined') data.axisy = 'top';
		if (typeof data.axisx == 'undefined') data.axisx = 'left';
		if (typeof data.lock == 'undefined') data.lock = '';
		if (typeof data.invisible == 'undefined') data.invisible = '';
		if (typeof data.leftunits == 'undefined') data.leftunits = 'px';
		if (typeof data.topunits == 'undefined') data.topunits = 'px';
		if (typeof data.classname == 'undefined') data.classname = '';
		if (typeof data.widthunits == 'undefined') data.widthunits = 'px';
		if (typeof data.layer == 'undefined') data.layer = '';
		if (typeof data.inputs == 'undefined') data.inputs = '';
		if (typeof data.receivers == 'undefined') data.receivers = '';
		if (typeof data.receivers_names == 'undefined') data.receivers_names = '';
		if (typeof data.animstyle == 'undefined') data.animstyle = '';
		if (typeof data.animduration == 'undefined') data.animduration = '';
		if (typeof data.animdelay == 'undefined') data.animdelay = '';
		if (typeof data.animdistance == 'undefined') data.animdistance = '';
		if (typeof data.animscale == 'undefined') data.animscale = '';
		if (typeof data.animtriggeroffset == 'undefined') data.animtriggeroffset = '';
		if (typeof data.animprx == 'undefined') data.animprx = '';
		if (typeof data.animprxs == 'undefined') data.animprxs = '';
		if (typeof data.animprxdx == 'undefined') data.animprxdx = '';
		if (typeof data.animprxdy == 'undefined') data.animprxdy = '';
		if (typeof data.animfix == 'undefined') data.animfix = '';
		if (typeof data.animfixdist == 'undefined') data.animfixdist = '';
		if (typeof data.animfixtrgofst == 'undefined') data.animfixtrgofst = '';
		if (typeof data.inputpos == 'undefined') data.inputpos = 'v';
		if (typeof data.inputfontfamily == 'undefined') data.inputfontfamily = '';
		if (typeof data.fieldfontfamily == 'undefined') data.fieldfontfamily = '';
		if (typeof data.inputfontsize == 'undefined') data.inputfontsize = '';
		if (typeof data.inputfontweight == 'undefined') data.inputfontweight = '';
		if (typeof data.inputcolor == 'undefined') data.inputcolor = '';
		if (typeof data.inputbgcolor == 'undefined') data.inputbgcolor = '';
		if (typeof data.inputbordercolor == 'undefined') data.inputbordercolor = '';
		if (typeof data.inputbordersize == 'undefined') data.inputbordersize = '';
		if (typeof data.inputradius == 'undefined') data.inputradius = '';
		if (typeof data.inputheight == 'undefined') data.inputheight = '';
		if (typeof data.inputmargbottom == 'undefined') data.inputmargbottom = '';
		if (typeof data.inputmargright == 'undefined') data.inputmargright = '';
		if (typeof data.inputtitlefontsize == 'undefined') data.inputfontsize = '';
		if (typeof data.inputtitlefontweight == 'undefined') data.inputtitlefontweight = '';
		if (typeof data.inputtitlecolor == 'undefined') data.inputtitlecolor = '';
		if (typeof data.inputtitlemargbottom == 'undefined') data.inputtitlemargbottom = '';
		if (typeof data.inputelscolor == 'undefined') data.inputelscolor = '';
		if (typeof data.inputelsfontsize == 'undefined') data.inputelsfontsize = '';
		if (typeof data.inputelsfontweight == 'undefined') data.inputelsfontweight = '';
		if (typeof data.inputsstyle == 'undefined') data.inputsstyle = '';
		if (typeof data.inputsstyle2 == 'undefined') data.inputsstyle2 = '';
		if (typeof data.buttonalign == 'undefined') data.buttonalign = '';
		if (typeof data.buttoncolor == 'undefined') data.buttoncolor = '';
		if (typeof data.buttonbgcolor == 'undefined') data.buttonbgcolor = '';
		if (typeof data.buttonbordercolor == 'undefined') data.buttonbordercolor = '';
		if (typeof data.buttonhovercolor == 'undefined') data.buttonhovercolor = '';
		if (typeof data.buttonhoverbgcolor == 'undefined') data.buttonhoverbgcolor = '';
		if (typeof data.buttonhoverbordercolor == 'undefined') data.buttonhoverbordercolor = '';
		if (typeof data.buttonhovershadowsize == 'undefined') data.buttonhovershadowsize = '';
		if (typeof data.buttonbordersize == 'undefined') data.buttonbordersize = '';
		if (typeof data.buttonradius == 'undefined') data.buttonradius = '';
		if (typeof data.buttonwidth == 'undefined') data.buttonwidth = '';
		if (typeof data.buttonheight == 'undefined') data.buttonheight = '';
		if (typeof data.buttonmargtop == 'undefined') data.buttonmargtop = '';
		if (typeof data.buttonshadowsize == 'undefined') data.buttonshadowsize = '';
		if (typeof data.buttonshadowopacity == 'undefined') data.buttonshadowopacity = '';
		if (typeof data.buttonfontfamily == 'undefined') data.buttonfontfamily = '';
		if (typeof data.buttonfontsize == 'undefined') data.buttonfontsize = '';
		if (typeof data.buttonfontweight == 'undefined') data.buttonfontweight = '';
		if (typeof data.buttonbgcolorhover == 'undefined') data.buttonbgcolorhover = '';
		if (typeof data.formname == 'undefined') data.formname = '';
		if (typeof data.buttontitle == 'undefined') data.buttontitle = '';
		if (typeof data.formmsgsuccess == 'undefined') data.formmsgsuccess = '';
		if (typeof data.formmsgurl == 'undefined') data.formmsgurl = '';
		if (typeof data.formerrreq == 'undefined') data.formerrreq = '';
		if (typeof data.formerremail == 'undefined') data.formerremail = '';
		if (typeof data.formerrphone == 'undefined') data.formerrphone = '';
		if (typeof data.formerrname == 'undefined') data.formerrname = '';
		if (typeof data.formbottomtext == 'undefined') data.formbottomtext = '';
		if (data.formbottomtext) data.formbottomtext = data.formbottomtext.split('"').join("'");
	}

	if (typeof data.inputfontweight !== 'undefined' && !isNaN(parseInt(data.inputfontweight, 10))) {
		if (parseInt(data.inputfontweight, 10) % 100 !== 0) {
			data.inputvariationweight = data.inputfontweight;
			data.inputfontweight = 'variation';
		}
	}
	if (typeof data.inputtitlefontweight !== 'undefined' && !isNaN(parseInt(data.inputtitlefontweight, 10))) {
		if (parseInt(data.inputtitlefontweight, 10) % 100 !== 0) {
			data.inputtitlevariationweight = data.inputtitlefontweight;
			data.inputtitlefontweight = 'variation';
		}
	}
	if (typeof data.inputelsfontweight !== 'undefined' && !isNaN(parseInt(data.inputelsfontweight, 10))) {
		if (parseInt(data.inputelsfontweight, 10) % 100 !== 0) {
			data.inputelvariationweight = data.inputelsfontweight;
			data.inputelsfontweight = 'variation';
		}
	}
	if (typeof data.buttonfontweight !== 'undefined' && !isNaN(parseInt(data.buttonfontweight, 10))) {
		if (parseInt(data.buttonfontweight, 10) % 100 !== 0) {
			data.buttonvariationweight = data.buttonfontweight;
			data.buttonfontweight = 'variation';
		}
	}
	if (data.widthunits === '') data.widthunits = 'px';
	if (data.topunits === '') data.topunits = 'px';
	if (typeof data.sbsevent == 'undefined') data.sbsevent = '';
	if (typeof data.sbsloop == 'undefined') data.sbsloop = '';

	var elem_id = data.elem_id;
	var elem_type = data.elem_type;

	/* add wrapper */
	$('.tn-artboard').append(
		'<div class="tn-elem' +
			(isFake ? ' tn-elem__fake' : '') +
			'" id="' +
			elem_id +
			'" data-elem-id="' +
			elem_id +
			'" data-elem-type="' +
			elem_type +
			'"></div>',
	);
	var $el = $('#' + elem_id);

	/* add element html and fish content */
	$el.html('<div class="tn-atom" style="vertical-align:top;pointer-events:none;"></div>');
	$el.append(
		'<div class="tn-atom__inputs-wrapp" style="display:none;"><textarea class="tn-atom__inputs-textarea"></textarea></div>',
	);

	if (data.inputs && data.inputs != '') data.inputs = data.inputs.replaceAll('&quot;', '&amp;quot;');
	$el.find('.tn-atom__inputs-textarea').val(data.inputs);

	/* add data atributes */
	var fields_str =
		'groupid,classname,width,top,left,zindex,container,axisx,axisy,animduration,animdelay,animdistance,animscale,animtriggeroffset,animprx,animprxs,animprxdy,animprxdx,animfix,animfixdist,animfixtrgofst,animmobile,lock,invisible,leftunits,topunits,widthunits,animstyle,sbsevent,sbstrg,sbstrgofst,sbsloop,sbsopts,sbstrgels,layer,';
	fields_str += 'inputs,receivers,receivers_names,';
	fields_str +=
		'inputpos,inputfontfamily,inputfontsize,inputfontweight,fieldfontfamily,inputvariationweight,inputcolor,inputbgcolor,inputbordercolor,inputbordersize,inputradius,inputheight,inputmargbottom,inputmargright,inputelscolor,inputelsfontsize,inputelsfontweight,inputelsvariationweight,';
	fields_str +=
		'inputtitlefontsize,inputtitlefontweight,inputtitlevariationweight,inputtitlecolor,inputtitlemargbottom,inputsstyle,inputsstyle2,';
	fields_str += 'buttontitle,buttonalign,buttoncolor,buttonbgcolor,buttonbordercolor,buttonbordersize,buttonradius,';
	fields_str +=
		'buttonmargtop,buttonwidth,buttonheight,buttonfontfamily,buttonfontsize,buttonfontweight,buttonvariationweight,buttonshadowsize,buttonshadowopacity,buttonhovercolor,buttonhoverbgcolor,buttonhoverbordercolor,buttonhovershadowsize,';
	fields_str += 'formmsgsuccess,formmsgurl,formname,formerrreq,formerremail,formerrphone,formerrname,formbottomtext';

	var fields = fields_str.split(',');
	$el.attr('data-fields', fields_str);

	/* add ui edit clicks */
	elem__addUiClickEvents__form($el);

	/* add events listners and reacts */
	$el.on('elementSelected', '', {elem_id: elem_id}, panelSettings__open);
	$el.on('elementSelected', '', {elem_id: elem_id}, layers__hightlight);
	$el.on('elementUnselected', '', {elem_id: elem_id}, layers__hightlight);

	/* set field values */
	addElem__setFieldValues($el, fields, data);

	/* render elem view */
	elem__renderView($el);

	/* fix on safari resize handle */
	$el.append('<div class="ui-pseudo-handle-fix-e"></div>');
	$el.append('<div class="ui-pseudo-handle-fix-w"></div>');

	if (elem__getFieldValue($el, 'lock') == 'y') {
		$el.draggable('disable');
	}
	if (elem__getFieldValue($el, 'invisible') == 'y') {
		$el.addClass('tn-elem__invisible');
	}

	elem__renderViewOneField($el, 'left');
	elem__renderViewOneField($el, 'top');

	return $el;
}

function addGallery(data, isFake) {
	tn_console('func: addGallery');

	/* in has not init values */
	if (typeof data !== 'object') {
		data = {
			elem_id: Date.now(),
			elem_type: 'gallery',
		};

		var wndframe = $('body').parent();
		var $canvasMax = $('.tn-canvas-max');

		if (wndframe.scrollTop() > $canvasMax.offset().top) {
			data.top = wndframe.scrollTop() - $canvasMax.offset().top + 80;
			if (data.top > parseInt($canvasMax.height())) {
				data.top = 20;
				wndframe.animate({scrollTop: $('.tn-canvas-min').offset().top - 90}, 200);
			}
		} else {
			data.top = '20';
		}

		data.left = '20';
		data.width = '600';
		data.height = '400';
		data.imgs = [
			{
				lid: Date.now(),
				li_img: 'https://static.tildacdn.com/tild3437-3839-4037-b639-643935383936/jorgenhaland101813.jpg',
				li_imgalt: '',
				li_imgtitle: '',
				li_youtube: '',
				li_vimeo: '',
				li_imgurl: '',
				li_imgtarget: false,
				li_imgnofollow: false,
			},
			{
				lid: Date.now() + 1,
				li_img: 'https://static.tildacdn.com/tild6637-6131-4438-a662-626134663032/cherrylaithang138648.jpg',
				li_imgalt: '',
				li_imgtitle: '',
				li_youtube: '',
				li_vimeo: '',
				li_imgurl: '',
				li_imgtarget: false,
				li_imgnofollow: false,
			},
		];
		data.slds_playiconsize = '70';
		data.slds_playiconcolor = '#fff';

		data.slds_dotscontrols = 'none';
		data.slds_dotsbgcolor = '#999999';
		data.slds_dotsbgcoloractive = '#222';
		data.slds_arrowsize = 's';
		data.slds_dotssize = '8';
		data.slds_dotsvmargin = '10';
		data.slds_dotshmargin = '15';

		data.slds_arrowcolor = '#000';
		data.slds_arrowbgcolor = '#e8e8e8';
		data.slds_arrowcontrols = 'in';
		data.slds_arrowhmargin = '20';
		data.slds_arrowvmargin = '10';
		data.slds_arrowbetweenmargin = '10';
		data.slds_loop = 'loop';
		data.imgs = JSON.stringify(data.imgs);

		data.zindex = allelems__getHighestZIndex() + 1;

		data.fontsize = '14';
		data.align = 'center';
		data.fontfamily = 'Arial';
		data.fontweight = '400';
		data.lineheight = '1.55';
		data.slds_arrowalign = 'center';
		data.slds_captiontopmargin = '20';
		data.slds_captionwidth = '80';
	}

	if (!data.elem_id) data.elem_id = Date.now();

	if (!isFake) {
		if (typeof data.width == 'undefined') data.width = '10';
		if (typeof data.rotate == 'undefined') data.rotate = '0';
		if (typeof data.opacity == 'undefined') data.opacity = '1';
		if (typeof data.container == 'undefined') data.container = 'grid';
		if (typeof data.axisy == 'undefined') data.axisy = 'top';
		if (typeof data.axisx == 'undefined') data.axisx = 'left';
		if (typeof data.lock == 'undefined') data.lock = '';
		if (typeof data.invisible == 'undefined') data.invisible = '';
		if (typeof data.leftunits == 'undefined') data.leftunits = 'px';
		if (typeof data.topunits == 'undefined') data.topunits = 'px';
		if (typeof data.shadowcolor == 'undefined') data.shadowcolor = '';
		if (typeof data.classname == 'undefined') data.classname = '';
		if (typeof data.widthunits == 'undefined') data.widthunits = 'px';
		if (typeof data.heightunits == 'undefined') data.heightunits = 'px';
		if (typeof data.filewidth == 'undefined') data.filewidth = '';
		if (typeof data.fileheight == 'undefined') data.fileheight = '';
		if (typeof data.lazyoff == 'undefined') data.lazyoff = '';
		if (typeof data.layer == 'undefined') data.layer = '';
		if (typeof data.borderwidth == 'undefined') data.borderwidth = '';
		if (typeof data.borderstyle == 'undefined') data.borderstyle = '';
		if (typeof data.bordercolor == 'undefined') data.bordercolor = '';
		if (typeof data.borderradius == 'undefined') data.borderradius = '';
		if (typeof data.zoomable == 'undefined') data.zoomable = '';
		if (typeof data.align == 'undefined') data.align = 'left';
		if (typeof data.color == 'undefined') data.color = '';
		if (typeof data.fontsize == 'undefined') data.fontsize = '';
		if (typeof data.fontfamily == 'undefined') data.fontfamily = '';
		if (typeof data.fontweight == 'undefined') data.fontweight = '';
		if (typeof data.lineheight == 'undefined') data.lineheight = '';
		if (typeof data.letterspacing == 'undefined') data.letterspacing = '';
		if (typeof data.slds_stretch == 'undefined') data.slds_stretch = 'cover';
		if (typeof data.slds_imgposition == 'undefined') data.slds_imgposition = 'center center';
		if (typeof data.slds_loop == 'undefined') data.slds_loop = '';
		if (typeof data.slds_arrowcontrols == 'undefined') data.slds_arrowcontrols = '';
		if (typeof data.slds_arrowtype == 'undefined') data.slds_arrowtype = '';
		if (typeof data.slds_arrowsize == 'undefined') data.slds_arrowsize = '';
		if (typeof data.slds_arrowlinesize == 'undefined') data.slds_arrowlinesize = '1';
		if (typeof data.slds_arrowcolor == 'undefined') data.slds_arrowcolor = '';
		if (typeof data.slds_arrowcolorhover == 'undefined') data.slds_arrowcolorhover = '';
		if (typeof data.slds_arrowbgcolor == 'undefined') data.slds_arrowbgcolor = '';
		if (typeof data.slds_arrowbgcolorhover == 'undefined') data.slds_arrowbgcolorhover = '';
		if (typeof data.slds_arrowbgopacity == 'undefined') data.slds_arrowbgopacity = '';
		if (typeof data.slds_arrowbgopacityhover == 'undefined') data.slds_arrowbgopacityhover = '';
		if (typeof data.slds_dotscontrols == 'undefined') data.slds_dotscontrols = '';
		if (typeof data.slds_dotssize == 'undefined') data.slds_dotssize = '';
		if (typeof data.slds_dotsbgcolor == 'undefined') data.slds_dotsbgcolor = '';
		if (typeof data.slds_dotsbgcoloractive == 'undefined') data.slds_dotsbgcoloractive = '';
		if (typeof data.slds_dotsvmargin == 'undefined') data.slds_dotsvmargin = '';
		if (typeof data.slds_speed == 'undefined') data.slds_speed = '';
		if (typeof data.slds_autoplay == 'undefined') data.slds_autoplay = '';
		if (typeof data.slds_playiconsize == 'undefined') data.slds_playiconsize = '';
		if (typeof data.slds_playiconcolor == 'undefined') data.slds_playiconcolor = '';
		if (typeof data.slds_captiontopmargin == 'undefined') data.slds_captiontopmargin = '';
		if (typeof data.slds_captionwidth == 'undefined') data.slds_captionwidth = '';
		if (typeof data.slds_arrowhmargin == 'undefined') data.slds_arrowhmargin = '';
		if (typeof data.slds_arrowvmargin == 'undefined') data.slds_arrowvmargin = '';
		if (typeof data.slds_dotshmargin == 'undefined') data.slds_dotshmargin = '';
		if (typeof data.slds_arrowbetweenmargin == 'undefined') data.slds_arrowbetweenmargin = '';
		if (typeof data.slds_arrowalign == 'undefined') data.slds_arrowalign = '';
		if (typeof data.slds_arrowborder == 'undefined') data.slds_arrowborder = '';
		if (typeof data.imgs == 'undefined') data.imgs = '';
		if (typeof data.animstyle == 'undefined') data.animstyle = '';
		if (typeof data.animduration == 'undefined') data.animduration = '';
		if (typeof data.animdelay == 'undefined') data.animdelay = '';
		if (typeof data.animdistance == 'undefined') data.animdistance = '';
		if (typeof data.animscale == 'undefined') data.animscale = '';
		if (typeof data.animtriggeroffset == 'undefined') data.animtriggeroffset = '';
		if (typeof data.animprx == 'undefined') data.animprx = '';
		if (typeof data.animprxs == 'undefined') data.animprxs = '';
		if (typeof data.animprxdx == 'undefined') data.animprxdx = '';
		if (typeof data.animprxdy == 'undefined') data.animprxdy = '';
		if (typeof data.animfix == 'undefined') data.animfix = '';
		if (typeof data.animfixdist == 'undefined') data.animfixdist = '';
		if (typeof data.animfixtrgofst == 'undefined') data.animfixtrgofst = '';
		if (typeof data.sbstrgels == 'undefined') data.sbstrgels = '';
		if (typeof data.shadowcolor == 'undefined') data.shadowcolor = '';
		if (typeof data.shadowopacity == 'undefined') data.shadowopacity = '';
		if (typeof data.shadowblur == 'undefined') data.shadowblur = '';
		if (typeof data.shadowspread == 'undefined') data.shadowspread = '';
		if (typeof data.shadowx == 'undefined') data.shadowx = '';
		if (typeof data.shadowy == 'undefined') data.shadowy = '';
	}

	if (typeof data.fontweight !== 'undefined' && !isNaN(parseInt(data.fontweight, 10))) {
		if (parseInt(data.fontweight, 10) % 100 !== 0) {
			data.variationweight = data.fontweight;
			data.fontweight = 'variation';
		}
	}
	if (data.widthunits === '') data.widthunits = 'px';
	if (data.heightunits === '') data.heightunits = 'px';
	if (data.topunits === '') data.topunits = 'px';
	if (typeof data.sbsevent == 'undefined') data.sbsevent = '';
	if (typeof data.sbsloop == 'undefined') data.sbsloop = '';

	var elem_id = data.elem_id;
	var elem_type = data.elem_type;

	/* add wrapper */
	$('.tn-artboard').append(
		'<div class="tn-elem' +
			(isFake ? ' tn-elem__fake' : '') +
			'" id="' +
			elem_id +
			'" data-elem-id="' +
			elem_id +
			'" data-elem-type="' +
			elem_type +
			'"></div>',
	);
	var $el = $('#' + elem_id);

	/* add element html and fish content */
	$el.html('<div class="tn-atom"></div>');

	/* add data atributes */
	var fields_str =
		'groupid,classname,imgs,width,height,filewidth,fileheight,top,left,opacity,rotate,zindex,container,axisx,axisy,lock,invisible,leftunits,topunits,widthunits,heightunits,lazyoff,';
	fields_str +=
		'slds_arrowsize,slds_arrowlinesize,slds_arrowcolor,slds_arrowcolorhover,slds_arrowbgcolor,slds_arrowbgcolorhover,slds_arrowbgopacity,slds_arrowbgopacityhover,slds_dotssize,slds_dotsbgcolor,slds_dotsbgcoloractive,slds_loop,slds_speed,slds_autoplay,';
	fields_str +=
		'animstyle,animduration,animdelay,animdistance,animscale,animtriggeroffset,animprx,animprxs,animprxdy,animprxdx,animfix,animfixdist,animfixtrgofst,animmobile,sbsevent,sbstrg,sbstrgofst,sbsloop,sbsopts,align,color,fontsize,fontfamily,fontweight,variationweight,lineheight,letterspacing,lettercase,layer,';
	fields_str +=
		'slds_arrowcontrols,slds_dotscontrols,slds_stretch,slds_playiconsize,slds_playiconcolor,slds_imgposition,slds_captiontopmargin,slds_dotsvmargin,slds_captionwidth,slds_arrowhmargin,slds_dotshmargin,slds_arrowvmargin,slds_arrowbetweenmargin,slds_arrowalign,slds_arrowtype,';
	fields_str +=
		'sbstrgels,borderwidth,borderradius,bordercolor,borderstyle,shadowcolor,shadowopacity,shadowblur,shadowspread,shadowx,shadowy,zoomable,slds_arrowborder';

	var fields = fields_str.split(',');
	$el.attr('data-fields', fields_str);

	/* add events listners and reacts */
	$el.on('elementSelected', '', {elem_id: elem_id}, panelSettings__open);
	$el.on('elementSelected', '', {elem_id: elem_id}, layers__hightlight);
	$el.on('elementUnselected', '', {elem_id: elem_id}, layers__hightlight);

	/* set field values */
	addElem__setFieldValues($el, fields, data);

	/* render elem view */
	elem__renderView($el);
	elem__addUiClickEvents__gallery($el);
	$el.find('.ui-resizable-handle').css('display', '');

	/* fix on safari resize handle */
	$el.append('<div class="ui-pseudo-handle-fix-e"></div>');
	$el.append('<div class="ui-pseudo-handle-fix-w"></div>');

	if (elem__getFieldValue($el, 'lock') == 'y') {
		$el.draggable('disable');
	}
	if (elem__getFieldValue($el, 'invisible') == 'y') {
		$el.addClass('tn-elem__invisible');
	}

	return $el;
}

function addVector(data, isFake) {
	tn_console('func: addVector');

	/* if it hasn't initial values */
	if (typeof data !== 'object') {
		data = {
			elem_id: Date.now(),
			elem_type: 'vector',
		};

		var wndframe = $(document.documentElement);
		var $canvasMax = $('.tn-canvas-max');

		if (wndframe.scrollTop() > $canvasMax.offset().top) {
			data.top = wndframe.scrollTop() - $canvasMax.offset().top + 80;
			if (data.top > parseInt($canvasMax.height())) {
				data.top = 20;
				wndframe.animate({scrollTop: $('.tn-canvas-min').offset().top - 90}, 200);
			}
		} else {
			data.top = '20';
		}

		data.left = '20';
		data.width = '157';

		data.vectorjson =
			'{"p":[{"a":{"f":"transparent","fo":1,"s":"#000000","so":"1.00","w":"1"},"c":true,"z":0,"p":[{"c":[901.0392,562.6858],"h":[{"c":[901.0392,562.6858],"m":"default"},{"c":[899.9649,522.5183],"m":"default"}],"b":true,"t":"M"},{"c":[948.6667,501],"h":[{"c":[921.0929,501],"m":"default"},{"c":[965.4975,501],"m":"default"}],"b":true,"t":"C"},{"c":[1005.605,519.2906],"h":[{"c":[978.3891,506.3796],"m":"default"},{"c":[1025.659,528.9738],"m":"default"}],"b":true,"t":"C"},{"c":[1055.381,535.3714],"h":[{"c":[1040.341,535.3714],"m":"default"},{"c":[1069.705,535.3714],"m":"default"}],"b":true,"t":"C"},{"c":[1076.867,501.078],"h":[{"c":[1076.509,522.9549],"m":"default"},{"c":[1100.86,501.078],"m":"default"}],"b":true,"t":"C"},{"c":[1100.86,501.078],"h":[{"c":[1100.86,501.078],"m":"mirrorAngle"},{"c":[1103.009,545.9078],"m":"mirrorAngle"}],"b":true,"t":"C"},{"c":[1055.023,562.6279],"h":[{"c":[1080.09,562.6279],"m":"default"},{"c":[1038.908,562.6279],"m":"default"}],"b":true,"t":"C"},{"c":[997.0105,545.8298],"h":[{"c":[1024.584,558.7408],"m":"default"},{"c":[978.0311,536.5052],"m":"default"}],"b":true,"t":"C"},{"c":[949.0248,528.2565],"h":[{"c":[963.3489,528.2565],"m":"default"},{"c":[934.7007,528.2565],"m":"default"}],"b":true,"t":"C"},{"c":[925.3901,562.6858],"h":[{"c":[925.7482,538.2984],"m":"default"},{"c":[901.0392,562.6858],"m":"default"}],"b":true,"t":"C"},{"c":[901.0392,562.6858],"h":[{"c":[901.0392,562.6858],"m":"mirrorAngle"},{"c":[901.0392,562.6858],"m":"mirrorAngle"}],"b":false,"t":"C"}]}],"b":{"x":900,"y":500,"w":202,"h":63.685791015625}}';
		data.vectorsvg =
			'<svg viewBox="900 500 202 63.685791015625"><path fill="transparent" fill-opacity="1" stroke="#000000" stroke-opacity="1.00" stroke-width="1" id="tSvg47" d="M 901.0392 562.6858 C 899.9649 522.5183 921.0929 501 948.6667 501 C 965.4975 501 978.3891 506.3796 1005.605 519.2906 C 1025.659 528.9738 1040.341 535.3714 1055.381 535.3714 C 1069.705 535.3714 1076.509 522.9549 1076.867 501.078 C 1100.86 501.078 1100.86 501.078 1100.86 501.078 C 1103.009 545.9078 1080.09 562.6279 1055.023 562.6279 C 1038.908 562.6279 1024.584 558.7408 997.0105 545.8298 C 978.0311 536.5052000000001 963.3489 528.2565 949.0248 528.2565 C 934.7007 528.2565 925.7482 538.2984 925.3901 562.6858 C 901.0392 562.6858 901.0392 562.6858 901.0392 562.6858"></path></svg>';
		data.zindex = allelems__getHighestZIndex() + 1;
		var parsedVectorJSON = JSON.parse(data.vectorjson);
		data.filewidth = parsedVectorJSON.b ? parsedVectorJSON.b.w || 0 : 0;
		data.fileheight = parsedVectorJSON.b ? parsedVectorJSON.b.h || 0 : 0;
	}

	if (!data.elem_id) data.elem_id = Date.now();

	if (!isFake) {
		if (typeof data.vectorjson == 'undefined') data.vectorjson = '';
		if (typeof data.container == 'undefined') data.container = 'grid';
		if (typeof data.axisy == 'undefined') data.axisy = 'top';
		if (typeof data.axisx == 'undefined') data.axisx = 'left';
		if (typeof data.lock == 'undefined') data.lock = '';
		if (typeof data.invisible == 'undefined') data.invisible = '';
		if (typeof data.leftunits == 'undefined') data.leftunits = 'px';
		if (typeof data.topunits == 'undefined') data.topunits = 'px';
		if (typeof data.classname == 'undefined') data.classname = '';
		if (typeof data.widthunits == 'undefined') data.widthunits = 'px';
		if (typeof data.layer == 'undefined') data.layer = '';
		if (typeof data.animstyle == 'undefined') data.animstyle = '';
		if (typeof data.animduration == 'undefined') data.animduration = '';
		if (typeof data.animdelay == 'undefined') data.animdelay = '';
		if (typeof data.animdistance == 'undefined') data.animdistance = '';
		if (typeof data.animscale == 'undefined') data.animscale = '';
		if (typeof data.animtriggeroffset == 'undefined') data.animtriggeroffset = '';
		if (typeof data.animprx == 'undefined') data.animprx = '';
		if (typeof data.animprxs == 'undefined') data.animprxs = '';
		if (typeof data.animprxdx == 'undefined') data.animprxdx = '';
		if (typeof data.animprxdy == 'undefined') data.animprxdy = '';
		if (typeof data.animfix == 'undefined') data.animfix = '';
		if (typeof data.animfixdist == 'undefined') data.animfixdist = '';
		if (typeof data.animfixtrgofst == 'undefined') data.animfixtrgofst = '';
		if (typeof data.effects == 'undefined') data.effects = '';
		if (typeof data.rotate == 'undefined') data.rotate = '0';
		if (typeof data.opacity == 'undefined') data.opacity = '1';
		if (typeof data.filewidth == 'undefined') data.filewidth = '';
		if (typeof data.fileheight == 'undefined') data.fileheight = '';
		if (typeof data.vectorsvg == 'undefined') data.vectorsvg = '';
	}

	if (data.widthunits === '') data.widthunits = 'px';
	if (data.topunits === '') data.topunits = 'px';
	if (typeof data.sbsevent == 'undefined') data.sbsevent = '';
	if (typeof data.sbsloop == 'undefined') data.sbsloop = '';

	var elem_id = data.elem_id;
	var elem_type = data.elem_type;

	/* add wrapper */
	$('.tn-artboard').append(
		'<div class="tn-elem' +
			(isFake ? ' tn-elem__fake' : '') +
			'" id="' +
			elem_id +
			'" data-elem-id="' +
			elem_id +
			'" data-elem-type="' +
			elem_type +
			'"></div>',
	);
	var $el = $('#' + elem_id);

	/* add element html and fish content */
	$el.html('<div class="tn-atom">' + data.vectorsvg + '</div>');

	/* add data attributes */
	var dataFields = [
		'vectorjson',
		'groupid',
		'classname',
		'width',
		'top',
		'left',
		'opacity',
		'rotate',
		'zindex',
		'container',
		'axisx',
		'axisy',
		'animduration',
		'animdelay',
		'animdistance',
		'animscale',
		'animtriggeroffset',
		'animprx',
		'animprxs',
		'animprxdy',
		'animprxdx',
		'animfix',
		'animfixdist',
		'animfixtrgofst',
		'animmobile',
		'lock',
		'invisible',
		'leftunits',
		'topunits',
		'widthunits',
		'animstyle',
		'sbsevent',
		'sbstrg',
		'sbstrgofst',
		'sbsloop',
		'sbsopts',
		'sbstrgels',
		'layer',
		'effects',
		'filewidth',
		'fileheight',
	];
	$el.attr('data-fields', dataFields.join(','));

	/* add ui edit clicks */
	elem__addUiClickEvents__vector($el);

	/* add events listners and reacts */
	$el.on('elementSelected', '', {elem_id: elem_id}, panelSettings__open);
	$el.on('elementSelected', '', {elem_id: elem_id}, layers__hightlight);
	$el.on('elementUnselected', '', {elem_id: elem_id}, layers__hightlight);

	/* set field values */
	addElem__setFieldValues($el, dataFields, data);

	/* render elem view */
	elem__renderView($el);

	/* fix on safari resize handle */
	$el.append('<div class="ui-pseudo-handle-fix-e"></div>');
	$el.append('<div class="ui-pseudo-handle-fix-w"></div>');

	if (elem__getFieldValue($el, 'lock') == 'y') {
		$el.draggable('disable');
	}
	if (elem__getFieldValue($el, 'invisible') == 'y') {
		$el.addClass('tn-elem__invisible');
	}

	return $el;
}

function get__Rendom__Text() {
	var arr = [
		'Creativity is to discover a question that has never been asked. If one brings up an idiosyncratic question, the answer he gives will necessarily be unique as well.',
		'There is no design without discipline. There is no discipline without intelligence.',
		'Everything should be made as simple as possible, but not simpler.',
		'The work you do while you procrastinate is probably the work you should be doing for the rest of your life.',
		'Curiosity about life in all its aspects, I think, is still the secret of great creative people.',
		'Good design is obvious. Great design is transparent.',
		'Design creates culture. Culture shapes values. Values determine the future.',
		'The best ideas come as jokes. Make your thinking as funny as possible.',
	];

	var i = getRandomizer(0, 7);
	return arr[i];
}
