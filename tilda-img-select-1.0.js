function t_input_imgselect_updateval(recid,lid) {
  var qel=$('#rec'+recid).find('[data-input-lid="'+lid+'"]');
  var val="";
  qel.find('.t-img-select:checked').each(function(){
    if(val!=""){val+="; ";}
    val += $(this).val();
  });
  qel.find('.t-img-select__hiddeninput').val(val);
}

function t_input_imgselect_init(recid,lid) {
  var qel=$('#rec'+recid).find('[data-input-lid="'+lid+'"]');
  qel.find('.t-img-select__control').click(function() {
    t_input_imgselect_updateval(recid,lid);
  });
  t_input_imgselect_updateval(recid,lid);
}

function t_input_imgselect_invertColor(recid) {
    var imgSelectCont = $('#rec'+recid+' .t-img-select__container');
    var hex = imgSelectCont.attr('data-check-bgcolor');

    if (typeof hex === 'undefined') {
        return;
    }

    var bw = true;

    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }

    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        var resHex = 'ffffff';
    } else {
      var r = parseInt(hex.slice(0, 2), 16),
          g = parseInt(hex.slice(2, 4), 16),
          b = parseInt(hex.slice(4, 6), 16);
      var resHex = (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '000000' : 'FFFFFF';
    }

	if ($('#recid'+recid+'-img-select-indicator').length === 0) {
		imgSelectCont.after('<style id="recid'+recid+'-img-select-indicator">\n#rec'+recid+' .t-img-select__indicator:after {\nbackground-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 76.887 55.552\'%3E%3Cpath fill=\'%23'+resHex+'\' d=\'M34.373 49.541L76.887 5.889 70.739 0 28.426 43.458 6.078 20.632 0 26.585l22.488 22.972 6.029 5.995-.091-.085.091.085 5.856-6.011z\'/%3E%3C/svg%3E");\n}\n</style>');
	}
}
