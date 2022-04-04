/**
 * Общее описаине скрипта
 * Datepicker для выбора даты в инпуте
 * Есть основные события
 * - первое открытие календаря
 * - последующее открытие и закрытие календаря
 * - смена месяца с использованием стрелок
 * - смена месяца/года при выборе в селекте
 * - выбор дня
 *
 * При первом открытие каленаря происходит отрисовка DOM элемента,
 * а также создание переменных для удобного доступа к элементам
 *
 * После любого действия (кроме выбора даты) происходит
 * отрисовка месяца (t_datepicker__renderMonth)
 */

/**
 * Инициализация dstepicker
 * @param {string} recId
 * @param {string} inputId
 * @param {string} zeroElId
 */
// eslint-disable-next-line no-unused-vars
function t_datepicker_init(recId, inputId, zeroElId) {
    var rec = document.querySelector('#rec' + recId);
    if (!rec) return;

    var strSelectorId = '';
    var targetField;

    // в zero block один rec может иметь две формы с одинаковыми инпутами, пожтому надо находить поле по айди
    if (zeroElId) {
        strSelectorId =
            '#rec' +
            recId +
            ' [data-elem-id="' +
            zeroElId +
            '"]' +
            ' [data-input-lid="' +
            inputId +
            '"]';
    } else {
        strSelectorId = '#rec' + recId + ' [data-input-lid="' + inputId + '"]';
    }

    targetField = rec.querySelector(strSelectorId + ' .t-input-block');
    if (!targetField) return;

    var dateInput = targetField.querySelector('.t-datepicker');
    if (!dateInput) return;

    dateInput.setAttribute(
        'autocomplete',
        navigator.userAgent.search(/Chrome/) > 0 ? 'no' : 'off'
    );

    // предотвращение повторной инициализации в zero block
    if (!targetField.classList.contains('t-input-block_inited-date-picker')) {
        targetField.classList.add('t-input-block_inited-date-picker');
    }

    var options = t_datepicker__createOptions(targetField);

    // добавляем обработчик событий на инпут
    t_datepicker__addHandler(strSelectorId + ' .t-datepicker', options);
}

/**
 * Создает объект с опциями для ккалендаря
 * @param {node} targetField
 * @returns {object} options
 */
function t_datepicker__createOptions(targetField) {
    // [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", … ]
    var months = [];
    for (var month = 0; month < 12; month++) {
        var date = new Date(Date.UTC(2006, month, 1, 0, 0, 0));
        months.push(
            date.toLocaleDateString(window.browserLang, {
                month: 'long',
                timeZone: 'UTC',
            })
        );
    }

    // [ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa" ]
    var weekDays = [];
    for (var weekday = 1; weekday <= 7; weekday++) {
        var date = new Date(Date.UTC(2006, 0, weekday, 0, 0, 0));
        weekDays.push(
            date
                .toLocaleDateString(window.browserLang, {
                    weekday: 'short',
                    timeZone: 'UTC',
                })
                .substring(0, 2)
        );
    }

    var options = {
        months: months,
        weekDays: weekDays,
        body: targetField,
        sundayBased: false,
        pickerAttribute: 'data-picker', // аттрибут у ячейки (data-picker='01-02-2022')
        datePickerClass: 't_datepicker__inner',
        selectedDayClass: 'selected-day',
        header:
            '<div class="t_datepicker__header">' +
            '<button class="t_datepicker__arrow t_datepicker__arrow_prev" type="button"></button>' +
            '<button class="t_datepicker__arrow t_datepicker__arrow_next" type="button"></button>' +
            '<div class="t_datepicker__label t_datepicker__label_month"><span>{{month}}</span>' +
            '<select class="t_datepicker__select t_datepicker__select_month" tabindex="-1">' +
            '{{months}}' +
            '</select>' +
            '</div>' +
            '<div class="t_datepicker__label t_datepicker__label_year"><span>{{year}}</span>' +
            '<select class="t_datepicker__select t_datepicker__select_year" tabindex="-1">' +
            '{{years}}' +
            '</select>' +
            '</div>' +
            '</div>',
        minDate: '1999-01-01',
        maxDate: '2030-12-31',
        // классы для прослушивания событий
        nextButtonClass: 't_datepicker__arrow_next',
        prevButtonClass: 't_datepicker__arrow_prev',
        selectYearClass: 't_datepicker__select_year',
        selectMonthClass: 't_datepicker__select_month',
        isRendered: false,
        isOpened: false,
        // в данные переменные после первой инциализации календаря
        // будут наодится DOM элементы
        datePickerEl: '',
        datePickerTable: '',
        nextButtonEl: '',
        prevButtonEl: '',
        currentMonth: '',
        currentYear: '',
        inputEl: '',
    };

    return options;
}

