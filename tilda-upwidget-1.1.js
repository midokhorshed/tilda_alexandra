/*
 Скрипт отвечает за работу полей с типом file (<input type="file"/>)
 Подменяет стандартный тег input file с набором стилей в конструкцию с dropdown для отображения загруженного списка файлов
 В данном списке мы можем удалять файлы в момент и после загрузки, видеть размер файла и его имя
 После чего добавленные файлы можем отправлять с формой на выбранный в настройках облачный сервис с указанным api key сервиса.
*/

//////
// All method for IE

// Array.prototype.some
if (!Array.prototype.some) {
	Array.prototype.some = function(fn) {
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

// Element.matches()
(function(e) {
	var matches = e.matches || e.matchesSelector || e.webkitMatchesSelector || e.mozMatchesSelector || e.msMatchesSelector || e.oMatchesSelector;
	!matches ? (e.matches = e.matchesSelector = function matches(selector) {
		var matches = document.querySelectorAll(selector);
		var th = this;
		return Array.prototype.some.call(matches, function(e) {
			return e === th;
		});
	}) : (e.matches = e.matchesSelector = matches);
})(Element.prototype);

// Element.closest()
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

// String.prototype.trim()
if (!String.prototype.trim) {
    (function() {
        String.prototype.trim = function() {
            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        };
    })();
}

/**
 * Method ready for ie
 *
 * @param {Function} fn - callback function
 */
function t_ready(fn) {
    if (document.readyState != 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

/**
 * Method remove() for IE8+
 *
 * @param {Node} el - remove el
 */
 function t_removeEl(el) {
    if (el && el.nodeType === 1) {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }
}

/**
 * Method fadeOut for IE8+
 *
 * @param {Node} el - el fade out
 * @param {Function} fn - fn call apply
 */
 function t_fadeOut(el, fn) {
    if (el.style.display === 'none') return;
    var opacity = 1;
    var timer = setInterval(function() {
        el.style.opacity = opacity;
        opacity -= 0.1;
        if (opacity <= 0.1) {
            clearInterval(timer);
            el.style.display = 'none';
            if (typeof fn === 'function') {
                fn();
            }
        }
    }, 30);
}

if (!window.t_upwidget_lock) {
    window.t_upwidget_lock = true;
    window.t_upwidget__progressObj = {};
    window.t_upwidget__errorUpload = {};
    window.t_upwidget__xhrObj = {};
    window.t_upwidget__count = 0;

    t_ready(function() {
        setTimeout(function () {
            t_upwidget__init();
        }, 500);
    });
}

/** Init upwidget */
function t_upwidget__init() {
    var inputUpWidgets = document.querySelectorAll('input[role="upwidget-uploader"]');
    var uploadCounter = 0;
    var doneSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="t-upwidget-container__image-done" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"/><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>';
    var stopSvg = '<svg class="t-upwidget-container__data_progress_stop" width="20px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n' +
                      'viewBox="0 0 72.434 72.44" style="margin-left: 15px; cursor: pointer; vertical-align: middle; enable-background:new 0 0 72.434 72.44;" xml:space="preserve">\n' +
                      '<path style="fill:#231F20;" d="M36.22,0C16.212,0,0,16.216,0,36.227c0,19.999,16.212,36.214,36.22,36.214\n' +
                          'c20.011,0,36.214-16.215,36.214-36.214C72.434,16.215,56.231,0,36.22,0z M52.058,46.82c1.379,1.424,0.953,4.078-0.959,5.932\n' +
                          'c-1.911,1.854-4.577,2.209-5.959,0.785l-9.027-9.295l-9.298,9.027c-1.421,1.379-4.075,0.947-5.929-0.961s-2.206-4.574-0.785-5.956\n' +
                          'l9.298-9.027l-9.027-9.298c-1.379-1.421-0.946-4.078,0.962-5.932c1.905-1.851,4.577-2.204,5.953-0.785l9.027,9.297l9.301-9.023\n' +
                          'c1.424-1.382,4.078-0.95,5.929,0.958c1.857,1.908,2.206,4.577,0.785,5.959l-9.295,9.024L52.058,46.82z"/>\n' +
                  '</svg>';

    t_upwidget__addStyle();

    Array.prototype.forEach.call(inputUpWidgets, function(input) {
        window.t_upwidget__count++;
        t_upwidget__inputInit(input);
    });

    /**
     * Init handler add file in input
     *
     * @param {Node} input - input file element
     */
    function t_upwidget__inputInit(input) {
        var parent = input.parentNode;

        input.style.display = 'none';
        parent.insertAdjacentHTML('afterbegin', '<div class="t-upwidget-container"></div>');

        var upWidgetContainer   = parent.querySelector('.t-upwidget-container');
        var upWidgetContainerId = (Math.random() + '').substr(2);

        upWidgetContainer.append(input);

        var btnSubmit = upWidgetContainer.closest('form').querySelector('.t-submit');
        var styleArr = btnSubmit.getAttribute('style').split(';');
        var colorSet = false;
        var bgColorSet = false;
        var getStyle = [];
        var groupStyle = [];
        var styleStr = '';

        for (var key in styleArr) {
            if (!styleArr[key]) continue;

            var style = styleArr[key].split(':');

            getStyle[style[0].trim()] = style[1].trim();
        }

        if (!getStyle['color']) {
            groupStyle['color'] = t_upwidget__getStringToRGBArray(getComputedStyle(btnSubmit).color);
        } else {
            if (getStyle['color'].indexOf('rgb') > -1) {
                groupStyle['color'] = t_upwidget__getStringToRGBArray(getStyle['color']);
            } else {
                groupStyle['color'] = t_upwidget__getHEX_to_RGBArray(getStyle['color']);
            }
            colorSet = true;
        }

        if (!getStyle['background-color'] || getStyle['background-color'].indexOf('transparent') > -1) {
            groupStyle['background-color'] = t_upwidget__getStringToRGBArray(getComputedStyle(btnSubmit).backgroundColor);
        } else {
            if (getStyle['background-color'].indexOf('rgb') > -1) {
                groupStyle['background-color'] = t_upwidget__getStringToRGBArray(getStyle['background-color']);
            } else {
                groupStyle['background-color'] = t_upwidget__getHEX_to_RGBArray(getStyle['background-color']);
            }
            bgColorSet = true;
        }

        if (!getStyle['border-radius']) {
            groupStyle['border-radius'] = getComputedStyle(btnSubmit).borderRadius;
        } else {
            groupStyle['border-radius'] = getStyle['border-radius'];
        }

        if (!getStyle['font-family']) {
            groupStyle['font-family'] = getComputedStyle(btnSubmit).fontFamily;
        } else {
            groupStyle['font-family'] = getStyle['font-family'];
        }

        if (!getStyle['font-size']) {
            groupStyle['font-size'] = getComputedStyle(btnSubmit).fontSize;
        } else {
            groupStyle['font-size'] = getStyle['font-size'];
        }

        if (colorSet && bgColorSet) {
            t_upwidget__getDeltaE(groupStyle['color'], groupStyle['background-color']);
            if (groupStyle['background-color'] && groupStyle['color'] && t_upwidget__getDeltaE(groupStyle['color'], groupStyle['background-color']) > 40) {
                groupStyle['color'] = t_upwidget__getRGB_to_HEX(parseInt(groupStyle['color'][0], 10), parseInt(groupStyle['color'][1], 10), parseInt(groupStyle['color'][2], 10));
                groupStyle['background-color'] = t_upwidget__getRGB_to_HEX(parseInt(groupStyle['background-color'][0], 10), parseInt(groupStyle['background-color'][1], 10), parseInt(groupStyle['background-color'][2], 10));

                for (var key in groupStyle) {
                    if (key === 'font-family' && groupStyle[key].indexOf('"') !== -1) {
                        groupStyle[key] = groupStyle[key].replace(/"/g, '\'');
                    }
                    styleStr += key + ':' + groupStyle[key] + ';';
                }

                styleStr = 'style="' + styleStr + '"';
            }
        }

        var dataName = input.getAttribute('name');
        var dataKey = input.getAttribute('data-tilda-upwidget-key');
        var dataReq = input.getAttribute('data-tilda-req');

        if (dataName) upWidgetContainer.setAttribute('data-tilda-name', dataName);
        if (dataKey) upWidgetContainer.setAttribute('data-tilda-upwidget-key', dataKey);
        if (dataReq) upWidgetContainer.setAttribute('data-tilda-req', dataReq);
        if (upWidgetContainerId) upWidgetContainer.setAttribute('id', upWidgetContainerId);

        if (input.getAttribute('data-tilda-upwidget-multiple')) {
            upWidgetContainer.setAttribute('data-tilda-upwidget-multiple', 'true');
            upWidgetContainer.insertAdjacentHTML('beforeend', '<div ' + styleStr + ' class="t-upwidget-container__button t-text">' + t_upwidget_dict('addFiles') + '</div>');
        } else {
            upWidgetContainer.setAttribute('data-tilda-upwidget-multiple', 'false');
            upWidgetContainer.insertAdjacentHTML('beforeend', '<div ' + styleStr + ' class="t-upwidget-container__button t-text">' + t_upwidget_dict('addFile') + '</div>');
        }

        upWidgetContainer.insertAdjacentHTML('beforeend', '<div class="t-upwidget-container__data"><div class="t-upwidget-container__button-indiv t-text">' + t_upwidget_dict('addMoreFiles') + '</div></div>');

        if (upWidgetContainer.getAttribute('data-tilda-req') === '1') {
            upWidgetContainer.insertAdjacentHTML('beforeend', '<input type="hidden" value="" class="js-tilda-rule" name="' + upWidgetContainer.getAttribute('data-tilda-name') + '" data-tilda-req="1">');
        }

        var btnContainer = upWidgetContainer.querySelector('.t-upwidget-container__button');

        t_upwidget__getAcceptMime(upWidgetContainer);
        t_removeEl(input);

        btnContainer.addEventListener('click', t_upwidget__containerButtonClick);
        btnContainer.addEventListener('drop', t_upwidget__containerButtonDrop);
        btnContainer.addEventListener('dragover', t_upwidget__containerButtonDrag);
        btnContainer.addEventListener('dragleave', t_upwidget__containerButtonDrag);
        upWidgetContainer.addEventListener('click', t_upwidget__containerClickButtonIndiv);
        document.addEventListener('keyup', t_upwidget__waitESCpressed);
        document.addEventListener('click', t_upwidget__waitCLICKdone);
    }

    /**
     * Get types file and max count file
     *
     * @param {Node} container - wrap element
     */
    function t_upwidget__getAcceptMime(container) {
        var xhr = new XMLHttpRequest();
        var url = 'https://upwidget.tildacdn.com/upload/?get_mime=' + container.getAttribute('data-tilda-upwidget-key');

        xhr.open('GET', url, true);
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 400) {
                var data = xhr.responseText;
                if (data) {
                    try {
                        var objData = JSON.parse(data);
                        if (!objData['fail']) {
                            container.setAttribute('data-tilda-accept', objData.mime);
                            if (objData.size) {
                                container.setAttribute('data-tilda-upwidget-file-size', objData.size);
                            } else {
                                container.setAttribute('data-tilda-upwidget-file-size', 31457280);
                            }
                        }
                    } catch (error) {
                        container.setAttribute('data-tilda-accept', '');
                    }
                }
            }
        };

        xhr.onerror = function() {
            // eslint-disable-next-line no-console
            console.log('Fatal error: ' + xhr);
            container.setAttribute('data-tilda-accept', '');
            return;
        };

        xhr.send();
    }

    /** Init clicl by btn add file in input and add change/trigger event for input file */
    function t_upwidget__containerButtonClick() {
        var btn = this;

        if (btn.classList.contains('t-upwidget-container__button_disabled') || btn.classList.contains('t-upwidget-multi-button')) {
            return;
        }

        var container = btn.closest('.t-upwidget-container');
        var multiple = '';

        if (!container.getAttribute('data-tilda-upwidget-key')) {
            btn.style.pointerEvents = 'none';
            btn.insertAdjacentHTML('afterend', t_upwidget_dict('keyNotSpecified') + '<br>' + t_upwidget_dict('instruction'));
            return;
        }

        if (container.querySelectorAll('input[type="file"]').length === 0) {
            multiple = container.getAttribute('data-tilda-upwidget-multiple') === 'true' ? 'multiple="true"' : '';
            container.insertAdjacentHTML('beforeend', '<input type="file" size="' + container.getAttribute('data-tilda-upwidget-file-size') + '" role="upwidget-uploader-file" ' + multiple + ' accept="' + container.getAttribute('data-tilda-accept') + '" style="display: none;">');
        }

        var inputFile = container.querySelector('input[type="file"][role="upwidget-uploader-file"]');

        inputFile.click();
        inputFile.removeEventListener('change', t_upwidget__listenFileChange);
        inputFile.addEventListener('change', t_upwidget__listenFileChange);
    }

    /**
     * Click by btn add file or  to change
     *
     * @param {MouseEvent} event - event
     * @returns {undefined}
     */
    function t_upwidget__containerClickButtonIndiv(event) {
        var target = event.target;

        if (!target.closest('.t-upwidget-container__button-indiv')) return;

        var btn = target.closest('.t-upwidget-container__button-indiv');

        if (btn.classList.contains('t-upwidget-container__button_disabled')) return;

        var container = btn.closest('.t-upwidget-container');
        var multiple = '';

        if (container.querySelectorAll('input[type="file"]').length === 0) {
            multiple = container.getAttribute('data-tilda-upwidget-multiple') === 'true' ? 'multiple="true"' : '';
            container.insertAdjacentHTML('beforeend', '<input type="file" size="' + container.getAttribute('data-tilda-upwidget-file-size') + '" role="upwidget-uploader-file" ' + multiple + ' accept="' + container.getAttribute('data-tilda-accept') + '" style="display: none;">');
        }

        if (!multiple) {
            delete window.t_upwidget__errorUpload[container.id];
        }

        var input = container.querySelector('input[type="file"][role="upwidget-uploader-file"]');

        input.click();
        input.removeEventListener('change', t_upwidget__listenFileChange);
        input.addEventListener('change', t_upwidget__listenFileChange);
    }

    /** Change input file */
    function t_upwidget__listenFileChange() {
        var inputFile = this;
        var container = inputFile.closest('.t-upwidget-container');
        t_upwidget__getFiles(container, inputFile.files);
        t_removeEl(inputFile);
    }

    /**
     * Get files
     *
     * @param {Node} container - container upwidget
     * @param {object} files - files object
     * @returns {undefined}
     */
    function t_upwidget__getFiles(container, files) {
        var containerData = container.querySelector('.t-upwidget-container__data');

        if (files.length === 0) return;

        var fileCount = t_upwidget__countFilesInContainer(containerData);
        var canUpload = 10 - fileCount;
        var id = container.getAttribute('id');
        var dataMultiple = container.getAttribute('data-tilda-upwidget-multiple');

        if (files.length > 10) {
            var btn = container.querySelector('.t-upwidget-container__button');

            btn.textContent = t_upwidget_dict('maxFiles');
            btn.classList.add('t-upwidget-container__button_error');
            btn.classList.remove('t-upwidget-container__button_fileholder');
            return;
        }

        if (dataMultiple === 'true') {
            if ((fileCount + files.length) >= 10) {
                t_upwidget__showGlobalError(containerData);
            }
        } else {
            canUpload = 1;
        }

        if (files.length < canUpload) {
            canUpload = files.length;
        }

        for (var i = 0; i < canUpload; i++) {
            if (dataMultiple === 'false') {
                containerData.innerHTML = '';
                containerData.insertAdjacentHTML('beforeend', '<div class="t-upwidget-container__button-indiv t-text">' + t_upwidget_dict('replace') + '</div>');
            }

            containerData.insertAdjacentHTML('beforeend', t_upwidget__getFileDescription(files[i]));

            var lastTable = containerData.querySelectorAll('table:last-child')[0];
            var progress = lastTable.querySelector('.t-upwidget-container__data_progress_back');
            var btnProgressStop = lastTable.querySelector('.t-upwidget-container__data_progress_stop');

            t_upwidget__sendFile(files[i], container, progress, id);
            btnProgressStop.removeEventListener('click', t_upwidget__containerProgressStop);
            btnProgressStop.addEventListener('click', t_upwidget__containerProgressStop);
        }
    }

    /**
     * Show global error if the limit is exceeded
     *
     * @param {Node} containerData - block container
     */
    function t_upwidget__showGlobalError(containerData) {
        if (!containerData.querySelector('.t-upwidget-container__globalerror')) {
            var buttonIndiv = containerData.querySelector('.t-upwidget-container__button-indiv');

            buttonIndiv.insertAdjacentHTML('beforebegin', '<span class="t-upwidget-container__globalerror">' + t_upwidget_dict('noMoreUpload') + '</span>');
            buttonIndiv.classList.add('t-upwidget-container__button_disabled');
        }
    }

    /**
     * Get file description in node element
     *
     * @param {object} file - object file
     * @returns {string} - table node string
     */
    function t_upwidget__getFileDescription(file) {
        var fileExtens = '.' + file.name.split('.').pop();
        var fileName = file.name.substr(0, file.name.length - fileExtens.length);

        if (fileName.length > 14) {
            fileExtens = (fileName.substr(fileName.length - 7)).trim() + fileExtens;
            fileName = (fileName.substr(0, fileName.length - 7)).trim();
        }

        fileName = fileName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

        var fileTable = '' +
            '<table class="t-upwidget-container__data_table t-text">\n' +
                '<tbody>\n' +
                    '<tr>\n' +
                        '<td rowspan="2" class="t-upwidget-container__data_table_image">\n' +
                            '<svg xmlns="http://www.w3.org/2000/svg" width="28" style="vertical-align: middle;" viewBox="0 0 64 64"><style>.a{fill:none;stroke-width:2;stroke:#000;}</style><polygon points="23 1 55 1 55 63 9 63 9 15 " class="a"/><polyline points="9 15 23 15 23 1 " class="a"/></svg>\n' +
                        '</td>\n' +
                        '<td class="t-upwidget-container__data_table_fileinfo">\n' +
                            '<div class="t-upwidget-container__data_filename">' + fileName + '</div><div class="t-upwidget-container__data_fileextension">' + fileExtens + '</div>' +
                            '<div class="t-upwidget-container__data_filesize">' + t_upwidget__getHRFilesize(file.size) + '</div>' +
                        '</td>\n' +
                    '</tr>\n' +
                    '<tr>\n' +
                        '<td class="t-upwidget-container__data_table_actions">\n' +
                            '<div class="t-upwidget-container__data_progress">\n' +
                                '<div class="t-upwidget-container__data_progress_back"></div>\n' +
                            '</div>\n' + stopSvg +
                        '</td>\n' +
                    '</tr>\n' +
                '</tbody>\n' +
            '</table>';
        return fileTable;
    }

    /**
     * Hide file list when pressing enter
     *
     * @param {KeyboardEvent} e - event
     */
    function t_upwidget__waitESCpressed(e) {
        if (e.keyCode == 27) {
            t_upwidget__hideFilelist();
        }
    }

    /**
     * Hide file list when click out block
     *
     * @param {MouseEvent} e - event
     */
    function t_upwidget__waitCLICKdone(e) {
        var target = e.target;
        var containerData = target.closest('.t-upwidget-container__data');
        var containerButton = target.closest('.t-upwidget-container__button');
        var inputFile = target.getAttribute('type') === 'file' ? true : false;

        if (containerButton || inputFile) return;

        if (!containerData) {
            t_upwidget__hideFilelist();
        }
    }

    /**
     * Sending data
     *
     * @param {object} file - obj data file
     * @param {Node} container - block container
     * @param {Node} progress - block progress bar
     * @param {string} id - id container
     */
    function t_upwidget__sendFile(file, container, progress, id) {
        var url = 'https://upwidget.tildacdn.com/upload/';
        var upKey = container.getAttribute('data-tilda-upwidget-key');
        var xhr = new XMLHttpRequest();
        var formData = new FormData();
        var containerData = container.querySelector('.t-upwidget-container__data');
        var currentUpload = ++uploadCounter;

        if (!window.t_upwidget__progressObj[id]) {
            window.t_upwidget__progressObj[id] = {};
        }

        window.t_upwidget__progressObj[id][currentUpload] = 0;

        if (!window.t_upwidget__xhrObj[id]) {
            window.t_upwidget__xhrObj[id] = [];
        }

        if (!window.t_upwidget__errorUpload[id]) {
            window.t_upwidget__errorUpload[id] = [];
        }

        // remember to interrupt
        var wrapBtnRemove = progress.closest('.t-upwidget-container__data_table_actions');
        var svg = wrapBtnRemove.querySelector('svg');

        window.t_upwidget__xhrObj[id][currentUpload] = xhr;
        svg.setAttribute('curUPL', currentUpload);

        formData.append(upKey, file);

        xhr.open('POST', url, true);
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 400) {
                var data = xhr.responseText;
                if (data) {
                    try {
                        var objData = JSON.parse(data);

                        if (!objData['fail']) {
                            t_upwidget__buttonValue(container, id);
                        } else {
                            t_upwidget__errorFn(objData);
                            return;
                        }

                        window.t_upwidget__progressObj[id][currentUpload] = 100;

                        var fileLink = objData[0];
                        var strHTML = '<div class="t-upwidget-container__data_table_actions_remove" fileid="' + fileLink['url'] + '/' + encodeURIComponent(fileLink['filename']) + '">' +
                                        '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16" viewBox="0 0 14 18"><g style="fill:none;stroke-width:1;stroke:none"><g fill="#000"><path d="M1 16C1 17.1 1.9 18 3 18L11 18C12.1 18 13 17.1 13 16L13 4 1 4 1 16ZM14 1L10.5 1 9.5 0 4.5 0 3.5 1 0 1 0 3 14 3 14 1Z"/></g></g></svg>\n' +
                                      '</div>';

                        wrapBtnRemove.innerHTML = strHTML;
                        containerData.insertAdjacentHTML('beforeend', '<input type="hidden" value="' + fileLink['url'] + '/' + encodeURIComponent(fileLink['filename']) + '">');

                        t_upwidget__rewriteInputs(containerData);
                        t_upwidget__buttonValue(container, id);

                        var btnSvg = wrapBtnRemove.querySelector('.t-upwidget-container__data_table_actions_remove svg');
                        btnSvg.addEventListener('click', t_upwidget__containerClickTableActions);
                    } catch (error) {
                        // eslint-disable-next-line no-console
                        console.log('JSON Error: ' + error);
                    }
                }
            }

            /**
             * Error load file
             *
             * @param {object} objData - received object when sending
             */
            function t_upwidget__errorFn(objData) {
                window.t_upwidget__progressObj[id][currentUpload] = 100;
                window.t_upwidget__errorUpload[id][currentUpload] = t_upwidget_dict('uploadError') + ' ' + objData.error;
                wrapBtnRemove.innerHTML = ('<span style="font-size: small; color: red">' + t_upwidget_dict('uploadError') + ' ' + objData.error + '</span>' + stopSvg);
                t_upwidget__buttonValue(container, id);
            }
        };

        xhr.onerror = function() {
            // eslint-disable-next-line no-console
            console.log('Fatal error: ' + xhr);
            window.t_upwidget__progressObj[id][currentUpload] = 100;
            t_upwidget__buttonValue(container, id);
            wrapBtnRemove.innerHTML = (t_upwidget_dict('fileUploadError') + stopSvg);
        };

        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                var percentage = Math.round((e.loaded * 100) / e.total);

                if (percentage == 100) {
                    percentage = 99;
                }

                window.t_upwidget__progressObj[id][currentUpload] = percentage;
                progress.style.width = percentage + '%';
                t_upwidget__buttonValue(container, id);
            }
        }, false);

        xhr.send(formData);
    }

    /**
     * Add new hidden input value
     *
     * @param {Node} containerData - block data container
     */
    function t_upwidget__rewriteInputs(containerData) {
        var name = containerData.closest('.t-upwidget-container').getAttribute('data-tilda-name');
        var upFiles = [];
        var hiddenInputs = containerData.querySelectorAll('input[type=hidden]');

        Array.prototype.forEach.call(hiddenInputs, function(input) {
            upFiles.push(input.value);
            t_removeEl(input);
        });

        var html = '';

        for (var i = 0; i < upFiles.length; i++) {
            if (window.t_upwidget__count > 1) {
                html += '<input name="' + name + '_' + i + '" type="hidden" value="' + upFiles[i] + '">';
            } else if (i == 0) {
                html += '<input name="' + name + '" type="hidden" value="' + upFiles[i] + '">';
            } else {
                html += '<input name="' + name + '_' + i + '" type="hidden" value="' + upFiles[i] + '">';
            }

        }
        containerData.insertAdjacentHTML('beforeend', html);
    }

    /**
     * Add value in button
     *
     * @param {Node} container - container element
     * @param {string} id - container id
     */
    function t_upwidget__buttonValue(container, id) {
        var button = container.querySelector('.t-upwidget-container__button');
        var counter = 0;
        var percentDone = 0;

        for (var key in window.t_upwidget__progressObj[id]) {
            counter++;
            percentDone += window.t_upwidget__progressObj[id][key];
        }

        percentDone = Math.round(percentDone / counter);

        // indicates that downloads are complete
        if (percentDone === 100) {
            var filesCount = t_upwidget__countFilesInContainer(container.querySelector('.t-upwidget-container__data'));
            var strError = '';

            if (window.t_upwidget__errorUpload[id] && window.t_upwidget__errorUpload[id].length > 0) {
                for (var e in window.t_upwidget__errorUpload[id]) {
                    strError = window.t_upwidget__errorUpload[id][e];
                }
                button.textContent = strError;
                button.classList.add('t-upwidget-container__button_error', 't-upwidget-multi-button');
                button.classList.remove('t-upwidget-container__button_fileholder');
                return;
            }

            button.classList.remove('t-upwidget-container__button_error');

            switch (filesCount) {
                case 0:
                    t_upwidget__hideFilelist();

                    var text = container.getAttribute('data-tilda-upwidget-multiple') === 'false' ?
                        t_upwidget_dict('addFile') : t_upwidget_dict('addFiles');

                    button.textContent = text;
                    button.classList.remove('t-upwidget-multi-button', 't-upwidget-container__button_fileholder');
                    button.removeEventListener('click', t_upwidget__containerMultiButton);
                    break;
                case 1:
                    var fileName = container.querySelector('.t-upwidget-container__data_filename');
                    var fileExtension = container.querySelector('.t-upwidget-container__data_fileextension');

                    button.classList.add('t-upwidget-multi-button', 't-upwidget-container__button_fileholder');
                    button.innerHTML = doneSvg;
                    button.append(fileName.cloneNode(true), fileExtension.cloneNode(true));
                    button.removeEventListener('click', t_upwidget__containerMultiButton);
                    button.addEventListener('click', t_upwidget__containerMultiButton);
                    break;
                default:
                    button.classList.add('t-upwidget-multi-button', 't-upwidget-container__button_fileholder');
                    button.innerHTML = doneSvg + t_upwidget_dict('uploaded') + ' ' + filesCount + t_upwidget_dict('files');
                    button.removeEventListener('click', t_upwidget__containerMultiButton);
                    button.addEventListener('click', t_upwidget__containerMultiButton);
                    break;
            }
        } else {
            button.classList.remove('t-upwidget-container__button_error');
            button.classList.add('t-upwidget-multi-button');
            button.textContent = t_upwidget_dict('uploading') + ' ' + percentDone + '%';
            button.removeEventListener('click', t_upwidget__containerMultiButton);
            button.addEventListener('click', t_upwidget__containerMultiButton);
        }

        t_upwidget__ifFileRequired(container);
    }

    /** Delete added file button */
    function t_upwidget__containerClickTableActions() {
        var fileId = this.closest('.t-upwidget-container__data_table_actions_remove').getAttribute('fileid');
        var container = this.closest('.t-upwidget-container');
        var containerData = container.querySelector('.t-upwidget-container__data');
        var hiddenInputs = containerData.querySelectorAll('input[type="hidden"]');
        var table = this.closest('.t-upwidget-container__data_table');

        Array.prototype.forEach.call(hiddenInputs, function (input) {
            if (input.value === fileId) {
                t_removeEl(input);
            }
        });

        t_fadeOut(table, function() {
            t_removeEl(table);
            t_upwidget__rewriteInputs(containerData);
            t_upwidget__buttonValue(container, container.getAttribute('id'));
        });


        if (t_upwidget__countFilesInContainer(containerData) < 10) {
            var globalError = container.querySelector('.t-upwidget-container__globalerror');

            container.querySelector('.t-upwidget-container__button-indiv').classList.remove('t-upwidget-container__button_disabled');

            if (globalError) {
                t_fadeOut(globalError, function() {
                    t_removeEl(globalError);
                });
            }
        }
    }

    /** Stop load file progress */
    function t_upwidget__containerProgressStop() {
        var svg = this;
        var container = svg.closest('.t-upwidget-container');
        var table = svg.closest('.t-upwidget-container__data_table');
        var globalError = container.querySelector('.t-upwidget-container__globalerror');
        var containerId = container.getAttribute('id');
        var urlId = svg.getAttribute('curUPL');

        if (window.t_upwidget__xhrObj[containerId][urlId]) {
            window.t_upwidget__xhrObj[containerId][urlId].abort();
            window.t_upwidget__progressObj[containerId][urlId] = 100;
        }

        if (window.t_upwidget__errorUpload[containerId][urlId]) {
            delete window.t_upwidget__errorUpload[[containerId][urlId]];
        }

        t_fadeOut(table, function() {
           t_removeEl(table);
           t_upwidget__buttonValue(container, containerId);
        });

        if (t_upwidget__countFilesInContainer(container) < 10) {
            container.querySelector('.t-upwidget-container__button-indiv').classList.remove('t-upwidget-container__button_disabled');

            if (globalError) {
                t_fadeOut(globalError, function() {
                    t_removeEl(globalError);
                });
            }
        }
    }

    /**
     * Hide file list
     *
     * @returns {number} - count hide file list
     */
    function t_upwidget__hideFilelist() {
        var count = 0;
        var containerData = document.querySelectorAll('.t-upwidget-container__data');

        Array.prototype.forEach.call(containerData, function (container) {
            if (container.classList.contains('t-upwidget__show-files')) {
                count++;
                container.classList.remove('t-upwidget__show-files');
            }
        });

        return count;
    }

    /** Checked input file on the multi add files */
    function t_upwidget__containerMultiButton() {
        if (t_upwidget__hideFilelist() > 0) {
            return;
        }

        var btn = this;
        var containerData = btn.closest('.t-upwidget-container').querySelector('.t-upwidget-container__data');

        containerData.classList.add('t-upwidget__show-files');
    }

    /**
     * Check required input
     *
     * @param {Node} container - containder element
     */
    function t_upwidget__ifFileRequired(container) {
        var filesCount = t_upwidget__countFilesInContainer(container.querySelector('.t-upwidget-container__data'));

        if (filesCount === 0 && container.getAttribute('data-tilda-req') === '1') {
            if (container.querySelectorAll('input[type="hidden"][data-tilda-req="1"]').length === 0) {
                container.insertAdjacentHTML('beforeend', '<input type="hidden" class="js-tilda-rule" value="" name="' + container.getAttribute('data-tilda-name') + '" data-tilda-req="1">');
            }
        } else {
            t_removeEl(container.querySelector('input[type="hidden"][data-tilda-req="1"]'));
        }
    }

    /**
     * Get count files in container
     *
     * @param {Node} containerData - container drop down
     * @returns {number} - count files
     */
    function t_upwidget__countFilesInContainer(containerData) {
        return containerData.querySelectorAll('input[type="hidden"]').length;
    }

    /**
     * Drag event
     *
     * @param {MouseEvent} e - event
     */
    function t_upwidget__containerButtonDrag(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * Drop event
     *
     * @param {MouseEvent} e - event
     */
    function t_upwidget__containerButtonDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        var files = e.dataTransfer.files;
        t_upwidget__getFiles(this.closest('.t-upwidget-container'), files);
    }

    /**
     * Get size file
     *
     * @param {number} size - file size in bytes
     * @returns {string} - size and unit of measurement
     */
    function t_upwidget__getHRFilesize(size) {
        var rSize = size;
        var iterCount = -1;
        var siZ = {};

        siZ['RU'] = ['КБ', 'МБ', 'ГБ', 'ТБ'];
        siZ['EN'] = ['KB', 'MB', 'GB', 'TB'];

        do {
            rSize = rSize / 1000;
            iterCount++;
        } while (rSize > 1000);

        rSize = Math.round(rSize * 10) / 10;

        return rSize + siZ[window.browserLang === 'RU' ? 'RU' : 'EN'][iterCount];
    }
}

