/**
 * Скрипт сбрасывает все стандартные обрабочики формы и полей ввода и добавляет собственные слушатели и обработчкики. 
 * Для всех полей форм устанавливается валидация в соответствии с типом поля.
 * 
 * Все обработчики работают через делегирование и вещаются на rec блок. Такая особенность необходима для сохранения
 * пользовательского ввода в случае ре-рендеринга формы при таких событиях как, например, resize или orientationchange.
 * 
 * Скрипт содержит словарь с переводами сообщений об ошибках или успехе на русском и английских языках. По необходимости
 * загружается словарь с другими языками.
 * 
 * При отправке формы, проверяется валидность введённых данных. По необходимости вызывается проверка Google Captha.
 * 
 * После отправки формы срабатывают кастомные события, например "tildaforms:aftersuccess", которые триггерят
 * пользовательские функции, если такие есть. В скрипте также формируются данные для пользовательских функций.
 * 
 * После отправки формы триггерятся кастомные события для вызова пользовательских функций.
 * 
 * Скрипт отвечает за платёжные системы cloudpayments, stripe, wayforpay, banktransfer и универсальную платёжную систему.
 */

 window.t_forms__lang = (window.navigator.userLanguage || window.navigator.language).toUpperCase().slice(0, 2);

 window.scriptSysPayment = {};
 window.handlerSysPayment = {};
 window.isInitEventsZB = {};
 window.isInitEventsCustomMask = {};
 window.initForms = {};
 
 window.tildaForm = {
	 versionLib: '02.001',
	 endpoint: 'forms.tildacdn.com',
	 isRecaptchaScriptInit: false,
	 currentFormProccessing: false,
 };
 
 function t_forms__onReady(func) {
	 if (document.readyState !== 'loading') {
			 func();
	 } else {
			 document.addEventListener('DOMContentLoaded', func);
	 }
 }
 
 /**
  * Run the main script and determine whether to load
  * payment systems and additional languages 
  */
 t_forms__onReady(function() {
	 var allrecords = document.getElementById('allrecords');
	 if (allrecords) {
			 var projectLang = allrecords.getAttribute('data-tilda-project-lang');
			 if (projectLang) {
				 window.t_forms__lang = projectLang;
			 }
	 }
 
		 t_forms__initForms();
 
		 var isST100 = !!document.querySelector('.t706');
		 var isST105 = !!document.querySelector('.js-payment-systembox');
		 if (isST100 || isST105) {
			 var fileName = 'tilda-forms-payments-1.0';
 
			 if (!document.head.querySelector('script[src*="' + fileName + '"]')) {
				 var script = document.createElement('script');
				 script.type = 'text/javascript';
				 script.src = 'http://127.0.0.1:8080/' + fileName + '.js';
 
				 script.onerror = function () {
					 console.error('Failed to load tilda-forms-payments: ', this.src);
				 }
 
				 document.head.appendChild(script);
			 }
		 }
 
		 var lang = window.t_forms__lang;
		 if (lang !== 'RU' && lang !== 'EN') {
			 var fileName = 'tilda-forms-dict-1.0';
	 
			 if (!document.head.querySelector('script[src*="' + fileName + '"]')) {
				 var script = document.createElement('script');
				 script.type = 'text/javascript';
				 script.src = 'http://127.0.0.1:8080/' + fileName + '.js';
 
				 script.onerror = function () {
					 console.error('Failed to load tilda-forms-dictionary: ', this.src);
				 }
 
				 document.head.appendChild(script);
			 }
		 }
 });
 
 /**
  * ALL GLOBAL FUNTIONS EXPRESSION ARE DECLARED AT THE BEGINNING OF THE SCRIPT BECAUSE
  * THEY ARE CALLED LATER IN THE CODE AND OTHERS SCRIPTS (tilda-cart, tilda-zero-forms). 
  * IF YOU TRY TO CALL SUCH A FUNCTION BEFORE ITS DECLARATION, AN ERROR WILL OCCUR.
  * TO START READING THE SCRIPT SCROLL TO t_forms__initForms FUNCTION
  */
 
 /* eslint-disable */
 window.tildaForm.captchaCallback = function () {
	 if (!window.tildaForm.currentFormProccessing || !window.tildaForm.currentFormProccessing.form) {
		 return false;
	 }
 
	 window.tildaForm.send(
		 window.tildaForm.currentFormProccessing.form,
		 window.tildaForm.currentFormProccessing.btn,
		 window.tildaForm.currentFormProccessing.formtype,
		 window.tildaForm.currentFormProccessing.formskey
	 );
 
	 window.tildaForm.currentFormProccessing = false;
 };
 
 /* Load script custom mask */
 window.tildaForm_customMasksLoad = function() {
	 if (window.isInitEventsCustomMask === true) return;
	 var script = document.createElement('script');
	 script.type = 'text/javascript';
	 script.src = 'https://static.tildacdn.com/js/tilda-forms-custommask-1.0.beta.min.js';
	 document.head.appendChild(script);
	 window.isInitEventsCustomMask = true;
 };
 
 /* Init custom mask */
 window.tildaForm_initMasks = function() {
	 var inputsCustomMask = document.querySelectorAll('.js-tilda-mask');
	 if (inputsCustomMask.length && window.isInitEventsCustomMask !== true) {
		 window.tildaForm_customMasksLoad();
		 window.setTimeout(function() {
			 window.tildaForm_initMasks();
		 }, 100);
		 return;
	 }
 
	 if (window.isInitEventsCustomMask !== true) return;
	 Array.prototype.forEach.call(inputsCustomMask, function (input) {
		 t_asyncLoad(input);
	 });
 };
 
 window.tildaForm_initMasks();
 
 /**
  * Init validate input in form
  * @param {Node} form - block form
  * @returns {Object} - validation input args
  */
 window.tildaForm.validate = function(form) {
	 if (!(form instanceof Element)) form = form[0];
 
	 var inputs = form.querySelectorAll('.js-tilda-rule');
	 var arrError = [];
	 var isEmptyValue = true;
 
	 for (var i = 0; i < inputs.length; i++) {
		 var input = inputs[i];
		 var isReq = !!parseInt(input.getAttribute('data-tilda-req') || 0, 10);
		 var dataRule = input.getAttribute('data-tilda-rule') || 'none';
		 var regExp = '';
		 var strValue = '';
		 var minLength = input.getAttribute('data-tilda-rule-minlength') || 0;
		 var maxLength = input.getAttribute('data-tilda-rule-maxlength') || 0;
		 var objError = {};
		 var value = input.value;
		 var valueNoSpace = '';
		 var inputType = input.getAttribute('type');
		 var inputName = input.getAttribute('name');
		 var dataFormCart = form.getAttribute('data-formcart');
 
		 objError.obj = input;
		 objError.type = [];
 
		 if (value && value.length) {
			 /* eslint no-control-regex: */
			 valueNoSpace = value.replace(/[\s\u0000—\u001F\u2000-\u200F\uFEFF\u2028-\u202F\u205F-\u206F]/gi, '');
			 value = value.trim();
		 }
 
		 if (value.length > 0) {
			 isEmptyValue = false;
		 }
 
		 if (minLength) {
			 minLength = parseInt(minLength, 10);
		 }
 
		 if (maxLength) {
			 maxLength = parseInt(maxLength, 10);
		 }
 
		 var isEmpty = (!value.length && !valueNoSpace.length);
		 var isCheckBoxOrRadio = (inputType === 'checkbox' || inputType === 'radio');
		 var isChecked = !form.querySelectorAll('[name="' + inputName + '"]:checked').length;
 
		 if (isReq && (isEmpty || (isCheckBoxOrRadio && isChecked))) {
			 objError.type.push('req');
		 } else {
			 switch (dataRule) {
				 case 'email':
					 regExp = /^(?!\.)(?!.*\.\.)[a-zA-Zёа-яЁА-Я0-9\u2E80-\u2FD5\u3190-\u319f\u3400-\u4DBF\u4E00-\u9FCC\uF900-\uFAAD_\.\-\+]{0,63}[a-zA-Zёа-яЁА-Я0-9\u2E80-\u2FD5\u3190-\u319f\u3400-\u4DBF\u4E00-\u9FCC\uF900-\uFAAD_\-\+]@[a-zA-Zёа-яЁА-ЯЁёäöüÄÖÜßèéû0-9][a-zA-Zёа-яЁА-ЯЁёäöüÄÖÜßèéû0-9\.\-]{0,253}\.[a-zA-Zёа-яЁА-Я]{2,10}$/gi;
					 if (value.length && !value.match(regExp)) {
						 objError.type.push('email');
					 }
					 break;
 
				 case 'url':
					 regExp = /^((https?|ftp):\/\/)?[a-zA-Zёа-яЁА-ЯЁёäöüÄÖÜßèéûşç0-9][a-zA-Zёа-яЁА-ЯЁёäöüÄÖÜßèéûşç0-9_\.\-]{0,253}\.[a-zA-Zёа-яЁА-Я]{2,10}\/?$/gi;
					 if (value.length) {
						 strValue = value.split('//');
						 if (strValue && strValue.length > 1) {
							 strValue = strValue[1];
						 } else {
							 strValue = strValue[0];
						 }
						 strValue = strValue.split('/');
						 if (strValue && strValue.length && strValue[0]) {
							 strValue = strValue[0];
							 if (!strValue.match(regExp)) {
								 objError.type.push('url');
							 }
						 } else {
							 if (!strValue || strValue[0]) {
								 objError.type.push('url');
							 }
							 strValue = '';
						 }
					 }
					 break;
 
				 case 'phone':
					 var phoneMask = input.getAttribute('data-tilda-mask');
					 var strRegExp = '\^[0-9()+-';
					 if (phoneMask) {
						 if (phoneMask.indexOf('*') !== -1) {
							 strRegExp += 'a-zёа-я';
						 } else {
							 if (phoneMask.indexOf('a') !== -1) strRegExp += 'a-z';
							 if (phoneMask.indexOf('а') !== -1) strRegExp += 'а-яё';
						 }
					 }
					 strRegExp += ']\+\$';
 
					 regExp = new RegExp(strRegExp, 'gi');
 
					 if (valueNoSpace.length && !valueNoSpace.match(regExp)) {
						 objError.type.push('phone');
					 } else {
						 strValue = valueNoSpace.replace(/[^0-9]+/g, '');
						 if (
							 strValue.indexOf('000') == 1 ||
							 strValue.indexOf('111') == 1 ||
							 (strValue.indexOf('222') == 1 && strValue.substring(0, 1) != '5') ||
							 strValue.indexOf('333') == 1 ||
							 strValue.indexOf('444') == 1 ||
							 (strValue.indexOf('555') == 1 && strValue.substring(0, 1) != '0') ||
							 (strValue.indexOf('666') == 1 && strValue.substring(0, 1) != '0') ||
							 (strValue.indexOf('8888') == 1 && strValue.substring(0, 1) != '4')
						 ) {
							 objError.type.push('phone');
						 }
					 }
					 break;
 
				 case 'number':
					 regExp = /^[0-9]+$/gi;
					 if (valueNoSpace.length > 0 && !valueNoSpace.match(regExp)) {
						 objError.type.push('number');
					 }
					 break;
 
				 case 'date':
					 /* eslint no-useless-escape: */
					 var format = {
						 'DD-MM-YYYY': /^(0[1-9]|1[0-9]|2[0-9]|3[01])[\-\.\/](0[1-9]|1[012])[\-\.\/][0-9]{4}$/,
						 'MM-DD-YYYY': /^(0[1-9]|1[012])[\-\.\/](0[1-9]|1[0-9]|2[0-9]|3[01])[\-\.\/][0-9]{4}$/,
						 'YYYY-MM-DD': /^[0-9]{4}[\-\.\/](0[1-9]|1[012])[\-\.\/](0[1-9]|1[0-9]|2[0-9]|3[01])$/,
					 };
					 if (valueNoSpace.length > 0 && !valueNoSpace.match(format[input.getAttribute('data-tilda-dateformat')] || /^[0-9]{1,4}[\-\.\/][0-9]{1,2}[\-\.\/][0-9]{1,4}$/gi)) {
						 objError.type.push('date');
					 }
					 break;
 
				 case 'time':
					 regExp = /^[0-9]{2}[:\.][0-9]{2}$/gi;
					 if (valueNoSpace.length > 0 && !valueNoSpace.match(regExp)) {
						 objError.type.push('time');
					 }
					 break;
 
				 case 'name':
					 regExp = /^([ЁёäöüÄÖÜßèéûҐґЄєІіЇїӐӑЙйК̆к̆Ӄ̆ӄ̆Ԛ̆ԛ̆Г̆г̆Ҕ̆ҕ̆ӖӗѢ̆ѣ̆ӁӂꚄ̆ꚅ̆ҊҋО̆о̆Ө̆ө̆Ꚍ̆ꚍ̆ЎўХ̆х̆Џ̆џ̆Ꚏ̆ꚏ̆Ꚇ̆ꚇ̆Ҽ̆ҽ̆Ш̆ш̆Ꚗ̆ꚗ̆Щ̆щ̆Ы̆ы̆Э̆э̆Ю̆ю̆Я̆я̆А́а́ЃѓД́д́Е́е́Ё́ёӘ́ә́З́з́И́и́І́і́Ї́ї́ЌќЛ́л́Н́н́О́о́Р́р́С́с́Т́т́У́у́Ӱ́ӱ́Ү́ү́Х́х́Ц́ц́Ы́ы́Э́э́Ӭ́ӭ́Ю́ю́Ю̈́ю̈́Я́я́Ѣ́ѣ́ҒғӺӻҒ̌ғ̌Ј̵ј̵ҞҟҜҝԞԟӨөҎҏҰұӾӿҸҹҌҍҢңҚқҒғӘәҺһІіҰұҮүӨөȺⱥꜺꜻƂƃɃƀȻȼꞒꞓƋƌĐđɆɇǤǥꞠꞡĦħƗɨƗ́ɨ́Ɨ̀ɨ̀Ɨ̂ɨ̂Ɨ̌ɨ̌Ɨ̃ɨ̃Ɨ̄ɨ̄Ɨ̈ɨ̈Ɨ̋ɨ̋Ɨ̏ɨ̏Ɨ̧ɨ̧Ɨ̧̀ɨ̧̀Ɨ̧̂ɨ̧̂Ɨ̧̌ɨ̧̌ᵼɈɉɟɟ̟ʄʄ̊ʄ̥K̵k̵ꝀꝁꝂꝃꝄꝅꞢꞣŁłł̓Ł̣ł̣ᴌȽƚⱠⱡꝈꝉƛƛ̓ꞤꞥꝊꝋØøǾǿØ̀ø̀Ø̂øØ̌ø̌Ø̄ø̄Ø̃ø̃Ø̨ø̨Ø᷎ø᷎ᴓⱣᵽꝐꝑꝖꝗꝘꝙɌɍꞦꞧꞨꞩẜẝŦŧȾⱦᵺꝤꝥꝦꝧɄʉɄ́ʉ́Ʉ̀ʉ̀Ʉ̂ʉ̂Ʉ̌ʉ̌Ʉ̄ʉ̄Ʉ̃ʉ̃Ʉ̃́ʉ̃́Ʉ̈ʉ̈ʉ̞ᵾU̸u̸ᵿꝞꝟw̸ɎɏƵƶA-Za-z\u00C0\u00C0-\u00C3\u00C8-\u00CA\u00CC\u00CD\u00D2-\u00D9\u00DA\u00DD\u00E0-\u00E3\u00E8\u00E9\u00EA\u00EC\u00ED\u00F2-\u00F5\u00F9\u00FA\u00FD\u0102\u0103\u0110\u0111\u0128\u0129\u0168\u0169\u01A0\u01A1\u01AF\u01B0\u1EA0\u1EA1-\u1EF9\u0027\u2019\u0300-\u03FF\u0400-\u04FF\u0500-\u05FF\u0600-\u06FF\u3040-\u30FF\u0041-\u007A\u00C0-\u02B8\uFB1D-\uFB1F\uFB2A-\uFB4E\u0E00-\u0E7F\u10A0-\u10FF\u3040-\u309F\u30A0-\u30FF\u2E80-\u2FD5\u3190-\u319f\u3400-\u4DBF\u4E00-\u9FCC\uF900-\uFAAD]{1,})([ЁёäöüÄÖÜßèéûҐґЄєІіЇїӐӑЙйК̆к̆Ӄ̆ӄ̆Ԛ̆ԛ̆Г̆г̆Ҕ̆ҕ̆ӖӗѢ̆ѣ̆ӁӂꚄ̆ꚅ̆ҊҋО̆о̆Ө̆ө̆Ꚍ̆ꚍ̆ЎўХ̆х̆Џ̆џ̆Ꚏ̆ꚏ̆Ꚇ̆ꚇ̆Ҽ̆ҽ̆Ш̆ш̆Ꚗ̆ꚗ̆Щ̆щ̆Ы̆ы̆Э̆э̆Ю̆ю̆Я̆я̆А́а́ЃѓД́д́Е́е́Ё́ёӘ́ә́З́з́И́и́І́і́Ї́ї́ЌќЛ́л́Н́н́О́о́Р́р́С́с́Т́т́У́у́Ӱ́ӱ́Ү́ү́Х́х́Ц́ц́Ы́ы́Э́э́Ӭ́ӭ́Ю́ю́Ю̈́ю̈́Я́я́Ѣ́ѣ́ҒғӺӻҒ̌ғ̌Ј̵ј̵ҞҟҜҝԞԟӨөҎҏҰұӾӿҸҹҌҍҢңҚқҒғӘәҺһІіҰұҮүӨөȺⱥꜺꜻƂƃɃƀȻȼꞒꞓƋƌĐđɆɇǤǥꞠꞡĦħƗɨƗ́ɨ́Ɨ̀ɨ̀Ɨ̂ɨ̂Ɨ̌ɨ̌Ɨ̃ɨ̃Ɨ̄ɨ̄Ɨ̈ɨ̈Ɨ̋ɨ̋Ɨ̏ɨ̏Ɨ̧ɨ̧Ɨ̧̀ɨ̧̀Ɨ̧̂ɨ̧̂Ɨ̧̌ɨ̧̌ᵼɈɉɟɟ̟ʄʄ̊ʄ̥K̵k̵ꝀꝁꝂꝃꝄꝅꞢꞣŁłł̓Ł̣ł̣ᴌȽƚⱠⱡꝈꝉƛƛ̓ꞤꞥꝊꝋØøǾǿØ̀ø̀Ø̂øØ̌ø̌Ø̄ø̄Ø̃ø̃Ø̨ø̨Ø᷎ø᷎ᴓⱣᵽꝐꝑꝖꝗꝘꝙɌɍꞦꞧꞨꞩẜẝŦŧȾⱦᵺꝤꝥꝦꝧɄʉɄ́ʉ́Ʉ̀ʉ̀Ʉ̂ʉ̂Ʉ̌ʉ̌Ʉ̄ʉ̄Ʉ̃ʉ̃Ʉ̃́ʉ̃́Ʉ̈ʉ̈ʉ̞ᵾU̸u̸ᵿꝞꝟw̸ɎɏƵƶA-Za-z\u00C0\u00C0-\u00C3\u00C8-\u00CA\u00CC\u00CD\u00D2-\u00D9\u00DA\u00DD\u00E0-\u00E3\u00E8\u00E9\u00EA\u00EC\u00ED\u00F2-\u00F5\u00F9\u00FA\u00FD\u0102\u0103\u0110\u0111\u0128\u0129\u0168\u0169\u01A0\u01A1\u01AF\u01B0\u1EA0\u1EA1-\u1EF9\u0041-\u007A\u00C0-\u02B8\u0300-\u03FF\u0400-\u04FF\u0500-\u05FF\u0600-\u06FF\u3040-\u30FF\uFB1D-\uFB1F\uFB2A-\uFB4E\u0E00-\u0E7F\u10A0-\u10FF\u3040-\u309F\u30A0-\u30FF\u2E80-\u2FD5\u3190-\u319f\u3400-\u4DBF\u4E00-\u9FCC\uF900-\uFAAD\-\'\‘\s\.]{0,})$/gi;
					 if (value.length && !value.match(regExp)) {
						 objError.type.push('name');
					 }
					 break;
 
				 case 'nameeng':
					 regExp = /^([A-Za-z\s]{1,}((\-)?[A-Za-z\.\s](\')?){0,})*$/i;
					 if (value.length && !value.match(regExp)) {
						 objError.type.push('nameeng');
					 }
					 break;
 
				 case 'namerus':
					 regExp = /^([А-Яа-яЁё\s]{1,}((\-)?[А-Яа-яЁё\.\s](\')?){0,})*$/i;
					 if (value.length && !value.match(regExp)) {
						 objError.type.push('namerus');
					 }
					 break;
 
				 case 'string':
					 /* eslint no-misleading-character-class: */
					 regExp = /^[A-Za-zА-Яа-я0-9ЁёЁёäöüÄÖÜßèéûӐӑЙйК̆к̆Ӄ̆ӄ̆Ԛ̆ԛ̆Г̆г̆Ҕ̆ҕ̆ӖӗѢ̆ѣ̆ӁӂꚄ̆ꚅ̆ҊҋО̆о̆Ө̆ө̆Ꚍ̆ꚍ̆ЎўХ̆х̆Џ̆џ̆Ꚏ̆ꚏ̆Ꚇ̆ꚇ̆Ҽ̆ҽ̆Ш̆ш̆Ꚗ̆ꚗ̆Щ̆щ̆Ы̆ы̆Э̆э̆Ю̆ю̆Я̆я̆А́а́ЃѓД́д́Е́е́Ё́ёӘ́ә́З́з́И́и́І́і́Ї́ї́ЌќЛ́л́Н́н́О́о́Р́р́С́с́Т́т́У́у́Ӱ́ӱ́Ү́ү́Х́х́Ц́ц́Ы́ы́Э́э́Ӭ́ӭ́Ю́ю́Ю̈́ю̈́Я́я́Ѣ́ѣ́ҒғӺӻҒ̌ғ̌Ј̵ј̵ҞҟҜҝԞԟӨөҎҏҰұӾӿҸҹҌҍҢңҚқҒғӘәҺһІіҰұҮүӨөȺⱥꜺꜻƂƃɃƀȻȼꞒꞓƋƌĐđɆɇǤǥꞠꞡĦħƗɨƗ́ɨ́Ɨ̀ɨ̀Ɨ̂ɨ̂Ɨ̌ɨ̌Ɨ̃ɨ̃Ɨ̄ɨ̄Ɨ̈ɨ̈Ɨ̋ɨ̋Ɨ̏ɨ̏Ɨ̧ɨ̧Ɨ̧̀ɨ̧̀Ɨ̧̂ɨ̧̂Ɨ̧̌ɨ̧̌ᵼɈɉɟɟ̟ʄʄ̊ʄ̥K̵k̵ꝀꝁꝂꝃꝄꝅꞢꞣŁłł̓Ł̣ł̣ᴌȽƚⱠⱡꝈꝉƛƛ̓ꞤꞥꝊꝋØøǾǿØ̀ø̀Ø̂øØ̌ø̌Ø̄ø̄Ø̃ø̃Ø̨ø̨Ø᷎ø᷎ᴓⱣᵽꝐꝑꝖꝗꝘꝙɌɍꞦꞧꞨꞩẜẝŦŧȾⱦᵺꝤꝥꝦꝧɄʉɄ́ʉ́Ʉ̀ʉ̀Ʉ̂ʉ̂Ʉ̌ʉ̌Ʉ̄ʉ̄Ʉ̃ʉ̃Ʉ̃́ʉ̃́Ʉ̈ʉ̈ʉ̞ᵾU̸u̸ᵿꝞꝟw̸ɎɏƵƶ\u0041-\u007A\u00C0-\u02B8\u0300-\u03FF\u0400-\u04FF\u0500-\u05FF\u0600-\u06FF\u3040-\u30FF\uFB1D-\uFB1F\uFB2A-\uFB4E\u0E00-\u0E7F\u10A0-\u10FF\u3040-\u309F\u30A0-\u30FF\u2E80-\u2FD5\u3190-\u319f\u3400-\u4DBF\u4E00-\u9FCC\uF900-\uFAAD,\.:;\"\'\`\-\_\+\?\!\%\$\@\*\&\^\s]$/i;
					 if (value.length && !value.match(regExp)) {
						 objError.type.push('string');
					 }
					 break;
 
				 case 'chosevalue':
					 var isOptionSelected = input.getAttribute('data-option-selected') === 'true';
					 if (!isOptionSelected) {
						 objError.type.push('chosevalue');
					 }
					 break;
 
				 case 'promocode':
					 if (dataFormCart === 'y' && valueNoSpace.length && window.tcart && (!window.tcart.promocode || !window.tcart.prodamount_discountsum)) {
						 objError.type.push('promocode');
					 }
					 break;
 
				 case 'deliveryreq':
					 objError.type.push('deliveryreq');
					 break;
 
				 default:
					 break;
			 }
 
			 if (minLength > 0 && value.length && value.length < minLength) {
				 objError.type.push('minlength');
			 }
 
			 if (maxLength > 0 && value.length && value.length > maxLength) {
				 objError.type.push('maxlength');
			 }
		 }
 
		 if (objError.type && objError.type.length) {
			 arrError[arrError.length] = objError;
		 }
	 }
 
	 /* validation in cart for minimum order cost and minimum items quantity */
	 if (dataFormCart === 'y') {
		 var isMinOrderSetted = typeof window.tcart_minorder !== 'undefined' && window.tcart_minorder > 0;
		 var isMinQuantitySetted = typeof window.tcart_mincntorder !== 'undefined' && window.tcart_mincntorder > 0;
 
		 if (isMinOrderSetted) {
			 if (window.tcart.prodamount < window.tcart_minorder) {
				 var objError = {};
 
				 objError.obj = {};
				 objError.type = [];
				 objError.type.push('minorder');
				 arrError.push(objError);
			 }
		 }
 
		 if (isMinQuantitySetted && window.tcart.total < window.tcart_mincntorder) {
			 var objError = {};
			 objError.obj = {};
			 objError.type = [];
			 objError.type.push('minquantity');
			 arrError.push(objError);
		 }
	 }
 
	 if (isEmptyValue && !arrError.length) {
		 arrError = [{
			 'obj': 'none',
			 'type': ['emptyfill'],
		 }];
	 }
 
	 return arrError;
 };
 
 /* Hide error in form */
 window.tildaForm.hideErrors = function (form) {
	 if (typeof form === 'object' && !form.length) {
		 return;
	 }
 
	 if (!(form instanceof Element)) form = form[0];
 
	 var errorBoxs = form.querySelectorAll('.js-errorbox-all');
	 var errorRule = form.querySelectorAll('.js-rule-error');
	 var errorRuleAll = form.querySelectorAll('.js-error-rule-all');
	 var successBox = form.querySelectorAll('.js-successbox');
	 var errorControlBox = form.querySelectorAll('.js-error-control-box');
	 var errorControlInput = form.querySelectorAll('.js-error-control-box .t-input-error');
	 var errorPopup = document.getElementById('tilda-popup-for-error');
 
	 Array.prototype.forEach.call(errorBoxs, function (error) {
		 error.style.display = 'none';
	 });
 
	 Array.prototype.forEach.call(errorRule, function (error) {
		 error.style.display = 'none';
	 });
 
	 Array.prototype.forEach.call(errorRuleAll, function (error) {
		 error.innerHTML = '';
	 });
 
	 Array.prototype.forEach.call(successBox, function (success) {
		 success.style.display = 'none';
	 });
 
	 Array.prototype.forEach.call(errorControlInput, function (error) {
		 error.innerHTML = '';
	 });
 
	 Array.prototype.forEach.call(errorControlBox, function (error) {
		 t_removeClass(error, 'js-error-control-box');
	 });
 
	 t_removeClass(form, 'js-send-form-error');
	 t_removeClass(form, 'js-send-form-success');
 
	 if (errorPopup) t_fadeOut(errorPopup);
 };
 
 /**
  * Show error popup for ZB
  * @param {Node} form - block form
  * @param {Obxect} arrErrors - obj data errors
  * @returns
  */
 window.tildaForm.showErrorInPopup = function(form, arrErrors) {
	 if (!(form instanceof Element)) form = form[0];
 
	 if (!arrErrors || !arrErrors.length) {
		 return false;
	 }
 
	 var formId = form.getAttribute('id');
	 var inputBoxClassName = form.getAttribute('data-inputbox');
	 if (!inputBoxClassName) inputBoxClassName = '.blockinput';
 
	 var inputGroup = '';
	 var isErrorBox = false;
	 var isShowErrors = true;
	 var errorItem = '';
	 var errorInputs = '';
	 var strError = '';
	 var strCommonError = '';
	 var popupError = document.getElementById('tilda-popup-for-error');
 
	 if (!popupError) {
		 document.body.insertAdjacentHTML('beforeend', '<div id="tilda-popup-for-error" class="js-form-popup-errorbox tn-form__errorbox-popup" style="display: none;"> <div class="t-form__errorbox-text t-text t-text_xs"> error </div> <div class="tn-form__errorbox-close js-errorbox-close"> <div class="tn-form__errorbox-close-line tn-form__errorbox-close-line-left"></div> <div class="tn-form__errorbox-close-line tn-form__errorbox-close-line-right"></div> </div> </div>');
		 popupError = document.getElementById('tilda-popup-for-error');
 
		 t_addEventListener(popupError, 'click', function (event) {
			 event = event || window.event;
			 var target = event.target || event.srcElement;
			 var closeBtn = target.closest('.js-errorbox-close');
			 if (!closeBtn) return;
 
			 event.preventDefault ? event.preventDefault() : (event.returnValue = false);
			 t_fadeOut(popupError);
			 return false;
		 });
	 }
 
	 for (var i = 0; i < arrErrors.length; i++) {
		 if (!arrErrors[i] || !arrErrors[i].obj) continue;
 
		 if (i === 0 && arrErrors[i].obj === 'none') {
			 strCommonError = '<p class="t-form__errorbox-item">' + t_forms__getMsg('emptyfill') + '</p>';
			 break;
		 }
 
		 var el = arrErrors[i].obj;
 
		 if (!(el instanceof Element)) {
			 el = el[0];
		 };
 
		 if (el) {
			 inputGroup = el.closest(inputBoxClassName);
		 }
 
		 if (inputGroup) {
			 errorInputs = inputGroup.querySelectorAll('.t-input-error');
			 t_addClass(inputGroup, 'js-error-control-box');
 
			 if (errorInputs.length) {
				 isErrorBox = true;
			 }
		 }
 
		 for (var j = 0; j < arrErrors[i].type.length; j++) {
			 var error = arrErrors[i].type[j];
			 var localizedError = t_forms__getMsg(error);
			 strError = '';
 
			 if (isShowErrors) {
				 errorItem = form.querySelector('.js-rule-error-' + error);
 
				 if (errorItem) {
					 if (((!errorItem.textContent || !errorItem.innerText) && localizedError) && strCommonError.indexOf(localizedError) === -1) {
						 strCommonError = strCommonError + '<p class="t-form__errorbox-item">' + localizedError + '</p>';
					 } else {
						 strError = errorItem.textContent || errorItem.innerText;
						 if (strCommonError.indexOf(localizedError) === -1) {
							 strCommonError = strCommonError + '<p class="t-form__errorbox-item">' + strError + '</p>';
						 }
					 }
				 } else if (localizedError && strCommonError.indexOf(localizedError) === -1) {
					 strCommonError = strCommonError + '<p class="t-form__errorbox-item">' + localizedError + '</p>';
				 }
			 }
 
			 if (isErrorBox) {
				 if (!strError && t_forms__getMsg(error + 'field')) {
					 strError = t_forms__getMsg(error + 'field');
				 } else if (localizedError) {
					 strError = localizedError;
				 }
 
				 if (strError && inputGroup) {
					 errorInputs = inputGroup.querySelectorAll('.t-input-error');
					 Array.prototype.forEach.call(errorInputs, function (input) {
						 input.innerHTML = strError;
						 t_fadeIn(input);
					 });
				 }
			 }
		 }
	 }
 
	 if (strCommonError) {
		 popupError.querySelector('.t-form__errorbox-text').innerHTML = strCommonError;
		 var errorsText = popupError.querySelectorAll('.t-form__errorbox-item');
 
		 Array.prototype.forEach.call(errorsText, function (text) {
			 text.style.display = 'block';
		 });
 
		 t_fadeIn(popupError);
	 }
 
	 if (window.t_forms__errorTimerID) {
		 window.clearTimeout(window.t_forms__errorTimerID);
	 }
 
	 window.t_forms__errorTimerID = window.setTimeout(function () {
		 t_fadeOut(popupError);
		 errorInputs = form.querySelectorAll('.t-input-error');
 
		 Array.prototype.forEach.call(errorInputs, function (input) {
			 input.innerHTML = '';
			 t_fadeOut(input);
		 });
 
		 window.t_forms__errorTimerID = 0;
	 }, 10000);
 
	 /**
	  * Hide popup input error in ZB
	  *
	  * @param {MouseEvent} event - event
	  * @returns {undefined} - exit function
	  */
	 function t_forms__hidePopup(event) {
		 event = event || window.event;
		 var input = event.target || event.srcElement;
 
		 if (input.tagName !== 'INPUT') return;
 
		 var errorInputs = rec.querySelectorAll('form .t-input-error');
		 t_fadeOut(popupError);
 
		 Array.prototype.forEach.call(errorInputs, function (input) {
			 input.innerHTML = '';
			 t_fadeOut(input);
		 });
 
		 if (window.t_forms__errorTimerID) {
			 window.clearTimeout(window.t_forms__errorTimerID);
			 window.t_forms__errorTimerID = 0;
		 }
 
		 window.isInitEventsZB[formId] = true;
	 }
 
	 if (!window.isInitEventsZB[formId]) {
		 var rec = form.closest('.r');
		 var eventFocus = 'focus';
 
		 if (!document.addEventListener) {
			 eventFocus = 'focusin';
		 }
 
		 t_removeEventListener(rec, eventFocus, t_forms__hidePopup);
		 t_addEventListener(rec, eventFocus, t_forms__hidePopup, true);
		 t_removeEventListener(rec, 'change', t_forms__hidePopup);
		 t_addEventListener(rec, 'change', t_forms__hidePopup, true);
	 }
 
	 t_triggerEvent(form, 'tildaform:aftererror');
 
	 return true;
 };
 
 /**
  * Show error in form
  * @param {Node} form
  * @param {Array} arrErrors
  * @returns {boolean} error if array arErrors is not empty and return true. If arrErrors is empty then return false
  */
 window.tildaForm.showErrors = function (form, arrErrors) {
	 if (!(form instanceof Element)) form = form[0];
 
	 if (!arrErrors || !arrErrors.length) {
		 return false;
	 }
 
	 if (form.getAttribute('data-error-popup') === 'y') {
		 return tildaForm.showErrorInPopup(form, arrErrors);
	 }
 
	 var inputBoxClassName = form.getAttribute('data-inputbox');
	 if (!inputBoxClassName) inputBoxClassName = '.blockinput';
 
	 var inputGroup = '';
	 var isErrorBox = false;
	 var isShowErrors = true;
	 var errorItem = '';
	 var errorInputs = '';
	 var strError = '';
 
	 for (var i = 0; i < arrErrors.length; i++) {
		 if (!arrErrors[i] || !arrErrors[i].obj) continue;
 
		 if (i === 0 && arrErrors[i].obj === 'none') {
			 errorItem = form.querySelectorAll('.js-rule-error-all');
			 for (var j = 0; j < errorItem.length; j++) {
				 errorItem[j].innerHTML = t_forms__getMsg('emptyfill');
				 errorItem[j].style.display = 'block';
			 }
			 break;
		 }
 
		 var el = arrErrors[i].obj;
 
		 if (!(el instanceof Element)) {
			 el = el[0];
		 };
 
		 if (el) {
			 inputGroup = el.closest(inputBoxClassName);
		 }
 
		 if (inputGroup) {
			 errorInputs = inputGroup.querySelectorAll('.t-input-error');
			 t_addClass(inputGroup, 'js-error-control-box');
 
			 if (errorInputs.length > 0) {
				 isErrorBox = true;
			 }
		 }
 
		 for (var j = 0; j < arrErrors[i].type.length; j++) {
			 var error = arrErrors[i].type[j];
 
			 strError = '';
 
			 if (isShowErrors) {
				 errorItem = form.querySelectorAll('.js-rule-error-' + error);
 
				 if (errorItem.length) {
					 for (var k = 0; k < errorItem.length; k++) {
						 if (errorItem[k].getAttribute('data-rule-filled')) {
							 errorItem[k].style.display = 'block';
							 continue;
						 }
 
						 if ((!errorItem[k].textContent || !errorItem[k].innerText) && t_forms__getMsg(error)) {
							 errorItem[k].innerHTML = t_forms__getMsg(error);
						 } else {
							 strError = errorItem[0].textContent || errorItem[0].innerText;
						 }
 
						 errorItem[k].style.display = 'block';
					 }
				 } else if (t_forms__getMsg(error)) {
					 errorItem = form.querySelectorAll('.js-rule-error-all');
					 if (errorItem.length) {
						 for (var k = 0; k < errorItem.length; k++) {
							 errorItem[k].innerHTML = t_forms__getMsg(error);
							 errorItem[k].style.display = 'block';
						 }
					 }
				 }
			 }
 
			 if (isErrorBox) {
				 if (!strError && t_forms__getMsg(error + 'field')) {
					 strError = t_forms__getMsg(error + 'field');
				 } else if (t_forms__getMsg(error)) {
					 strError = t_forms__getMsg(error);
				 }
 
				 if (strError && inputGroup) {
					 errorInputs = inputGroup.querySelectorAll('.t-input-error');
					 Array.prototype.forEach.call(errorInputs, function (input) {
						 input.innerHTML = strError;
					 });
				 }
			 }
		 }
	 }
 
	 var errorBoxs = form.querySelectorAll('.js-errorbox-all');
	 Array.prototype.forEach.call(errorBoxs, function (error) {
		 error.style.display = 'block';
	 });
 
	 t_triggerEvent(form, 'tildaform:aftererror');
 
	 return true;
 };
 
 /**
  * Add block for our own captcha
  * @param {Node} form - block form
  * @param {string} formKey - form key
  */
 window.tildaForm.addTildaCaptcha = function (form, formKey) {
	 if (!(form instanceof Element)) form = form[0];
 
	 var formCaptchaBox = document.getElementById('tildaformcaptchabox');
	 var tildaCaptcha = document.getElementById('js-tildaspec-captcha');
 
	 if (formCaptchaBox) t_removeEl(formCaptchaBox);	
	 if (tildaCaptcha) t_removeEl(tildaCaptcha);
 
	 form.insertAdjacentHTML('beforeend', '<input type="hidden" name="tildaspec-tildacaptcha" id="js-tildaspec-captcha">');
	 var randomKey;
 
	 try {
		 randomKey = '' + new Date().getTime() + '=' + parseInt(Math.random() * 8, 10);
	 } catch (e) {
		 randomKey = 'rnd=' + parseInt(Math.random() * 8, 10);
	 }
 
	 var strCaptcha = '<div id="tildaformcaptchabox" style="z-index: 99999999999; position:fixed; text-align: center; vertical-align: middle; top: 0px; left:0px; bottom: 0px; right: 0px; background: rgba(255,255,255,0.97);"><iframe id="captchaIframeBox" src="//' + window.tildaForm.endpoint + '/procces/captcha/?tildaspec-formid=' + form.getAttribute('id') + '&tildaspec-formskey=' + formKey + '&' + randomKey + '" frameborder="0" width="100%" height="100%"></iframe></div>';
	 document.body.insertAdjacentHTML('beforeend', strCaptcha);
 
	 window.removeEventListener('message', checkVerifyTildaCaptcha);
	 window.addEventListener('message', checkVerifyTildaCaptcha);
 };
 
 /**
  * Add information on members
  * @param {Node} form - block form
  * @returns {boolean} - return true/false
  */
 window.tildaForm.addMebersInfoToForm = function (form) {
	 if (!(form instanceof Element)) form = form[0];
 
	 try {
		 window.tildaForm.tildamember = {};
		 var mauserInfo = form.querySelector('.js-tilda-mauserinfo');
		 if (mauserInfo) t_removeEl(mauserInfo);
 
		 if (!window.mauser || !window.mauser.code || !window.mauser.email) {
			 return false;
		 }
 
		 if (window.mauser.name) {
			 window.tildaForm.tildamember['name'] = window.mauser.name;
		 }
 
		 window.tildaForm.tildamember['email'] = window.mauser.email;
		 window.tildaForm.tildamember['code'] = window.mauser.code;
 
	 } catch (error) {
		 console.log('addMebersInfoToForm exception: ', error);
		 return false;
	 }
	 return true;
 };
 
 /* Close success popup for ZB */
 window.tildaForm.closeSuccessPopup = function () {
	 var successPopup = document.getElementById('tildaformsuccesspopup');
	 if (!successPopup) return;
 
	 t_removeClass(document.body, 't-body_success-popup-showed');
 
	 if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream) {
		 window.tildaForm.unlockBodyScroll();
	 }
 
	 t_fadeOut(successPopup);
 };
 
 /* Locked scroll document for iPhone/iPad/iPod */
 window.tildaForm.lockBodyScroll = function () {
	 var body = document.body;
	 if (t_hasClass(body, 't-body_scroll-locked')) return;
 
	 var bodyScrollTop = (typeof window.pageYOffset !== 'undefined') ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
	 t_addClass(body, 't-body_scroll-locked');
	 body.style.top = '-' + bodyScrollTop + 'px';
	 body.setAttribute('data-popup-scrolltop', bodyScrollTop);
 };
 
 /* Unlocked scroll document for iPhone/iPad/iPod */
 window.tildaForm.unlockBodyScroll = function () {
	 var body = document.body;
	 if (!t_hasClass(body, 't-body_scroll-locked')) return;
 
	 var bodyScrollTop = body.getAttribute('data-popup-scrolltop');
	 t_removeClass(body, 't-body_scroll-locked');
	 body.style.top = null;
	 body.removeAttribute('data-popup-scrolltop');
	 document.documentElement.scrollTop = parseInt(bodyScrollTop);
 };
 
 /**
  * Show success popup for ZB
  * @param {string} message - str message
  */
 window.tildaForm.showSuccessPopup = function (message) {
	 var strHtml = '';
	 var successPopup = document.getElementById('tildaformsuccesspopup');
	 var successPopupText = document.getElementById('tildaformsuccesspopuptext');
	 var body = document.body;
 
	 if (!successPopup) {
		 strHtml += '<style media="screen"> .t-form-success-popup { display: none; position: fixed; background-color: rgba(0,0,0,.8); top: 0px; left: 0px; width: 100%; height: 100%; z-index: 10000; overflow-y: auto; cursor: pointer; } .t-body_success-popup-showed { height: 100vh; min-height: 100vh; overflow: hidden; } .t-form-success-popup__window { width: 100%; max-width: 400px; position: absolute; top: 50%; -webkit-transform: translateY(-50%); transform: translateY(-50%); left: 0px; right: 0px; margin: 0 auto; padding: 20px; box-sizing: border-box; } .t-form-success-popup__wrapper { background-color: #fff; padding: 40px 40px 50px; box-sizing: border-box; border-radius: 5px; text-align: center; position: relative; cursor: default; } .t-form-success-popup__text { padding-top: 20px; } .t-form-success-popup__close-icon { position: absolute; top: 14px; right: 14px; cursor: pointer; } @media screen and (max-width: 480px) { .t-form-success-popup__text { padding-top: 10px; } .t-form-success-popup__wrapper { padding-left: 20px; padding-right: 20px; } } </style>';
		 strHtml += '<div class="t-form-success-popup" style="display:none;" id="tildaformsuccesspopup"> <div class="t-form-success-popup__window"> <div class="t-form-success-popup__wrapper"> <svg class="t-form-success-popup__close-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" class="t657__icon-close" viewBox="0 0 23 23"> <g fill-rule="evenodd"> <path d="M0 1.41L1.4 0l21.22 21.21-1.41 1.42z"/> <path d="M21.21 0l1.42 1.4L1.4 22.63 0 21.21z"/> </g> </svg> <svg width="50" height="50" fill="#62C584"> <path d="M25.1 49.28A24.64 24.64 0 0 1 .5 24.68 24.64 24.64 0 0 1 25.1.07a24.64 24.64 0 0 1 24.6 24.6 24.64 24.64 0 0 1-24.6 24.61zm0-47.45A22.87 22.87 0 0 0 2.26 24.68 22.87 22.87 0 0 0 25.1 47.52a22.87 22.87 0 0 0 22.84-22.84A22.87 22.87 0 0 0 25.1 1.83z"/> <path d="M22.84 30.53l-4.44-4.45a.88.88 0 1 1 1.24-1.24l3.2 3.2 8.89-8.9a.88.88 0 1 1 1.25 1.26L22.84 30.53z"/> </svg> <div class="t-form-success-popup__text t-descr t-descr_sm" id="tildaformsuccesspopuptext"> Thank You! </div> </div> </div> </div>';
 
		 body.insertAdjacentHTML('beforeend', strHtml);
		 successPopup = document.getElementById('tildaformsuccesspopup');
		 successPopupText = document.getElementById('tildaformsuccesspopuptext');
		 var successPopupCloseBtn = successPopup.querySelector('.t-form-success-popup__close-icon');
 
		 t_addEventListener(successPopup, 'click', function (event) {
			 event = event || window.event;
			 var target = event.target || event.srcElement;
 
			 if (target === this) {
				 window.tildaForm.closeSuccessPopup();
			 }
		 });
 
		 t_addEventListener(successPopupCloseBtn, 'click', function () {
			 window.tildaForm.closeSuccessPopup();
		 });
 
		 t_addEventListener(body, 'keydown', function (event) {
			 event = event || window.event;
			 var keyCode = event.keyCode || event.which;
 
			 if (keyCode == 27) {
				 window.tildaForm.closeSuccessPopup();
			 }
		 });
	 }
 
	 successPopupText.innerHTML = message;
 
	 t_fadeIn(successPopup);
	 t_addClass(body, 't-body_success-popup-showed');
 
	 if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream) {
		 setTimeout(function () {
			 window.tildaForm.lockBodyScroll();
		 }, 500);
	 }
 };
 
 /**
  * Success end form
  * @param {Node} form - block form
  * @param {string} successUrl - link on successful submission
  * @param {string} successCallback - function on successful submission
  */
 window.tildaForm.successEnd = function (form, successUrl, successCallback) {
	 if (!(form instanceof Element)) form = form[0];
 
	 var successBox = form.querySelector('.js-successbox');
	 var successStr = t_forms__getMsg('success');
 
	 if (successBox) {
		 if ((!successBox.textContent || !successBox.innerText) && successStr) {
			 successBox.innerHTML = successStr;
		 }
 
		 if (form.getAttribute('data-success-popup') === 'y') {
			 window.tildaForm.showSuccessPopup(successBox.innerHTML);
		 } else {
			 successBox.style.display = 'block';
		 }
	 }
 
	 t_addClass(form, 'js-send-form-success');
 
	 /**
	  * eval() is needed to execute a user function. The jQuery check is left
	  * for compatibility with older users whose code can work with the jQuery object.
	  * An example of a custom function: https://help-ru.tilda.cc/tips/javascript#rec115335034
	  */
 
	 if (typeof window[successCallback] === 'function') {
		 if (typeof jQuery !== 'undefined') {
			 eval(successCallback + '($(form))');
		 } else {
			 eval(successCallback + '(form)');
		 }
	 } else if (successUrl) {
		 setTimeout(function () {
			 window.location.href = successUrl;
		 }, 500);
	 }
 
	 window.tildaForm.clearTCart(form);
 
	 var upwidgetRemoveBtns = form.querySelectorAll('.t-upwidget-container__data_table_actions_remove svg');
	 var inputText = form.querySelectorAll('input[type="text"]');
	 var inputPhone = form.querySelectorAll('input[type="tel"]');
	 var inputTextarea = form.querySelectorAll('textarea');
 
	 /* replace to public fn */
	 Array.prototype.forEach.call(upwidgetRemoveBtns, function (widget) {
		 t_triggerEvent(widget, 'click');
	 });
 
	 Array.prototype.forEach.call(inputText, function (input) {
		 input.value = '';
	 });
 
	 Array.prototype.forEach.call(inputPhone, function (input) {
		 input.value = '';
	 });
 
	 Array.prototype.forEach.call(inputTextarea, function (textarea) {
		 textarea.innerHTML = '';
		 textarea.value = '';
	 });
 
	 /**
	  * This check on jQuery is necessary for old users, who can
	  * use custom functions on their projects with jQuery-objects.
	  * See example of custom function on:
	  * https://help-ru.tilda.cc/tips/javascript#rec115335034
	  */
 
	 if (typeof jQuery !== 'undefined') {
		 $(form).data('tildaformresult', {
			 tranId: '0',
			 orderId: '0'
		 });
	 }
 
	 form.tildaTranId = '0';
	 form.tildaOrderId = '0';
 };
 
 /* Clear data cart */
 window.tildaForm.clearTCart = function (form) {
	 if (!(form instanceof Element)) form = form[0];
 
	 if (form.getAttribute('data-formcart') === 'y') {
		 /* flag clear basket */
		 window.clearTCart = true;
 
		 window.tcart = {
			 amount: 0,
			 currency: '',
			 system: '',
			 products: [],
		 };
 
		 window.tcart.system = 'none';
 
		 if (typeof localStorage === 'object') {
			 try {
				 localStorage.removeItem('tcart');
			 } catch (error) {
				 console.error('Your web browser does not support localStorage. Code status: ', error);
			 }
		 }
 
		 try {
			 delete window.tcart;
			 tcart__loadLocalObj();
		 } catch (error) { /* */ }
 
		 window.tcart_success = 'yes';
	 }
 };
 
 /**
  * Handler for sending data and receiving the result(captcha, errors, successful result, launch of payment systems)
  * @param {Node} form - block form
  * @param {Node} btnSubmit - el btn submit
  * @param {number} formType - type form
  * @param {string} formKey - key form
  * @returns {undefined} - exit function
  */
 window.tildaForm.send = function (form, btnSubmit, formType, formKey) {
	 if (!(form instanceof Element)) form = form[0];
	 if (!(btnSubmit instanceof Element)) btnSubmit = btnSubmit[0];
 
	 var allRecords = document.getElementById('allrecords');
	 var pageId = allRecords.getAttribute('data-tilda-page-id');
	 var projectId = allRecords.getAttribute('data-tilda-project-id');
	 var formId = form.getAttribute('id');
	 var dataFormCart = form.getAttribute('data-formcart');
 
	 window.tildaForm.tildapayment = false;
 
	 if (dataFormCart === 'y' || form.closest('.t706__orderform')) {
		 window.tildaForm.addPaymentInfoToForm(form);
	 }
 
	 try {
		 if (window.mauser) {
			 window.tildaForm.addMebersInfoToForm(form);
		 }
	 } catch (error) { /* */ }
 
	 var inputItsGood = form.querySelector('input[name="form-spec-comments"]');
	 if (!inputItsGood) {
		 form.insertAdjacentHTML('beforeend', '<div style="position: absolute; left: -5000px; bottom: 0; display: none;"><input type="text" name="form-spec-comments" value="Its good" class="js-form-spec-comments" tabindex="-1" /></div>');
	 }
 
	 if (formType === 2 || (!formType && formKey)) {
		 var tildaSpecs = {
			 'tildaspec-cookie': document.cookie,
			 'tildaspec-referer': window.location.href,
			 'tildaspec-formid': formId,
			 'tildaspec-formskey': formKey,
			 'tildaspec-version-lib': window.tildaForm.versionLib,
			 'tildaspec-pageid': pageId,
			 'tildaspec-projectid': projectId,
			 'tildaspec-lang': window.t_forms__lang,
		 }
 
		 for (spec in tildaSpecs) {
			 var hiddenInput = form.querySelector('input[name="' + spec + '"]');
			 if (!hiddenInput) {
				 form.insertAdjacentHTML('beforeend', '<input type="hidden" name="' + spec + '" value="' + tildaSpecs[spec] + '">');
			 }
		 }
 
		 try {
			 hiddenInput = form.querySelector('input[name=tildaspec-fp]');
 
			 if (!hiddenInput) {
				 form.insertAdjacentHTML('beforeend', '<input type="hidden" name="tildaspec-fp" value="">');
				 hiddenInput = form.querySelector('input[name=tildaspec-fp]');
			 }
 
			 if (window.tildastat) {
				 hiddenInput.value = window.tildastat('fingerprint');
			 } else {
				 hiddenInput.value = 'st' + window.pageYOffset + 'w' + window.innerWidth + 'h' + window.innerHeight + 'ft' + form.getBoundingClientRect().top + window.pageYOffset;
			 }
		 } catch (error) { /* */ }
 
		 inputItsGood = form.querySelector('.js-form-spec-comments');
		 if (inputItsGood) inputItsGood.value = '';
 
		 var formUrl = 'https://' + window.tildaForm.endpoint + '/procces/';
		 var dataForm = [];
		 var arrFilter = [];
 
		 dataForm = t_serializeArray(form);
 
		 Array.prototype.forEach.call(dataForm, function (data) {
			 if (data.name.indexOf('tildadelivery-') === -1) {
				 arrFilter.push(data);
			 }
		 });
 
		 dataForm = arrFilter;
 
		 if (window.tildaForm.tildapayment && window.tildaForm.tildapayment.products) {
			 dataForm.push({
				 name: 'tildapayment',
				 value: JSON.stringify(window.tildaForm.tildapayment),
			 });
		 } else if (form.closest('.t706__orderform')) {
			 return false;
		 }
 
		 if (window.tildaForm.tildamember && window.tildaForm.tildamember.code) {
			 dataForm.push({
				 name: 'tildamember',
				 value: JSON.stringify(window.tildaForm.tildamember),
			 });
		 }
 
		 dataForm = t_forms__formData(dataForm);
		 var startRequest = Date.now();
		 t_triggerEvent(form, 'tildaform:beforesend');
 
		 var xhr = new XMLHttpRequest();
		 xhr.open('POST', formUrl, true);
		 xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		 xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
		 xhr.onreadystatechange = function () {
			 if (xhr.readyState === 4) {
				 if (xhr.status >= 200 && xhr.status < 400) {
					 var data = xhr.responseText;
					 if (data) {
						 var objData = JSON.parse(data);
						 if (typeof objData === 'object') {
							 var dataSuccessUrl = form.getAttribute('data-success-url');
							 var dataSuccessCallback = form.getAttribute('data-success-callback');
							 var dataFormSendedCallback = form.getAttribute('data-formsended-callback');
 
							 t_removeClass(btnSubmit, 't-btn_sending');
 
							 btnSubmit.tildaSendingStatus = '0';
 
							 if (objData && objData.error) {
								 dataSuccessUrl = '';
								 dataSuccessCallback = '';
 
								 var msgContainers = t_forms__getMsgContainer(form, '');
								 var errorBoxs = msgContainers.errorBoxs;
								 var allError = msgContainers.allError;
 
								 Array.prototype.forEach.call(allError, function (error) {
									 error.style.display = 'block';
								 });
 
								 Array.prototype.forEach.call(errorBoxs, function (error) {
									 error.innerHTML = objData.error;
									 error.style.display = 'block';
								 });
 
								 t_addClass(form, 'js-send-form-error');
								 t_triggerEvent(form, 'tildaform:aftererror');
							 } else {
								 if (objData && objData.needcaptcha) {
									 if (formKey) {
										 window.tildaForm.addTildaCaptcha(form, formKey);
										 return;
									 } else {
										 alert('Server busy. Please try again later.');
										 return;
									 }
								 }
 
								 var formResult = {};
 
								 if (objData && objData.results && objData.results[0]) {
									 var strValue = objData.results[0];
 
									 strValue = strValue.split(':');
									 formResult.tranId = strValue[0] + ':' + strValue[1];
									 formResult.orderId = (strValue[2] ? strValue[2] : '0');
 
									 if (formResult.orderId && formResult.orderId !== '0') {
										 window.tildaForm.orderIdForStat = formResult.orderId;
									 }
								 } else {
									 formResult.tranId = '0';
									 formResult.orderId = '0';
								 }
 
								 /**
								  * This check on jQuery is necessary for old users, who can
								  * use custom functions on their projects with jQuery-objects.
								  * See example of custom function on:
								  * https://help-ru.tilda.cc/tips/javascript#rec115335034
								  */
 
								 if (typeof jQuery !== 'undefined') {
									 $(form).data('tildaformresult', formResult);
								 }
 
								 form.tildaTranId = formResult.tranId;
								 form.tildaOrderId = formResult.orderId;
 
								 var dataEventName = form.getAttribute('data-tilda-event-name') || '';
 
								 if (!dataEventName) {
									 if (dataFormCart === 'y' && objData && (
											 (objData.next && objData.next.type &&
												 (objData.next.type !== 'function' ||
													 (objData.next.value &&
														 (objData.next.value.sysname === 'stripev3' ||
															 objData.next.value.installation === 'outersite')
													 )
												 )
											 ) || !objData.next)) {
										 dataEventName = '/tilda/' + formId + '/payment/';
									 } else {
										 dataEventName = '/tilda/' + formId + '/submitted/';
									 }
								 }
 
								 var title = 'Send data from form ' + formId;
								 var price = 0;
								 var product = '';
								 var priceEl = form.querySelector('.js-tilda-price');
 
								 if (window.Tilda && typeof window.Tilda.sendEventToStatistics === 'function') {
									 if (window.tildaForm.tildapayment && window.tildaForm.tildapayment.amount) {
										 price = window.tildaForm.tildapayment.amount;
										 if (parseFloat(price) > 0) {
											 title = 'Order ' + formResult.orderId;
										 }
									 } else if (priceEl) {
										 price = priceEl.value;
										 if (parseFloat(price) > 0) {
											 title = 'Order ' + formResult.orderId;
										 }
									 }
 
									 try {
										 window.Tilda.sendEventToStatistics(dataEventName, title, product, price);
									 } catch (error) {
										 console.log('Error while sending statistics. Code status: ', error);
									 }
 
									 if (window.dataLayer) {
										 window.dataLayer.push({
											 'event': 'submit_' + formId,
										 });
									 }
								 } else {
									 try {
										 /* eslint no-undef: */
										 if (ga && window.mainTracker !== 'tilda') {
											 ga('send', {
												 'hitType': 'pageview',
												 'page': dataEventName,
												 'title': title,
											 });
										 }
 
										 if (window.mainMetrika && window[window.mainMetrika]) {
											 window[window.mainMetrika].hit(dataEventName, {
												 title: title,
												 referer: window.location.href,
											 });
										 }
									 } catch (error) {
										 console.log('Error while sending main metrica. Code status: ', error);
									 }
 
									 if (window.dataLayer) {
										 window.dataLayer.push({
											 'event': 'submit_' + formId,
										 });
									 }
								 }
 
								 try {
									 t_triggerEvent(form, 'tildaform:aftersuccess');
 
									 if (dataFormSendedCallback && typeof jQuery === 'function') {
										 eval(dataFormSendedCallback + '($(form));');
									 } else if (dataFormSendedCallback) {
										 eval(dataFormSendedCallback + '(form);');
									 }
								 } catch (error) {
									 console.log('Error while call success callback. Code status: ', error);
								 }
 
								 /* If you need to send the data further, to the payment system */
								 if (objData && objData.next && objData.next.type) {
									 window.tildaForm.payment(form, objData.next);
									 dataSuccessUrl = '';
									 return false;
								 }
 
								 window.tildaForm.successEnd(form, dataSuccessUrl, dataSuccessCallback);
							 }
						 }
					 }
				 } else {
					 var tsDelta = Date.now() - startRequest;
					 t_removeClass(btnSubmit);
					 btnSubmit.tildaSendingStatus = '0';
 
					 var msgContainers = t_forms__getMsgContainer(form, '');
					 var errorBoxs = msgContainers.errorBoxs;
					 var allError = msgContainers.allError;
 
					 if (!xhr || (xhr.status == 0 && tsDelta < 100)) {
						 Array.prototype.forEach.call(allError, function (error) {
							 error.innerHTML = 'Request error (sending form data). Please check internet connection...';
						 });
					 } else if (
						 xhr &&
						 (xhr.status >= 500 || xhr.status == 408 || xhr.status == 410 || xhr.status == 429 || xhr.statusText == 'timeout' /* Похоже 'timeout' отсутствует https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/statusText */) &&
						 window.tildaForm.endpoint.indexOf('forms.tilda') !== -1
					 ) {
						 window.tildaForm.endpoint = 'forms2.tildacdn.com';
						 window.tildaForm.send(form, btnSubmit, formType, formKey);
						 return false;
					 } else if (xhr && xhr.responseText) {
						 Array.prototype.forEach.call(allError, function (error) {
							 error.innerHTML = '[' + xhr.status + '] ' + xhr.responseText + '. Please, try again later.';
						 });
					 } else if (xhr && xhr.statusText) {
						 Array.prototype.forEach.call(allError, function (error) {
							 error.innerHTML = 'Error [' + xhr.status + ', ' + xhr.statusText + ']. Please, try again later.';
						 });
					 } else {
						 Array.prototype.forEach.call(allError, function (error) {
							 error.innerHTML = '[' + xhr.status + '] ' + 'Unknown error. Please, try again later.';
						 });
					 }
 
					 Array.prototype.forEach.call(allError, function (error) {
						 error.style.display = 'block';
					 });
 
					 Array.prototype.forEach.call(errorBoxs, function (error) {
						 error.style.display = 'block';
					 });
 
					 t_addClass(form, 'js-send-form-error');
					 t_triggerEvent(form, 'tildaform:aftererror');
				 }
			 }
		 };
 
		 xhr.send(dataForm);
		 return false;
	 }	else if (form.getAttribute('data-is-formajax') === 'y') {
		 var dataForm = {};
		 dataForm = t_serializeArray(form);
 
		 if (window.tildaForm.tildapayment && window.tildaForm.tildapayment.amount) {
			 dataForm.push({
				 name: 'tildapayment',
				 value: JSON.stringify(window.tildaForm.tildapayment),
			 });
		 }
 
		 dataForm = t_forms__formData(dataForm);
		 var xhr = new XMLHttpRequest();
		 xhr.open('POST', form.getAttribute('action'), true);
		 xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		 xhr.setRequestHeader('Accept', 'text/plain, */*; q=0.01');
		 xhr.onreadystatechange = function () {
			 if (xhr.readyState === 4) {
				 if (xhr.status >= 200 && xhr.status < 400) {
					 var successBox = form.querySelector('.js-successbox');
					 var dataSuccessUrl = form.getAttribute('data-success-url');
					 var dataSuccessCallback = form.getAttribute('data-success-callback');
 
					 t_removeClass(btnSubmit, 't-btn_sending');
 
					 btnSubmit.tildaSendingStatus = '0';
 
					 var data = xhr.responseText;
					 if (data && data.substring(0, 1) == '{') {
						 var objData = JSON.parse(data);
 
						 if (typeof objData === 'object') {
							 if (objData && objData.message && objData.message !== 'OK') {
								 successBox.innerHTML = objData.message;
							 } else if (objData && objData.error) {
 
								 var msgContainers = t_forms__getMsgContainer(form, 'Unknown error. Please, try again later.');
								 var errorBoxs = msgContainers.errorBoxs;
								 var allError = msgContainers.allError;
 
								 Array.prototype.forEach.call(allError, function (error) {
									 error.style.display = 'block';
									 error.innerHTML = objData.error;
								 });
 
								 Array.prototype.forEach.call(errorBoxs, function (error) {
									 error.style.display = 'block';
								 });
 
								 t_addClass(form, 'js-send-form-error');
								 t_triggerEvent(form, 'tildaform:aftererror');
								 return false;
							 }
						 }
					 } else {
						 successBox.innerHTML = data;
						 t_parseScripts(successBox, '');
					 }
 
					 var linkPage = '/tilda/' + formId + '/submitted/';
					 var title = 'Send data from form ' + formId;
 
					 if (window.Tilda && typeof window.Tilda.sendEventToStatistics === 'function') {
						 window.Tilda.sendEventToStatistics(linkPage, title, '', 0);
					 } else if (typeof ga !== 'undefined' && window.mainTracker !== 'tilda') {
						 ga('send', {
							 'hitType': 'pageview',
							 'page': linkPage,
							 'title': title,
						 });
					 } else if (window.mainMetrika > '' && window[window.mainMetrika]) {
						 window[window.mainMetrika].hit(linkPage, {
							 title: title,
							 referer: window.location.href,
						 });
					 }
 
					 t_triggerEvent(form, 'tildaform:aftersuccess');
					 window.tildaForm.successEnd(form, dataSuccessUrl, dataSuccessCallback);
				 } else {
					 t_removeClass(btnSubmit, 't-btn_sending');
					 btnSubmit.tildaSendingStatus = '0';
					 
					 var msgContainers = t_forms__getMsgContainer(form, '');
					 var errorBoxs = msgContainers.errorBoxs;
					 var allError = msgContainers.allError;
 
					 var data = xhr.responseText;
 
					 Array.prototype.forEach.call(allError, function (error) {
						 if (data) {
							 error.innerHTML = data + '. Please, try again later. [' + xhr.status + ']';
						 } else if (xhr.statusText) {
							 error.innerHTML = 'Error [' + xhr.statusText + ']. Please, try again later. [' + xhr.status + ']';
						 } else {
							 error.innerHTML = 'Unknown error. Please, try again later. [' + xhr.status + ']';
						 }
 
						 error.style.display = 'block';
					 });
 
					 Array.prototype.forEach.call(errorBoxs, function (error) {
						 error.style.display = 'block';
					 });
 
					 t_addClass(form, 'js-send-form-error');
					 t_triggerEvent(form, 'tildaform:aftererror');
				 }
			 }
		 };
		 xhr.send(dataForm);
 
		 return false;
	 } else if (form.getAttribute('action').indexOf(window.tildaForm.endpoint) == -1) {
		 t_removeClass(btnSubmit, 't-btn_sending');
		 btnSubmit.tildaSendingStatus = '3';
		 form.submit();
		 return true;
	 } else {
		 return false;
	 }
 };
 
 /* Left for compatibility with old blocks */
 window.validateForm = function ($jform) {
	 return window.tildaForm.validate($jform);
 };
 
 /* Remembering the utm tag so that later it can be passed on */
 try {
	 var TILDAPAGE_URL = window.location.href,
		 TILDAPAGE_QUERY = '',
		 TILDAPAGE_UTM = '';
	 if (TILDAPAGE_URL.toLowerCase().indexOf('utm_') !== -1) {
		 TILDAPAGE_URL = TILDAPAGE_URL.toLowerCase();
		 TILDAPAGE_QUERY = TILDAPAGE_URL.split('?');
		 TILDAPAGE_QUERY = TILDAPAGE_QUERY[1];
		 if (typeof (TILDAPAGE_QUERY) == 'string') {
			 var arPair, i, arParams = TILDAPAGE_QUERY.split('&');
			 for (i in arParams) {
				 if (typeof (arParams[i]) != 'function') {
					 arPair = arParams[i].split('=');
					 if (arPair[0].substring(0, 4) == 'utm_') {
						 TILDAPAGE_UTM = TILDAPAGE_UTM + arParams[i] + '|||';
					 }
				 }
			 }
 
			 if (TILDAPAGE_UTM.length > 0) {
				 var date = new Date();
				 date.setDate(date.getDate() + 30);
				 document.cookie = 'TILDAUTM=' + encodeURIComponent(TILDAPAGE_UTM) + '; path=/; expires=' + date.toUTCString();
			 }
		 }
	 }
 } catch (error) { /* */ }
 
 /**
  * MAIN SCRIPT WORK BEGINS HERE
  */
 
 /* Iteration rec blocks and init functions */
 function t_forms__initForms() {
	 var recBlocks = document.querySelectorAll('.r');
	 /* This object is used in several functions, therefore it is declared global */
	 window.t_forms__inputData = {};
	 t_forms__addGRecaptcha();
 
	 Array.prototype.forEach.call(recBlocks, function(rec) {
		 var recid = rec.id;
		 if (window.initForms[recid]) return;
 
		 t_forms__initEventPlaceholder(rec);
		 t_forms__addInputItsGood(rec);
		 t_forms__addAttrAction(rec);
		 t_forms__onSubmit(rec);
		 t_forms__onClick(rec);
		 t_forms__onRender(rec);
 
		 window.initForms[recid] = true;
	 });
 }
 
 /* Resetting standard inputs handlers and hovering own event listeners */
 function t_forms__initEventPlaceholder(rec) {
	 var eventFocus = 'focus';
	 var eventBlur = 'blur';
 
	 if (!document.addEventListener) {
		 eventFocus = 'focusin';
		 eventBlur = 'focusout';
	 }
 
	 t_removeEventListener(rec, eventFocus, t_forms__removePlaceholder);
	 t_addEventListener(rec, eventFocus, t_forms__removePlaceholder, true);
	 t_removeEventListener(rec, eventBlur, t_forms__addPlaceholder);
	 t_addEventListener(rec, eventBlur, t_forms__addPlaceholder, true);
 }
 
 /* Remove placeholder on focus event */
 function t_forms__removePlaceholder(event) {
	 event = event || window.event;
	 var input = event.target || event.srcElement;
	 if (input.tagName !== 'INPUT') return;
 
	 var inputGroup = input.closest('[data-input-lid]');
	 var strPlace = input.getAttribute('placeholder');
	 var inputId = '';
 
	 if (inputGroup) {
		 inputId = inputGroup.getAttribute('data-input-lid');
	 } else {
		 var form = input.closest('form');
		 if (form) inputId = form.getAttribute('data-input-lid');
	 }
 
	 if (strPlace) {
		 window.t_forms__inputData[inputId] = strPlace;
		 input.setAttribute('placeholder', '');
	 }
 }
 
 /* Add placeholder on blur event */
 function t_forms__addPlaceholder(event) {
	 event = event || window.event;
	 var input = event.target || event.srcElement;
	 var inputGroup = input.closest('[data-input-lid]');
	 var inputId = 0;
 
	 if (inputGroup) {
		 inputId = inputGroup.getAttribute('data-input-lid');
	 } else {
		 var form = input.closest('form');
		 if (form) inputId = form.getAttribute('data-input-lid');
	 }
 
	 var strPlace = window.t_forms__inputData[inputId] || '';
	 if (strPlace) {
		 input.setAttribute('placeholder', strPlace);
		 window.t_forms__inputData[inputId] = '';
	 }
 }
 
 /* Add in form input with the value it's good */
 function t_forms__addInputItsGood(rec) {
	 var allForms = rec.querySelectorAll('.js-form-proccess[data-formactiontype]');
	 Array.prototype.forEach.call(allForms, function(form) {
		 var formActionType = form.getAttribute('data-formactiontype');
		 var inputItsGood = form.querySelector('input[name="form-spec-comments"]');
 
		 if (formActionType !== '1' && !inputItsGood) {
			 form.insertAdjacentHTML('beforeend', '<div style="position: absolute; left: -5000px; bottom: 0; display: none;"><input type="text" name="form-spec-comments" value="Its good" class="js-form-spec-comments" tabindex="-1" /></div>');
		 }
	 });
 }
 
 /* Add attr action in form */
 function t_forms__addAttrAction(rec) {
	 var allForms = rec.querySelectorAll('.js-form-proccess');
	 Array.prototype.forEach.call(allForms, function(form) {
		 var formType = form.getAttribute('data-formactiontype');
		 if (formType === '2') form.setAttribute('action', '#');
	 });
 }
 
 /* Add submit for form */
 function t_forms__onSubmit(rec) {
	 var allForms = rec.querySelectorAll('.js-form-proccess');
	 Array.prototype.forEach.call(allForms, function(form) {
		 t_removeEventListener(form, 'submit', t_forms__submitEvent);
		 t_addEventListener(form, 'submit', t_forms__submitEvent);
	 });
 }
 
 /* Add event click for submit in form */
 function t_forms__onClick(rec) {
	 t_addEventListener(rec, 'dblclick', t_forms__initBtnDblClick);
	 t_removeEventListener(rec, 'click', t_forms__initBtnClick);
	 t_addEventListener(rec, 'click', t_forms__initBtnClick);
 }
 
 /**
  * DblClick Event default
  * @param {MouseEvent} event - event
  * @returns {boolean || undefined}
  */
 function t_forms__initBtnDblClick(event) {
	 event = event || window.event;
	 var target = event.target || event.srcElement;
	 if (!target.closest('[type="submit"]')) return;
 
	 event.preventDefault ? event.preventDefault() : (event.returnValue = false);
	 return false;
 }
 
 /* Init click for button submit */
 function t_forms__initBtnClick(event) {
	 event = event || window.event;
	 var target = event.target || event.srcElement;
	 var btnSubmit = target.closest('[type="submit"]') ? target : false;
	 if (!btnSubmit) return;
 
	 var form = btnSubmit.closest('.js-form-proccess');
	 if (!form) return;
 
	 event.preventDefault ? event.preventDefault() : (event.returnValue = false);
 
	 var formId = form.getAttribute('id');
	 var arrErrors = [];
	 var btnStatus = '';
 
	 if (btnSubmit.tildaSendingStatus) {
		 btnStatus = btnSubmit.tildaSendingStatus;
	 }
 
	 /* 0 - I can send, 1 - I send as soon as sent, set again to 0 */
	 if (btnStatus && btnStatus >= 1) return;
	 if (t_hasClass(btnSubmit, 't706__submit_disable')) return;
	 t_addClass(btnSubmit, 't-btn_sending');
	 btnSubmit.tildaSendingStatus = '1';
	 window.tildaForm.hideErrors(form);
	 arrErrors = window.tildaForm.validate(form);
 
	 if (window.tildaForm.showErrors(form, arrErrors)) {
		 t_removeClass(btnSubmit, 't-btn_sending');
		 btnSubmit.tildaSendingStatus = '0';
		 return;
	 } else {
		 var allRecords = document.getElementById('allrecords');
		 var formKey = allRecords.getAttribute('data-tilda-formskey');
		 var formType = parseInt(form.getAttribute('data-formactiontype'));
		 var inputsServices = form.querySelectorAll('.js-formaction-services');
 
		 if (!inputsServices.length && formType !== 1 && !formKey) {
 
			 var msgContainers = t_forms__getMsgContainer(form, '');
			 var errorBoxs = msgContainers.errorBoxs;
			 var allError = msgContainers.allError;
 
			 Array.prototype.forEach.call(allError, function(error) {
				 error.innerHTML = 'Please set receiver in block with forms';
				 error.style.display = 'block';
			 });
 
			 Array.prototype.forEach.call(errorBoxs, function(box) {
				 box.style.display = 'block';
			 });
 
			 t_addClass(form, 'js-send-form-error');
			 t_removeClass(btnSubmit, 't-btn_sending');
 
			 btnSubmit.tildaSendingStatus = '0';
 
			 t_triggerEvent(form, 'tildaform:aftererror');
			 return;
		 }
 
		 /* Add custom google recaptcha from the user */
		 if (form.querySelector('.g-recaptcha') && grecaptcha) {
			 window.tildaForm.currentFormProccessing = {
				 form: form,
				 btn: btnSubmit,
				 formtype: formType,
				 formskey: formKey,
			 };
 
			 var captchaId = form.tildaCaptchaClientId;
 
			 if (!captchaId) {
				 var opts = {
					 size: 'invisible',
					 sitekey: form.getAttribute('data-tilda-captchakey'),
					 callback: window.tildaForm.captchaCallback,
				 };
 
				 captchaId = grecaptcha.render(formId + 'recaptcha', opts);
				 form.tildaCaptchaClientId = captchaId;
			 } else {
				 grecaptcha.reset(captchaId);
			 }
			 grecaptcha.execute(captchaId);
			 return;
		 }
 
		 window.tildaForm.send(form, btnSubmit, formType, formKey);
	 }
	 return;
 }
 
 /* Add event render for ZB */
 function t_forms__onRender(rec) {
	 var ist396 = !!rec.querySelector('.t396');
	 if (!ist396) return;
 
	 t_removeEventListener(rec, 'render', t_forms__renderEvent);
	 t_addEventListener(rec, 'render', t_forms__renderEvent);
 }
 
 /* Handled render trigger for ZB */
 function t_forms__renderEvent() {
	 t_forms__onSubmit(this);
 }
 
 /* Submit event for form */
 function t_forms__submitEvent(event) {
	 var form = event;
 
	 if (event.target) form = event.target;
	 if (!form) return;
 
	 var btnSubmit = form.querySelector('[type="submit"]');
	 var btnStatus = '';
 
	 if (btnSubmit && btnSubmit.tildaSendingStatus) {
		 btnStatus = btnSubmit.tildaSendingStatus;
	 }
 
	 if (btnStatus && btnStatus === '3') {
		 btnSubmit.tildaSendingStatus = '';
	 } else {
		 if (btnSubmit && !t_hasClass(btnSubmit, 't706__submit_disable')) {
			 btnSubmit.click();
		 }
 
		 event.preventDefault ? event.preventDefault() : (event.returnValue = false);
	 }
 }
 
 /**
  * ALL ADDIT	IONAL FUNCTIONS
  */
 
 function t_asyncLoad(input) {
	 var dataMask = input.getAttribute('data-tilda-mask');
	 var dataPlaceholder = input.getAttribute('data-tilda-mask-holder');
	 var dataInit = input.getAttribute('data-tilda-mask-init');
 
	 if (dataMask && !dataInit && dataPlaceholder) {
		 t_onFuncLoad('t_customMask__mask', function() {
			 t_customMask__mask(input, dataMask, {
				 placeholder: dataPlaceholder,
			 });
		 });
	 } else {
		 t_onFuncLoad('t_customMask__mask', function() {
			 t_customMask__mask(input, dataMask);
		 });
	 }
 
	 input.setAttribute('data-tilda-mask-init', '1');
 }
 
 function t_forms__getMsgContainer(form, innerText) {
	 var errorBoxs = form.querySelectorAll('.js-errorbox-all');
	 var allError = form.querySelectorAll('.js-errorbox-all .js-rule-error-all');
 
	 if (!errorBoxs.length) {
		 form.insertAdjacentHTML('afterbegin', '<div class="js-errorbox-all"></div>');
	 }
 
	 if (!allError.length) {
		 Array.prototype.forEach.call(errorBoxs, function (error) {
			 error.insertAdjacentHTML('beforeend', '<p class="js-rule-error-all">' + innerText + '</p>');
		 });
	 }
 
	 return {
		 errorBoxs: form.querySelectorAll('.js-errorbox-all'),
		 allError: form.querySelectorAll('.js-errorbox-all .js-rule-error-all'),
	 }
 }
 
 /* Add custom recaptcha */
 function t_forms__addGRecaptcha() {
	 var allRecaptchas = document.querySelectorAll('.js-tilda-captcha');
	 Array.prototype.forEach.call(allRecaptchas, function(recaptcha) {
		 var captchaKey = recaptcha.getAttribute('data-tilda-captchakey');
		 if (captchaKey) {
			 var formId = recaptcha.getAttribute('id');
 
			 if (!window.tildaForm.isRecaptchaScriptInit) {
				 var head = document.head;
				 var script = document.createElement('script');
 
				 window.tildaForm.isRecaptchaScriptInit = true;
				 script.type = 'text/javascript';
				 script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
				 script.async = true;
 
				 head.appendChild(script);
				 head.insertAdjacentHTML('beforeend', '<style type="text/css">.js-send-form-success .grecaptcha-badge {display: none;}</style>');
			 }
 
			 if (!document.getElementById(formId + 'recaptcha')) {
				 recaptcha.insertAdjacentHTML('beforeend', '<div id="' + formId + 'recaptcha" class="g-recaptcha" data-sitekey="' + captchaKey + '" data-callback="window.tildaForm.captchaCallback" data-size="invisible"></div>');
			 }
		 } else {
			 t_removeClass(recaptcha, 'js-tilda-captcha');
		 }
	 });
 }
 
 /**
  * The function accepts a message code, e.g. "req" is the code for the "Required field" message in English.
  * The function determines the language and returns the required message in the language set on the page.
  */
 function t_forms__getMsg(msg) {
	 var dict = [];
	 var lang = window.t_forms__lang;
 
	 dict['EN'] = {
		 success: 'Thank you! Your data has been submitted.',
		 successorder: 'Thank you! Order created. Please wait while you are redirected to the payment page...',
		 email: 'Please enter a valid email address',
		 url: 'Please put a correct URL',
		 phone: 'Please put a correct phone number',
		 number: 'Please put a correct number',
		 date: 'Please put a correct date',
		 time: 'Please put a correct time (HH:mm)',
		 name: 'Please put a name',
		 namerus: 'Please put a correct name (only cyrillic letters)',
		 nameeng: 'Please put a correct name (only latin letters)',
		 string: 'You put incorrect symbols. Only letters, numbers and punctuation symbols are allowed',
		 req: 'Please fill out all required fields',
		 reqfield: 'Required field',
		 minlength: 'Value is too short',
		 maxlength: 'Value too big',
		 emptyfill: 'None of the fields are filled in',
		 chosevalue: 'Please select an address from the options',
		 deliveryreq: 'It is not possible to place an order without delivery. Please refresh the page and try again',
		 promocode: 'Please activate promo code or clear input field',
	 };
 
	 dict['RU'] = {
		 success: 'Спасибо! Данные успешно отправлены.',
		 successorder: 'Спасибо! Заказ оформлен. Пожалуйста, подождите. Идет переход к оплате...',
		 email: 'Укажите, пожалуйста, корректный email',
		 url: 'Укажите, пожалуйста, корректный URL',
		 phone: 'Укажите, пожалуйста, корректный номер телефона',
		 number: 'Укажите, пожалуйста, корректный номер',
		 date: 'Укажите, пожалуйста, корректную дату',
		 time: 'Укажите, пожалуйста, корректное время (ЧЧ:ММ)',
		 name: 'Укажите, пожалуйста, имя',
		 namerus: 'Укажите, пожалуйста, имя (только кириллица)',
		 nameeng: 'Укажите, пожалуйста, имя (только латиница)',
		 string: 'Вы написали некорректные символы. Разрешены только буквы, числа и знаки пунктуации',
		 req: 'Пожалуйста, заполните все обязательные поля',
		 reqfield: 'Обязательное поле',
		 minlength: 'Слишком короткое значение',
		 maxlength: 'Слишком длинное',
		 emptyfill: 'Ни одно поле не заполнено',
		 chosevalue: 'Пожалуйста, выберите адрес из предложенных вариантов',
		 deliveryreq: 'Невозможно оформить заказ без доставки. Пожалуйста, перезагрузите страницу и попробуйте еще раз.',
		 promocode: 'Активируйте, пожалуйста промокод или очистите поле',
	 };
 
	 if (typeof t_forms__getDict === 'function' && lang !== 'RU' && lang !== 'EN') {
		 dict = t_forms__getDict();
	 }
 
	 return dict[lang] ? dict[lang][msg] : dict['EN'][msg];
 }
 
 /**
  * Checke verification captcha
  * @param {MouseEvent} event - event
  */
 function checkVerifyTildaCaptcha(event) {
	 event = event || window.event;
	 /* IMPORTANT: Check the origin of the data! */
	 if (event.origin.indexOf(window.tildaForm.endpoint) !== -1) {
		 var tildaCaptcha = document.getElementById('js-tildaspec-captcha');
		 var formCaptchaBox = document.getElementById('tildaformcaptchabox');
 
		 if (event.data == 'closeiframe') {
			 if (formCaptchaBox) t_removeEl(formCaptchaBox);
			 if (tildaCaptcha) t_removeEl(tildaCaptcha);
			 return;
		 }
 
		 var capthaKey = event.data;
		 if (tildaCaptcha) {
			 tildaCaptcha.value = capthaKey;
			 if (formCaptchaBox) t_removeEl(formCaptchaBox);
 
			 var form = tildaCaptcha.closest('form');
			 if (form) t_forms__submitEvent(form);
		 }
	 }
 }
 
 /* Parsing a string with scripts */
 function t_parseScripts(main, className) {
	 var scripts = main.querySelectorAll(className + 'script');
	 Array.prototype.forEach.call(scripts, function (oldScript) {
		 var newScript = document.createElement('script');
 
		 for (var j = 0; j < oldScript.attributes.length; j++) {
			 var attr = oldScript.attributes[j];
			 newScript.setAttribute(attr.name, attr.value);
		 }
 
		 if (!oldScript.innerHTML.length) {
			 var script = document.createElement('script');
			 script.src = oldScript.attributes.src.value;
			 main.appendChild(script);
			 t_removeEl(oldScript);
		 } else {
			 newScript.appendChild(document.createTextNode(oldScript.innerHTML));
	   oldScript.parentNode.replaceChild(newScript, oldScript);
		 }
	 });
 }
 
 /**
  * ALL FUNCTIONS AND METHODS FOR IE8+
  */
 
 /* Array.prototype.some */
 if (!Array.prototype.some) {
	 Array.prototype.some = function (fn) {
		 'use strict';
		 if (this == null) {
			 throw new TypeError('Array.prototype.some called on null or undefined');
		 }
		 if (typeof fn !== 'function') {
			 throw new TypeError();
		 }
		 var t = Object(this);
		 var len = t.length >>> 0;
		 var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
		 for (var i = 0; i < len; i++) {
			 if (i in t && fn.call(thisArg, t[i], i, t)) {
				 return true;
			 }
		 }
		 return false;
	 };
 }
 
 /* Element.matches() */
 (function (e) {
	 var matches = e.matches || e.matchesSelector || e.webkitMatchesSelector || e.mozMatchesSelector || e.msMatchesSelector || e.oMatchesSelector;
	 !matches ? (e.matches = e.matchesSelector = function matches(selector) {
		 var matches = document.querySelectorAll(selector);
		 var th = this;
		 return Array.prototype.some.call(matches, function (e) {
			 return e === th;
		 });
	 }) : (e.matches = e.matchesSelector = matches);
 })(Element.prototype);
 
 /* Element.closest() */
 if (!Element.prototype.closest) {
	 Element.prototype.closest = function (s) {
		 var el = this;
		 while (el && el.nodeType === 1) {
			 if (Element.prototype.matches.call(el, s)) {
				 return el;
			 }
			 el = el.parentElement || el.parentNode;
		 }
		 return null;
	 };
 }
 
 /* String.trim() */
 if (!String.prototype.trim) {
	 (function () {
		 String.prototype.trim = function () {
			 return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
		 };
	 })();
 }
 
 /* Array.indexOf() */
 if (!Array.prototype.indexOf) {
	 Array.prototype.indexOf = function (searchElement, fromIndex) {
		 'use strict';
		 var k;
		 if (this == null) {
			 throw new TypeError('"this" is null or not defined');
		 }
		 var o = Object(this);
		 var len = o.length >>> 0;
		 if (len === 0) {
			 return -1;
		 }
		 var n = fromIndex | 0;
		 if (n >= len) {
			 return -1;
		 }
		 k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
		 for (; k < len; k++) {
			 if (k in o && o[k] === searchElement) {
				 return k;
			 }
		 }
		 return -1;
	 };
 }
 
 /* Function ready for IE8+ */
 function t_ready(fn) {
	 if (document.readyState != 'loading') {
		 fn();
	 } else if (document.addEventListener) {
		 document.addEventListener('DOMContentLoaded', fn);
	 } else {
		 document.attachEvent('onreadystatechange', function () {
			 if (document.readyState != 'loading') {
				 fn();
			 }
		 });
	 }
 }
 
 /* Function remove() for IE8+ */
 function t_removeEl(el) {
	 if (el && el.parentNode) {
		 el.parentNode.removeChild(el);
	 }
 }
 
 /* Checks whether there is an event or it is custom */
 var t_forms__htmlEvents = {
	 onblur: 1,
	 onchange: 1,
	 onfocus: 1,
	 onsubmit: 1,
	 onclick: 1,
	 ondblclick: 1,
	 onkeydown: 1,
	 onkeypress: 1,
	 onpaste: 1,
	 oninput: 1,
 };
 
 /* Function trigger event for IE8 */
 function t_triggerEvent(el, eventName) {
	 var event;
 
	 if (document.createEvent) {
		 event = document.createEvent('HTMLEvents');
		 event.initEvent(eventName, true, false);
	 } else if (document.createEventObject) {
		 event = document.createEventObject();
		 event.eventType = eventName;
	 }
 
	 event.eventName = eventName;
 
	 if (el.dispatchEvent) {
		 el.dispatchEvent(event);
	 } else if (el.fireEvent) {
		 el.fireEvent('on' + event.eventType, event);
	 } else if (el[eventName]) {
		 el[eventName]();
	 } else if (el['on' + eventName]) {
		 el['on' + eventName]();
	 }
 }
 
 /* Function removeEventListener for IE8+ */
 function t_removeEventListener(el, eventName, callback) {
	 if (el.removeEventListener) {
		 el.removeEventListener(eventName, callback, false);
	 } else if (el.detachEvent && t_forms__htmlEvents['on' + eventName]) {
		 el.detachEvent('on' + eventName, callback);
	 } else {
		 el['on' + eventName] = null;
	 }
 }
 
 /* Function addEventListener for IE8+ */
 function t_addEventListener(el, eventName, callback, options) {
	 if (el.addEventListener) {
		 el.addEventListener(eventName, callback, options);
	 } else if (el.attachEvent && t_forms__htmlEvents['on' + eventName]) {
		 el.attachEvent('on' + eventName, callback);
	 } else {
		 el['on' + eventName] = callback;
	 }
 }
 
 /* Function serializeArray equivalent on JS for IE8+ */
 function t_serializeArray(form) {
	 var arr = [];
	 var elements = form.querySelectorAll('input, textarea, button, select');
 
	 for (var i = 0; i < elements.length; i++) {
		 if (!elements[i].name || elements[i].disabled || ['file', 'reset', 'submit', 'button'].indexOf(elements[i].type) > -1) continue;
		 if (elements[i].type === 'select-multiple') {
			 var options = elements[i].options;
			 for (var j = 0; j < options.length; j++) {
				 if (!options[j].selected) continue;
				 arr.push({
					 name: options[j].name,
					 value: options[j].value
				 });
			 }
			 continue;
		 }
 
		 if (['checkbox', 'radio'].indexOf(elements[i].type) > -1 && !elements[i].checked) continue;
		 arr.push({
			 name: elements[i].name,
			 value: elements[i].value
		 });
	 }
 
	 return arr;
 }
 
 /* Function classList.add for IE8+ */
 function t_addClass(el, className) {
	 /* HTML 5 compliant browsers */
	 if (document.body.classList) {
		 el.classList.add(className);
		 return;
	 }
 
	 /* legacy browsers (IE<10) support */
	 el.className += (el.className ? ' ' : '') + className;
 }
 
 /* Function classList.remove for IE8+ */
 function t_removeClass(el, className) {
	 /* HTML 5 compliant browsers */
	 if (document.body.classList) {
		 el.classList.remove(className);
		 return;
	 }
 
	 /* legacy browsers (IE<10) support */
	 el.className = el.className.replace(new RegExp('(^|\\s+)' + className + '(\\s+|$)'), ' ').replace(/^\s+/, '').replace(/\s+$/, '');
 }
 
 /* Function classList.contains for IE8+ */
 function t_hasClass(el, className) {
	 if (document.body.classList) {
		 return el.classList.contains(className);
	 }
	 return new RegExp('(\\s|^)' + className + '(\\s|$)').test(el.className);
 }
 
 /* Function formData for IE8+ */
 function t_forms__formData(obj) {
	 var data = '';
	 for (var i = 0; i < obj.length; i++) {
		 if (data !== '') {
			 data += '&';
		 }
		 data += encodeURIComponent(obj[i].name) + '=' + encodeURIComponent(obj[i].value);
	 }
	 return data.replace(/%20/g, '+');
 }
 
 /* Function fade out for IE8+ */
 function t_fadeOut(el) {
	 if (el.style.display === 'none') return;
	 var opacity = 1;
	 var timer = setInterval(function () {
		 el.style.opacity = opacity;
		 opacity -= 0.1;
		 if (opacity <= 0.1) {
			 clearInterval(timer);
			 el.style.display = 'none';
			 el.style.opacity = null;
		 }
	 }, 30);
 }
 
 /* Function fade in for IE8+ */
 function t_fadeIn(el) {
	 if (el.style.display === 'block') return;
	 var opacity = 0;
	 el.style.opacity = opacity;
	 el.style.display = 'block';
	 var timer = setInterval(function () {
		 el.style.opacity = opacity;
		 opacity += 0.1;
		 if (opacity >= 1.0) {
			 clearInterval(timer);
		 }
	 }, 30);
 }
 
 /* Function isEmptyObject for IE8+ */
 function t_isEmptyObject(obj) {
	 for (var key in obj) {
		 if (Object.prototype.hasOwnProperty.call(obj, key)) {
			 return false;
		 }
	 }
	 return true;
 }