/**
 * Добавление обработчиков события для взаимодействия с календарем
 * @param {node} inputElement
 * @param {object} options
 */
function t_datepicker__addHandler(inputElement, options) {
    var inputField = options.body.querySelector(inputElement);
    var maxYear = options.maxDate.split('-')[0];
    var minYear = options.minDate.split('-')[0];
    document.addEventListener('click', function (e) {
        // открытие/закртыие календаря
        if (e.target === inputField && !options.isOpened) {
            t_datepicker__openDatepicker(options);

            // prettier-ignore
            var yearSelect = options.body.querySelector('.t_datepicker__select_year');
            // prettier-ignore
            var monthSelect = options.body.querySelector('.t_datepicker__select_month');
            // prettier-ignore
            t_datepicker__addSelectHandler(monthSelect, options, options.currentMonth);
            // prettier-ignore
            t_datepicker__addSelectHandler(yearSelect, options, options.currentYear);
        } else if (
            !e.target.classList.contains(options.datePickerClass) &&
            !e.target.closest('.' + options.datePickerClass) &&
            !e.target.classList.contains('t-datepicker')
        ) {
            t_datepicker__closeDatepicker(options);
        }
    });

    options.body.addEventListener('click', function (e) {
        // выбор даты
        // prettier-ignore
        var dayCellDateAttribute = e.target.getAttribute(options.pickerAttribute);
        if (dayCellDateAttribute) {
            var dayCellYear = parseInt(dayCellDateAttribute.split('-')[0], 10);
            // проверка года выбранной даты
            if (dayCellYear <= maxYear && dayCellYear >= minYear) {
                // prettier-ignore
                var activeDay = options.datePickerTable.querySelector('td.selected-day');
                if (activeDay) {
                    activeDay.classList.remove('selected-day');
                }
                e.target.classList.add('selected-day');

                t_datepicker__renderValue(inputField, dayCellDateAttribute);
                t_datepicker__closeDatepicker(options);
            }
        }

        // переход на следующий месяц
        if (e.target.classList.contains(options.nextButtonClass)) {
            t_datepicker__goToNextMonth(options);
            t_datepicker__checkLimit(options);
        }

        // переход на предыдущий месяц
        if (e.target.classList.contains(options.prevButtonClass)) {
            t_datepicker__goToPrevMonth(options);
            t_datepicker__checkLimit(options);
        }
    });
}

/**
 * Первая отрисовка календаря (вызывается толко 1 раз, в самом начале)
 * @param {object} options
 */