/** Add style in document */
function t_upwidget__addStyle() {
    var upWidgets = document.querySelectorAll('.t-upwidget-container');
    var style = document.getElementById('tilda-upwidget-style');

    if (upWidgets.length === 0 && !style) {
        var styleStr = '<style id="tilda-upwidget-style">.t-upwidget-container{position:relative}.t-upwidget-container__image-done{vertical-align:middle;margin-left:0;margin-right:8px;filter:contrast(4) invert(1)}.t-upwidget-container__button,.t-upwidget-container__button-indiv{font-weight:400;white-space:nowrap;background-color:#000;color:#fff;text-align:center;cursor:pointer}.t-upwidget-container__button-indiv{line-height:30px;width:150px;padding:0;vertical-align:middle;height:30px;margin:0 0 30px 30px}.t-upwidget__show-files.t-upwidget-container__data{display:block;width:320px!important;text-align:left;overflow-y:auto;max-height:80vh;background-color:#fff;z-index:9999;padding-top:20px;position:absolute;box-shadow:0 2px 10px rgba(0,0,0,.1);border:1px solid rgba(0,0,0,.05)}.t-upwidget-container__button{max-width:250px;overflow:hidden;text-overflow:ellipsis;display:table;padding:0 20px;line-height:38px!important}.t-upwidget-container__button.t-upwidget-container__button_error{text-align:left;color:red;padding:0 12px;font-size:small}.t-upwidget-container__button.t-upwidget-container__button_fileholder{text-align:left;color:#fff;padding:0 12px}.t-upwidget-container__button_disabled{opacity:.6;cursor:default}.t-upwidget-container__data{display:none}.t-upwidget-container__data_table{table-layout:fixed;font-size:14px;padding:0;margin:0 0 15px}.t-upwidget-container__data_table_image{width:35px;padding:0;margin:0;text-align:center}.t-upwidget-container__data_table_fileinfo{white-space:nowrap;padding:0;margin:0;vertical-align:bottom}.t-upwidget-container__data_table_actions_remove svg{cursor:pointer}.t-upwidget-container__data_filename{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:120px}.t-upwidget-container__data_fileextension,.t-upwidget-container__data_filename{padding:0;margin:0;display:inline-block;vertical-align:middle}.t-upwidget-container__data_filesize{padding-left:2px;opacity:.6;display:inline-block;vertical-align:middle}.t-upwidget-container__data_progress{width:65%;height:6px;vertical-align:middle;display:inline-block;border:1px solid gray;opacity:.7}.t-upwidget-container__data_progress_back{background-color:gray;width:0;height:100%}.t-upwidget-container__globalerror{font-weight:700;margin:10px;display:block}.t-form.js-error-control-box.t-upwidget-container__button{border:1px solid red!important}</style>';
        document.head.insertAdjacentHTML('beforeend', styleStr);
    }
}

