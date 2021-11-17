function t_input_range_init(recId, lid) {
    var inputWrap = document.querySelector('#rec' + recId + ' [data-input-lid="' + lid + '"]');
    var input = inputWrap.querySelector('.t-range');
    var style = document.createElement('style');
    var events = ['input', 'change', 'popupOpened', 'displayChanged'];

    style.classList.add('range-' + recId + '-' + lid);
    inputWrap.append(style);

    Array.prototype.forEach.call(events, function(event) {
        input.addEventListener(event, function() {
            t_inputRange__updateVal(recId, lid, style);
        });
    });

    window.addEventListener('resize', t_throttle(function() {
        t_inputRange__updateVal(recId, lid, style);
    }));

    t_inputRange__updateVal(recId, lid, style);
}

// update value in range
function t_inputRange__updateVal(recId, lid, style) {
    var inputWrap = document.querySelector('#rec' + recId + ' [data-input-lid="' + lid + '"]');
    var input = inputWrap.querySelector('.t-range');
    var textValue = inputWrap.querySelector('.t-range__value-txt');
    var color1 = input.getAttribute('data-range-color');
    var color2 = '#f4f4f4';
    var max = parseFloat(input.getAttribute('max'));
    var min = parseFloat(input.getAttribute('min'));
    var dist = max - min;
    var thumbWidth = 21;
    var value = input.value;
    var percentage = (value - min) / dist;
    var offLeft = Math.floor(percentage * (input.offsetWidth - thumbWidth) + thumbWidth / 2);
    var breakPoint = percentage * 100;

    color1 = (color1) ? color1 : '#000';

    var attrValue = 'linear-gradient(to right, ' + color1 + ' 0%, ' + color1 + ' ' + breakPoint + '%, ' + color2 + ' ' + breakPoint + '%, ' + color2 + ' 100%)';
    var fieldSelector = '#rec' + recId + ' [data-input-lid="' + lid + '"] .t-range';
    var styleValue = fieldSelector + '::-webkit-slider-runnable-track{\nbackground:' + attrValue + ';\n}\n' + fieldSelector + '::-moz-range-track{\nbackground:' +
        attrValue + ';\n}';
    
    styleValue += '\n' + fieldSelector + '::-ms-fill-upper{\nbackground:' + color2 + ';\n}\n' + fieldSelector + '::-ms-fill-lower{\nbackground:' + color1 + ';\n}';
    
    style.innerHTML = styleValue;

    input.setAttribute('max', max);
    input.setAttribute('min', min);

    textValue.textContent = value;
    textValue.style.cssText = 'left:' + offLeft + 'px; display: block;';
}