function t_datepicker__renderCalendar(options) {
    // создаем обертку для календаря (толькко один раз)
    var datepickerWrapper = document.createElement('div');
    datepickerWrapper.classList.add(options.datePickerClass);
    var date = t_datepicker__getCurrentDate().split('-');

    // проверяем флаг (с какого дня недели начинается неделя)
    if (!options.sundayBased) {
        options.weekDays.push(options.weekDays[0]);
        options.weekDays.splice(0, 1);
    }

    // создаем массив из годов для селекта
    var yearsList = [];
    for (
        var year = parseInt(options.minDate.slice(0, 4), 10);
        year <= parseInt(options.maxDate.slice(0, 4), 10);
        year++
    ) {
        yearsList.push(year);
    }

    // создаем разметку
    var markup = options.header
        .replace('{{year}}', date[0])
        .replace(
            '{{years}}',
            t_datepicker__getOptionsHTML(yearsList, parseInt(date[0], 10))
        )
        .replace('{{month}}', options.months[parseInt(date[1], 10) - 1])
        .replace(
            '{{months}}',
            t_datepicker__getOptionsHTML(
                options.months,
                options.months[parseInt(date[1], 10) - 1]
            )
        );

    markup += '<table class="t_datepicker__body">';
    markup += t_datepicker__renderMonth(
        date[0],
        parseInt(date[1], 10) - 1,
        options
    );
    markup += '</table>';

    datepickerWrapper.innerHTML = markup;

    options.body.insertAdjacentElement('beforeend', datepickerWrapper);

    // создаем перемеенные для часто используемых элементов
    // prettier-ignore
    options.datePickerEl = options.body.querySelector('.' + options.datePickerClass);
    options.datePickerTable = options.body.querySelector('.t_datepicker__body');
    // prettier-ignore
    options.nextButtonEl = options.datePickerEl.querySelector('.' + options.nextButtonClass);
    // prettier-ignore
    options.prevButtonEl = options.datePickerEl.querySelector('.' + options.prevButtonClass);
    // prettier-ignore
    options.currentMonth = options.body.querySelector('.t_datepicker__label_month span');
    // prettier-ignore
    options.currentYear = options.body.querySelector('.t_datepicker__label_year span');

    options.inputEl = options.body.querySelector('.t-datepicker');
}

/**
 * Переход к следующем месяцу
 * @param {object} options
 */
function t_datepicker__goToNextMonth(options) {
    var currentYear = options.currentYear.innerHTML;
    var monthSelect = options.datePickerEl.querySelector(
        '.' + options.selectMonthClass
    );
    var currentMonth = options.months.indexOf(options.currentMonth.innerHTML);
    var nextMonth;
    var nextYear;

    // проверяем является ли месяц Декабрем
    if (parseInt(currentMonth, 10) === 11) {
        nextMonth = options.months[0];
        var yearSelect = options.datePickerEl.querySelector(
            '.' + options.selectYearClass
        );
        nextYear = parseInt(currentYear, 10) + 1;
        yearSelect.value = nextYear;
        options.currentYear.innerHTML = nextYear;
    } else {
        nextMonth = options.months[parseInt(currentMonth, 10) + 1];
        nextYear = currentYear;
    }

    monthSelect.value = nextMonth;
    options.currentMonth.innerHTML = nextMonth;

    options.datePickerTable.innerHTML = t_datepicker__renderMonth(
        nextYear,
        options.months.indexOf(nextMonth),
        options
    );
}

/**
 * Переход к предыдущему месяцу
 * @param {object} options
 */
function t_datepicker__goToPrevMonth(options) {
    var currentYear = options.currentYear.innerHTML;
    var monthSelect = options.datePickerEl.querySelector(
        '.' + options.selectMonthClass
    );
    var currentMonth = options.months.indexOf(options.currentMonth.innerHTML);
    var prevMonth;
    var prevYear;

    // проверяем является ли месяц Январем
    if (parseInt(currentMonth, 10) === 0) {
        prevMonth = options.months[11];

        var yearSelect = options.datePickerEl.querySelector(
            '.' + options.selectYearClass
        );
        prevYear = parseInt(currentYear, 10) - 1;
        yearSelect.value = prevYear;
        options.currentYear.innerHTML = prevYear;
    } else {
        prevMonth = options.months[parseInt(currentMonth, 10) - 1];
        prevYear = currentYear;
    }

    monthSelect.value = prevMonth;
    options.currentMonth.innerHTML = prevMonth;

    options.datePickerTable.innerHTML = t_datepicker__renderMonth(
        prevYear,
        options.months.indexOf(prevMonth),
        options
    );
}

/**
 * Отрисовка месяца
 * @param {number} year
 * @param {number} month
 * @param {object} options
 * @param {number} choosedDay
 * @returns string
 */