/**
 * Get the delta E permissible deviation in the color value
 *
 * @param {Array} rgb1 - arr color rgb 1
 * @param {Array} rgb2 - arr color rgb 2
 * @returns {number} - return delta
 */
function t_upwidget__getDeltaE(rgb1, rgb2) {
    var lab1 = t_upwidget__getRGB_to_LAB(rgb1);
    var lab2 = t_upwidget__getRGB_to_LAB(rgb2);
    var ret = Math.sqrt(
        (lab1[0] - lab2[0]) * (lab1[0] - lab2[0]) +
        (lab1[1] - lab2[1]) * (lab1[1] - lab2[1]) +
        (lab1[2] - lab2[2]) * (lab1[2] - lab2[2])
    );
    return ret;
}

/**
 * Get convert RBG to LAB color
 *
 * @param {Array} rgb - arr color rgb
 * @returns {Array} -
 */
function t_upwidget__getRGB_to_LAB(rgb) {
    return t_upwidget__getXYZ_to_LAB(t_upwidget__getRGB_to_XYZ(rgb));
}

/**
 * Convert RGB to XYZ color (Algorithm) http://www.easyrgb.com/en/math.php
 *
 * @param {Array} rgb - arr RGB color
 * @returns {Array} - XYZ color
 */
function t_upwidget__getRGB_to_XYZ(rgb) {
    // sR, sG and sB (Standard RGB) input range = 0 ÷ 255
    // X, Y and Z output refer to a D65/2° standard illuminant.
    var varR = parseFloat(rgb[0] / 255.0);
    var varG = parseFloat(rgb[1] / 255.0);
    var varB = parseFloat(rgb[2] / 255.0);

    if (varR > 0.04045) {
        varR = Math.pow(parseFloat((varR + 0.055) / 1.055), 2.4);
    } else {
        varR = parseFloat(varR / 12.92);
    }
    if (varG > 0.04045) {
        varG = Math.pow(parseFloat((varG + 0.055) / 1.055), 2.4);
    } else {
        varG = parseFloat(varG / 12.92);
    }
    if (varB > 0.04045) {
        varB = Math.pow(parseFloat((varB + 0.055) / 1.055), 2.4);
    } else {
        varB = parseFloat(varB / 12.92);
    }

    varR = varR * 100.0;
    varG = varG * 100.0;
    varB = varB * 100.0;

    var X = varR * 0.4124 + varG * 0.3576 + varB * 0.1805;
    var Y = varR * 0.2126 + varG * 0.7152 + varB * 0.0722;
    var Z = varR * 0.0193 + varG * 0.1192 + varB * 0.9505;

    return [X, Y, Z];
}

