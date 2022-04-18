var Typed = function (el, options) {
    var defaultOptions = {
        // строки для печати
        strings: [],
        // скорость печати
        typeSpeed: 0,
        // задержка перед началом печати
        startDelay: 0,
        // скорость удаления символов
        backSpeed: 40,
        // задержкка перед тем как стирать слова
        backDelay: 500,
        // зацикленность
        loop: false,
        // false = infinite
        loopCount: false,
        // показывать курсор
        showCursor: true,
    };

    // находим элемент, в котором будем писать
    this.el = document.querySelector(el);

    // опции
    this.options = Object.assign(defaultOptions, options);

    // устанавливаем фиксированную скорость удаления символов
    this.options.backSpeed = 40;

    // проверяем является ли элемент инпутом
    if (this.el) {
        this.isInput = this.el.tagName.toLowerCase() === 'input';
    }

    // проверяем нужно ли показывать курсор
    // (зависит от того в какой элемент производится запись)
    this.showCursor = this.isInput ? false : this.options.showCursor;

    // контент в элементе
    this.elContent = this.el.innerHTML;

    // скорость набора текста
    this.typeSpeed = this.options.typeSpeed;

    //скорость удаления символов
    this.backSpeed = this.options.backSpeed;

    // задержка перед тем как начать печатать
    this.startDelay = this.options.startDelay;

    // кол-во миллисекунд после того как мы ввели слово, но еще не начали его стирать
    this.backDelay = this.options.backDelay;

    // массив из строк для ввода
    this.strings = this.options.strings;

    // номер символа
    this.strPosition = 0;

    // номер слова из массива
    this.arrayPosition = 0;

    // зацикливание набора
    this.loop = this.options.loop;
    this.loopCount = this.options.loopCount;
    this.currentLoop = 0;

    // для остановки набора
    this.stop = false;

    // вставляем в разметку курсор
    this.t_typed__insertCursor();

    // запускаем
    this.t_typed__init();
};

Typed.prototype = {
    t_typed__init: function () {
        var self = this;
        self.timeout = setTimeout(function () {
            // Начинаем печатать :)
            self.t_typed__typewrite(self.strings[self.arrayPosition], self.strPosition);
        }, self.startDelay);
    },

    /**
     * Вставляем в разметку курсор (мигающий вертикальный слеш при вводе)
     */
    t_typed__insertCursor: function () {
        var self = this;
        // проверяем флаг курсора и если true то вставляем его в разметку
        if (self.showCursor === true) {
            self.cursor = '<span class="typed-cursor">|</span>';
            self.el.insertAdjacentHTML('afterend', self.cursor);
        }
    },

    /**
     * Печатает currentStrPosition кол-во символов строки currentString.
     * Передаем в качестве аргументов строчку котрую надо будет писать
     * и позицию с которой начинаем печатать (в начале это 0)
     * @param {string} currentString - вводимая строка
     * @param {number} currentStrPosition - позиция символа в строке
     */
    t_typed__typewrite: function (currentString, currentStrPosition) {
        var self = this;

        if (self.stop === true) {
            return;
        }

        // каждый раз высчитываем новую задержку для того чтообы симулировать
        // реальную печать
        var humanize = self.t_typed__humanizer(self.typeSpeed);

        // печатаем символ с нашей околорандомной задержкой
        self.timeout = setTimeout(function () {
            // обрабатываем случай когда это последний символ
            var nextString = currentString.substr(0, currentStrPosition + 1);
            if (currentStrPosition === currentString.length) {
                // проверяем последнее ли это слово в массиве
                if (self.arrayPosition === self.strings.length - 1) {
                    self.currentLoop++;

                    // выходим из цикла если он не бесконечный
                    if (
                        self.loop === false ||
                        self.currentLoop === self.loopCount
                    )
                        return;
                }

                // стираем слово тк это был последний символ слова
                self.timeout = setTimeout(function () {
                    self.t_typed__backspace(currentString, currentStrPosition);
                }, self.backDelay);
            } else if (self.isInput) {
                self.el.value = nextString;
                // увеличиваем кол-во символов на 1
                currentStrPosition++;
                // зацикливаем функцию
                self.t_typed__typewrite(currentString, currentStrPosition);
            } else {
                self.el.textContent = nextString;
                // увеличиваем кол-во символов на 1
                currentStrPosition++;
                // зацикливаем функцию
                self.t_typed__typewrite(currentString, currentStrPosition);
            }
        }, humanize);
    },

    /**
     * Печатает currentStrPosition кол-во символов строки currentString.
     * Передаем в качестве аргументов строчку котрую надо будет удалять
     * и позицию с которой начинаем удалять
     * @param {string} currentString - вводимая строка
     * @param {number} currentStrPosition - позиция символа в строке
     */
    t_typed__backspace: function (currentString, currentStrPosition) {
        var self = this;
        if (self.stop === true) {
            return;
        }

        // каждый раз высчитываем новую задержку для того чтообы симулировать
        // реальную печать
        var humanize = self.t_typed__humanizer(self.backSpeed);

        self.timeout = setTimeout(function () {
            var nextString = currentString.substr(0, currentStrPosition);

            if (self.isInput) {
                self.el.value = nextString;
            } else {
                self.el.textContent = nextString;
            }

            // Если номер буквы больше чем 0,
            // то продолжаем удалять строку посимвольно
            if (currentStrPosition > 0) {
                // уменьшаем кол-во символов на 1
                currentStrPosition--;
                // зацикливаем функцию
                self.t_typed__backspace(currentString, currentStrPosition);
            }
            // Если мы уже стерли всю строку, то увеличиваем позицию в массиве на 1
            // и начинаем печатать новую строку
            // Если это была после последнее слово, то заново инициализируем объект
            else if (currentStrPosition <= 0) {
                self.arrayPosition++;

                if (self.arrayPosition === self.strings.length) {
                    self.arrayPosition = 0;

                    self.t_typed__init();
                } else {
                    self.t_typed__typewrite(
                        self.strings[self.arrayPosition],
                        currentStrPosition
                    );
                }
            }
        }, humanize);
    },

    /**
     *
     * @param {number} speed - скорость ввода/удаления символов
     * @returns number
     */
    t_typed__humanizer: function (speed) {
        return Math.round(Math.random() * (speed / 2)) + speed;
    },
};