function t_datepicker__renderMonth(year, month, options, choosedDay) {
    var days = t_datepicker__generateDays(year, month);

    var choosedDate;
    if (choosedDay) {
        choosedDate = new Date(year, month, choosedDay);
    } else {
        choosedDate = new Date();
    }

    // создаем размеетку для шапки календаря
    var markup = '<thead>' + '<tr>';
    for (var day = 0; day < options.weekDays.length; day++) {
        var weekDay = day > 4 ? ' t_datepicker__week-end' : '';
        markup +=
            '<th class="t_datepicker__week-day' +
            weekDay +
            '">' +
            options.weekDays[day] +
            '</th>';
    }

    var today = t_datepicker__getCurrentDate().split('-');
    markup += '</tr>' + '</thead>' + '<tbody>';

    // создаем разметку для дней
    for (var day = 0; day < days.length; day++) {
        markup += days[day].getDay() === 1 ? '<tr>' : '';
        markup += '<td class="';
        if (days[day].getMonth() === month) {
            markup += 't_datepicker__current-month';
        } else if (days[day].getMonth() < month) {
            markup += 't_datepicker__previous-month';
        } else if (days[day].getMonth() > month) {
            markup += 't_datepicker__next-month';
        }

        if (
            days[day].getFullYear() === parseInt(today[0], 10) &&
            days[day].getMonth() + 1 === parseInt(today[1], 10) &&
            days[day].getDate() === parseInt(today[2], 10)
        ) {
            markup += ' t_datepicker__today';
        }

        if (
            days[day].getFullYear() === choosedDate.getFullYear() &&
            days[day].getMonth() === choosedDate.getMonth() &&
            days[day].getDate() === choosedDate.getDate()
        ) {
            markup += ' t_datepicker__selected-day';
        }

        markup += '"';

        markup += options.pickerAttribute + '="';
        markup += days[day].getFullYear() + '-';
        markup += days[day].getMonth() + '-';
        markup += days[day].getDate() + '"';
        markup += '>';
        markup += days[day].getDate();
        markup += days[day].getDay() === 0 ? '</tr>' : '';
    }

    markup += '</tbody>';

    return markup;
}

/**
 * Создание массива состоящего из дат, которые находятся внутри календарной страницы
 * @param {number} year
 * @param {number} month
 * @returns array
 */
function t_datepicker__generateDays(year, month) {
    var date = new Date(year, month, 1);
    var days = [];

    // получаем первый день недели в месяце
    // отталкиваясь от него заполняем массив
    // в начале числами пред. месяца
    var firstDayOfMonth = date.getDay() - 1 === -1 ? 6 : date.getDay() - 1;
    date.setDate(date.getDate() - firstDayOfMonth);

    for (var day = 0; day < firstDayOfMonth; day++) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }

    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }

    // если первый день сле. месяца не понедельник
    // то заполняем массив датами след. месяца
    // пока кол-во элементов не будет равно 35
    // по сути, таким образом мы обрабатываем одно исключение
    // когда на улице Февраль в котором ровно 4 недели
    // т.е. месяц начинается в понедельник
    // а заканчивается в воскресенье

    if (date.getDay() !== 1) {
        while (date.getDay() !== 1) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
    }

    return days;
}

/**
 * Открытие календаря (при первом вызове так же вызовет t_datepicker__renderCalendar)
 * @param {object} options
 */
function t_datepicker__openDatepicker(options) {
    if (!options.isRendered) {
        t_datepicker__renderCalendar(options);
        options.isRendered = true;
    } else if (options.inputEl.value !== '__-__-____') {
        var choosedDate = t_datepicker__readValue(options.inputEl);
        t_datepicker__validateEnteredValue(choosedDate, options);
    }

    options.datePickerEl.style.display = 'block';
    options.isOpened = true;
}

/**
 * Закрытие календаря
 * @param {object} options
 */
function t_datepicker__closeDatepicker(options) {
    if (options.datePickerEl) {
        options.datePickerEl.style.display = 'none';
        options.isOpened = false;
    }
}

/**
 * Обрабатывает выбранную дату в формате YYYY-MM-DD и вставляет ее в инпут (element.value) в нужноом формате
 * @param {node} inputElement
 * @param {string} value
 */