/**
 * Convert XYZ to LAB color (Algorithm) http://www.easyrgb.com/en/math.php
 *
 * @param {Array} xyz - arr XYZ color
 * @returns {Array} - LAB color
 */
function t_upwidget__getXYZ_to_LAB(xyz) {
    var varX = parseFloat(xyz[0] / 100.0);
    var varY = parseFloat(xyz[1] / 100.0);
    var varZ = parseFloat(xyz[2] / 100.0);

    if (varX > 0.008856) {
        varX = Math.pow(varX, (1 / 3));
    } else {
        varX = (7.787 * varX) + (16 / 116);
    }
    if (varY > 0.008856) {
        varY = Math.pow(varY, (1 / 3));
    } else {
        varY = (7.787 * varY) + (16 / 116);
    }
    if (varZ > 0.008856) {
        varZ = Math.pow(varZ, (1 / 3));
    } else {
        varZ = (7.787 * varZ) + (16 / 116);
    }

    var L = (116 * varY) - 16;
    var A = 500 * (varX - varY);
    var B = 200 * (varY - varZ);
    return [L, A, B];
}

/**
 * Convert string to RGB array
 *
 * @param {string} color - str color
 * @returns {Array} -
 */
function t_upwidget__getStringToRGBArray(color) {
    if (!color || color.indexOf('rgb') !== 0) {
        return [0, 0, 0];
    }

    var rgb = color.split('(')[1].split(')')[0].split(',');

    if (rgb.length < 3) {
        return [0, 0, 0];
    }

    return rgb;
}