function t_datepicker__renderValue(inputElement, value) {
    var pickedDate = value.split('-');

    // меняем номер месяца так чтобы нумерация начиналась с 1
    pickedDate[1] = parseInt(pickedDate[1], 10) + 1 + '';

    // если число меньше 10, то добавляем 0
    for (var date = 0; date < 3; date++) {
        if (pickedDate[date].length < 2) {
            pickedDate[date] = '0' + pickedDate[date];
        }
    }
    var dateFormat = inputElement.getAttribute('data-tilda-dateformat');
    var dateDivider = t_datepicker__getDateDivider(inputElement);
    if (dateFormat === 'DD-MM-YYYY') {
        inputElement.value =
            pickedDate[2] +
            dateDivider +
            pickedDate[1] +
            dateDivider +
            pickedDate[0];
    }
    if (dateFormat === 'MM-DD-YYYY') {
        inputElement.value =
            pickedDate[1] +
            dateDivider +
            pickedDate[2] +
            dateDivider +
            pickedDate[0];
    }
    if (dateFormat === 'YYYY-MM-DD') {
        inputElement.value =
            pickedDate[0] +
            dateDivider +
            pickedDate[1] +
            dateDivider +
            pickedDate[2];
    }
    if (inputElement.classList.contains('t-input_pvis')) {
        inputElement.classList.add('t-input_has-content');
    }
}

/**
 * Считывает значение с элемента и возвращает дату в выбранном формате, если значеия нет то возвращает сегодняшнюю дату
 * @param {node} inputElement
 * @returns string
 */
function t_datepicker__readValue(inputElement) {
    var dateDivider = t_datepicker__getDateDivider(inputElement);
    var currentDate = inputElement.value.split(dateDivider);
    var dateFormat = inputElement.getAttribute('data-tilda-dateformat');
    if (currentDate != '') {
        if (dateFormat === 'DD-MM-YYYY') {
            return currentDate[2] + '-' + currentDate[1] + '-' + currentDate[0];
        }
        if (dateFormat === 'MM-DD-YYYY') {
            return currentDate[2] + '-' + currentDate[0] + '-' + currentDate[1];
        }
        if (dateFormat === 'YYYY-MM-DD') {
            return currentDate[0] + '-' + currentDate[1] + '-' + currentDate[2];
        }
    } else {
        return t_datepicker__getCurrentDate();
    }
}

/**
 * Генерирует сегодняшнюю дату и возвращает ее в виде строки в формате YYYY-MM-DD
 * @returns string
 */
function t_datepicker__getCurrentDate() {
    var now = new Date();
    return now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
}

/**
 * Генерирует разметку для с опциями для селекта, также сравнивает с аргументом choosed
 * @param {array} array
 * @param {any} choosed
 * @returns string
 */
function t_datepicker__getOptionsHTML(array, choosed) {
    var optionsList = [];
    for (var i = 0; i < array.length; i++) {
        optionsList.push(
            '<option value="' +
                array[i] +
                '"' +
                (array[i] === choosed ? 'selected' : '') +
                '>' +
                array[i] +
                '</option>'
        );
    }
    return optionsList.join('');
}

/**
 * Смотри у элемента аттрибут data-tilda-datediv и возвращает разделитель для даты
 * @param {node} inputElement
 * @returns string
 */
function t_datepicker__getDateDivider(inputElement) {
    var dateDividerType = inputElement.getAttribute('data-tilda-datediv');
    if (dateDividerType === 'dash' || !dateDividerType) {
        return '-';
    }
    if (dateDividerType === 'slash') {
        return '/';
    }
    if (dateDividerType === 'dot') {
        return '.';
    }
}

/**
 * Проверяет дату, сравнивая с максимальной и минимальной (minDate, maxDate).
 * При необходимости откключает стрелки
 * @param {object} options
 */
function t_datepicker__checkLimit(options) {
    var maxDate = options.maxDate.split('-');
    var minDate = options.minDate.split('-');
    var selectedYear = parseInt(options.currentYear.innerHTML, 10);
    var selectedMonth = options.currentMonth.innerHTML;

    // проверяем, является ли дата максимальной или минимальной
    if (
        options.months.indexOf(selectedMonth) === 11 &&
        selectedYear === parseInt(maxDate[0], 10)
    ) {
        options.nextButtonEl.disabled = true;
        options.prevButtonEl.disabled = false;
    } else if (
        options.months.indexOf(selectedMonth) === 0 &&
        selectedYear === parseInt(minDate[0], 10)
    ) {
        options.prevButtonEl.disabled = true;
        options.nextButtonEl.disabled = false;
    } else {
        options.nextButtonEl.disabled = false;
        options.prevButtonEl.disabled = false;
    }
}

/**
 * Добавляет прослушивателя событий на селект, чтобы при выборы менять месяц
 * @param {node} select
 * @param {object} options
 * @param {node} label
 */
function t_datepicker__addSelectHandler(select, options, label) {
    select.addEventListener('input', function (e) {
        label.innerHTML = e.target.value;
        var currentYear = options.currentYear.innerHTML;
        var currentMonth = options.months.indexOf(
            options.currentMonth.innerHTML
        );
        options.datePickerTable.innerHTML = t_datepicker__renderMonth(
            currentYear,
            currentMonth,
            options
        );
        t_datepicker__checkLimit(options);
    });
}

/**
 * Проверяет введенную поользователем дату и отрисовывает ее в календаре
 * @param {string} date введеная дата
 * @param {object} options
 */
function t_datepicker__validateEnteredValue(date, options) {
    // обрабатываем исключения
    // - введен год больше чем максимальный
    // - введен год меньше чем минимальный
    // - введен месяц не в области 0 - 11
    // - введен день больше 31
    //
    var choosedDate = date.split('-');
    var choosedYear = parseInt(choosedDate[0], 10);
    var choosedMonth = parseInt(choosedDate[1]) - 1;
    var choosedDay = parseInt(choosedDate[2]);
    var maxYear = parseInt(options.maxDate.split('-')[0], 10);
    var minYear = parseInt(options.minDate.split('-')[0], 10);
    var dayIsValid = choosedDay >= 0 && choosedDay <= 31;
    var monthIsValid = choosedMonth >= 0 && choosedMonth <= 11;

    var monthSelect = options.datePickerEl.querySelector(
        '.' + options.selectMonthClass
    );
    var yearSelect = options.datePickerEl.querySelector(
        '.' + options.selectYearClass
    );
    if (choosedYear > maxYear) {
        options.datePickerTable.innerHTML = t_datepicker__renderMonth(
            maxYear,
            monthIsValid ? choosedMonth : 11,
            options,
            dayIsValid ? choosedDay : undefined
        );
        monthSelect.value = options.months[monthIsValid ? choosedMonth : 11];
        options.currentMonth.innerHTML =
            options.months[monthIsValid ? choosedMonth : 11];
        yearSelect.value = maxYear;
        options.currentYear.innerHTML = maxYear;
    } else if (choosedYear < minYear) {
        options.datePickerTable.innerHTML = t_datepicker__renderMonth(
            minYear,
            monthIsValid ? choosedMonth : 0,
            options,
            dayIsValid ? choosedDay : undefined
        );
        monthSelect.value = options.months[monthIsValid ? choosedMonth : 0];
        options.currentMonth.innerHTML =
            options.months[monthIsValid ? choosedMonth : 0];
        yearSelect.value = minYear;
        options.currentYear.innerHTML = minYear;
    } else {
        options.datePickerTable.innerHTML = t_datepicker__renderMonth(
            choosedYear,
            monthIsValid ? choosedMonth : 11,
            options,
            dayIsValid ? choosedDay : undefined
        );
        monthSelect.value = options.months[monthIsValid ? choosedMonth : 0];
        options.currentMonth.innerHTML =
            options.months[monthIsValid ? choosedMonth : 0];
        yearSelect.value = choosedYear;
        options.currentYear.innerHTML = choosedYear;
    }

    t_datepicker__checkLimit(options);
}