/**
 * Convert string hex color to RGB array
 *
 * @param {string} hex - str hex color
 * @returns {Array | null} -
 */
function t_upwidget__getHEX_to_RGBArray(hex) {
    // expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var rgbObj = result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
    return result ? [rgbObj.r, rgbObj.g, rgbObj.b] : null;
}

/**
 *
 * @param {number} r - red
 * @param {number} g - green
 * @param {number} b - blue
 * @returns {string} - hexadecimal code color
 */
function t_upwidget__getRGB_to_HEX(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Get message
 *
 * @param {string} msg - key array
 * @returns {string} - massage string
 */
function t_upwidget_dict(msg) {
    var dict = [];

    dict['fileUploadError'] = {
        'EN': 'File upload error',
        'RU': 'Ошибка при загрузке файла',
        'FR': 'Erreur de téléchargement de fichier',
        'DE': 'Datei upload fehler',
        'ES': 'Error de carga de archivos',
        'PT': 'de erro de upload de arquivo',
        'UK': 'Помилка при завантаженні файлу',
        'JA': 'ファイルアップロードエラー',
        'ZH': '文件上传错误',
        'PL': 'Błąd ładowania pliku',
        'KK': 'Файл қотару қатесі',
        'IT': 'Errore di caricamento del file',
        'LV': 'Failu augšupielādes kļūda',
    };

    dict['noMoreUpload'] = {
        'EN': 'You can upload no more than 10 files',
        'RU': 'Вы можете загрузить не более 10 файлов',
        'FR': 'Vous pouvez télécharger un maximum de 10 fichiers',
        'DE': 'Sie können nicht mehr als 10 Dateien hochladen',
        'ES': 'Puede cargar un máximo de 10 archivos',
        'PT': 'Você pode fazer upload de não mais de 10 arquivos',
        'UK': 'Ви можете завантажити не більше 10 файлів',
        'JA': 'あなたは10個の以下のファイルをアップロードすることはできません',
        'ZH': '您可以上传不超过10个文件',
        'PL': 'Nie można załadować więcej 10 plików',
        'KK': 'Сіз артық емес 10 файлдарды жүктеуге болады',
        'IT': 'È possibile caricare non più di 10 file',
        'LV': 'Jūs varat augšupielādēt ne vairāk kā 10 failiem',
    };

    dict['addFile'] = {
        'EN': 'Add file',
        'RU': 'Загрузить файл',
        'FR': 'Ajouter le fichier',
        'DE': 'Datei hinzufügen',
        'ES': 'Agregar archivo',
        'PT': 'Adicionar ficheiro',
        'UK': 'Завантажити файл',
        'JA': 'ファイルを追加します。',
        'ZH': '添加文件',
        'PL': 'Dodaj plik',
        'KK': 'файлды қосу',
        'IT': 'Aggiungi file',
        'LV': 'Pievienot failu',
    };

    dict['addFiles'] = {
        'EN': 'Add files',
        'RU': 'Загрузить файлы',
        'FR': 'Ajouter des fichiers',
        'DE': 'Dateien hinzufügen',
        'ES': 'Agregar archivos',
        'PT': 'Adicionar arquivos',
        'UK': 'Завантажити файли',
        'JA': '追加ファイル',
        'ZH': '添加文件',
        'PL': 'Dodaj pliki',
        'KK': 'файлдарды қосу',
        'IT': 'Aggiungere i file',
        'LV': 'Pievieno failus',
    };

    dict['uploadError'] = {
        'EN': 'Upload error:',
        'RU': 'Ошибка:',
        'FR': 'Erreur de téléversement:',
        'DE': 'Upload fehler:',
        'ES': 'Error al subir:',
        'PT': 'Carregar erro:',
        'UK': 'Помилка:',
        'JA': 'アップロードエラー：',
        'ZH': '上传错误：',
        'PL': 'Błąd:',
        'KK': 'Қотарып беру қатесі:',
        'IT': 'Carica di errore:',
        'LV': 'Augšupielādes kļūda:',
    };

    dict['uploading'] = {
        'EN': 'Uploading',
        'RU': 'Загрузка',
        'FR': 'Téléchargement',
        'DE': 'Hochladen',
        'ES': 'Carga',
        'PT': 'Carregamento',
        'UK': 'Завантаження',
        'JA': 'アップロード',
        'ZH': '上传',
        'PL': 'Ładowanie',
        'KK': 'Кері жүктеу',
        'IT': 'Caricamento',
        'LV': 'Augšupielāde',
    };

    dict['uploaded'] = {
        'EN': 'Uploaded',
        'RU': 'Загружено',
        'FR': 'Téléchargé',
        'DE': 'Hochgeladen',
        'ES': 'Subida',
        'PT': 'Uploaded',
        'UK': 'Завантажено',
        'JA': 'アップロード',
        'ZH': '上传',
        'PL': 'Dodano',
        'KK': 'Жүктелген',
        'IT': 'Caricati',
        'LV': 'Augšupielādēts',
    };

    dict['files'] = {
        'EN': ' files',
        'RU': ' файла(ов)',
        'FR': ' fichier(s)',
        'DE': ' datei(en)',
        'ES': ' archivo(s)',
        'PT': ' ficheiro(s)',
        'UK': ' файл(ів)',
        'JA': ' ファイル',
        'ZH': ' 文件',
        'PL': ' plika(ów)',
        'KK': ' файл(дар)',
        'IT': ' files',
        'LV': ' fail(i)',
    };

    dict['replace'] = {
        'EN': 'Replace',
        'RU': 'Заменить',
        'FR': 'Remplacer',
        'DE': 'Ersetzen',
        'ES': 'Reemplazar',
        'PT': 'Substituir',
        'UK': 'Замінити',
        'JA': '置き換えます',
        'ZH': '代替',
        'PL': 'Zmień',
        'KK': 'Ауыстырыңыз',
        'IT': 'Sostituire',
        'LV': 'Aizvietot',
    };

    dict['addMoreFiles'] = {
        'EN': 'Add more files',
        'RU': 'Добавить файлы',
        'FR': 'Ajouter plusieurs fichiers',
        'DE': 'Weitere dateien hinzufügen',
        'ES': 'Agrega mas archivos',
        'PT': 'Adicionar mais arquivos',
        'UK': 'Додати файли',
        'JA': 'さらにファイルを追加',
        'ZH': '添加更多文件',
        'PL': 'Dodać pliki',
        'KK': 'Бірнеше файлдарды қосу',
        'IT': 'Aggiungere altri file',
        'LV': 'Pievienot vairāk failus',
    };

    dict['maxFiles'] = {
        'EN': 'Maximum 10 files',
        'RU': 'Максимум 10 файлов',
        'FR': 'Maximum 10 fichiers',
        'DE': 'Maximal 10 dateien',
        'ES': 'Máximo 10 archivos',
        'PT': 'Máximo 10 ficheiros',
        'UK': 'Максимум 10 файлів',
        'JA': '最大10個のファイル',
        'ZH': '最大10个文件',
        'PL': 'Max 10 plików',
        'KK': 'Ең 10 файлдар',
        'IT': 'Massimo 10 file',
        'LV': 'Maksimāli 10 faili',
    };

    dict['keyNotSpecified'] = {
        'EN': 'TILDA UPLOAD WIDGET KEY is not specified',
        'RU': 'Не указан TILDA UPLOAD WIDGET KEY',
        'FR': 'TILDA UPLOAD WIDGET KEY est non spécifiée',
        'DE': 'TILDA UPLOAD WIDGET KEY ist nicht angegeben',
        'ES': 'TILDA UPLOAD WIDGET KEY no se especifica',
        'PT': 'TILDA UPLOAD WIDGET KEY não está especificado',
        'UK': 'Не вказано TILDA UPLOAD WIDGET KEY',
        'JA': 'TILDA UPLOAD WIDGET KEYが指定されていません。',
        'ZH': '没有指定TILDA UPLOAD WIDGET KEY',
        'PL': 'Nie dodano TILDA UPLOAD WIDGET KEY',
        'KK': 'Көрсетілмеген TILDA UPLOAD WIDGET KEY',
        'IT': 'TILDA UPLOAD WIDGET KEY non è specificato',
        'LV': 'TILDA UPLOAD WIDGET KEY nav norādīts',
    };

    dict['instruction'] = {
        'EN': '<a target="_blank" href="https://help.tilda.cc/upwidget-api-key">Detailed instruction</a>',
        'RU': '<a target="_blank" href="https://help-ru.tilda.cc/upwidget-api-key">Инструкция</a>',
        'FR': '<a target="_blank" href="https://help.tilda.cc/upwidget-api-key">Instruction détaillée</a>',
        'DE': '<a target="_blank" href="https://help.tilda.cc/upwidget-api-key">Ausführliche Anleitung</a>',
        'ES': '<a target="_blank" href="https://help.tilda.cc/upwidget-api-key">Instrucciones detalladas</a> ',
        'PT': '<a target="_blank" href="https://help.tilda.cc/upwidget-api-key">Instrução detalhada</a>',
        'UK': '<a target="_blank" href="https://help.tilda.cc/upwidget-api-key">Інструкція</a>',
        'JA': '<a target="_blank" href="https://help.tilda.cc/upwidget-api-key">詳細な指示する</a>',
        'ZH': '<a target="_blank" href="https://help.tilda.cc/upwidget-api-key">详细指令</A>',
        'PL': '<a target="_blank" href="https://help.tilda.cc/upwidget-api-key">Instrukcja</a>',
        'KK': '<a target="_blank" href="https://help.tilda.cc/upwidget-api-key">Толық нұсқаулық</a>',
        'IT': '<a target="_blank" href="https://help.tilda.cc/upwidget-api-key">Istruzioni dettagliate</a>',
        'LV': '<a target="_blank" href="https://help.tilda.cc/upwidget-api-key">Detalizēta instrukcija</a>',
    };

    var lang = window.browserLang;

    if (window.UPLOADCARE_LOCALE && window.UPLOADCARE_LOCALE) {
        lang = window.UPLOADCARE_LOCALE.toUpperCase();
    }

    if (dict[msg]) {
        if (dict[msg][lang]) {
            return dict[msg][lang];
        } else {
            return dict[msg]['EN'];
        }
    }

    return 'Text not found "' + msg + '"';
}