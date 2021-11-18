// eslint-disable-next-line
function t_prod__init(recId) {
	var rec = document.querySelector('#rec' + recId);
	if (!rec) return;

	var productElements = rec.querySelectorAll('.js-product');

	Array.prototype.forEach.call(productElements, function(productElement) {
		if (productElement.querySelector('.js-product-option')) {
			t_prod__initProduct(recId, productElement);
		}
	});
}

function t_prod__initProduct(recId, productElement) {
	t_prod__initPrice(productElement);
	t_prod__addEvents__options(recId, productElement);
	t_prod__updatePrice(recId, productElement);
}

function t_prod__initPrice(productElement) {
	// todo: jqeury in js
	if (productElement[0] === undefined) {
		var productElement = productElement;
	} else {
		var productElement = productElement[0];
	}
	// -->

	var productPrice = productElement.querySelector('.js-product-price');

	if (!productPrice) {
		var wrapPrice = productElement.querySelector('.t-store__card__price');
		wrapPrice.insertAdjacentHTML('beforeend', '<div style="display:none;" class="js-product-price"></div>');
		productPrice = productElement.querySelector('.js-product-price');
	}

	var priceValue = productPrice.textContent;
	var productDef = productPrice.getAttribute('data-product-price-def');
	var productDefStr = productPrice.getAttribute('data-product-price-def-str');

	if (priceValue) {
		if (!productDef && !productDefStr) {
			var price = t_prod__cleanPrice(priceValue);
			productPrice.setAttribute('data-product-price-def', price);
			productPrice.setAttribute('data-product-price-def-str', priceValue.replace(/"/g,''));
		}
	} else {
		productPrice.setAttribute('data-product-price-def', 0);
	}
}

// Update the price when changing
function t_prod__updatePrice(recId, productElement) {
	// todo: jqeury in js
	if (productElement[0] === undefined) {
		var productElement = productElement;
	} else {
		var productElement = productElement[0];
	}
	// -->

	var productPrice = productElement.querySelector('.js-product-price:not(.js-store-prod-price-range-val)');
	var productSelects = productElement.querySelectorAll('.js-product-option-variants');
    var totalPrice = 0;
    var add = 0;

	if (!productPrice) return;

	var priceValue = productPrice.getAttribute('data-product-price-def');

	priceValue = priceValue * 1;

	Array.prototype.forEach.call(productSelects, function(select) {
		if (!select) return;
		var optionPrice = select.querySelector('option:checked').getAttribute('data-product-variant-price');

		if (optionPrice) {
			var price = t_prod__cleanPrice(optionPrice);

			if (optionPrice.indexOf('+') !== -1) {
				add += price;
			} else if (parseFloat(price) !== 0) {
				priceValue = price;
			}
		}
	});

	totalPrice = priceValue + add;

	if (totalPrice > 0) {
		productPrice.innerHTML = t_prod__showPrice(t_prod__roundPrice(totalPrice));
	} else {
		productPrice.innerHTML = productPrice.getAttribute('data-product-price-def-str');
	}
}

// Add events for select
function t_prod__addEvents__options(recId, productElement) {
	// todo: jqeury in js
	if (productElement[0] === undefined) {
		var productElement = productElement;
	} else {
		var productElement = productElement[0];
	}
	// -->
	var productSelects = productElement.querySelectorAll('.js-product-option-variants');

	Array.prototype.forEach.call(productSelects, function(select) {
		var product = t_getParent(select, 'js-product');
		select.addEventListener('change', function() {
			t_prod__updatePrice(recId, product);
		});
	});
}

// Clear price from symbols
function t_prod__cleanPrice(price) {
	if (price) {
		price = price.toString();
		price = price.replace(',', '.').replace(/[^0-9.]/g, '');
		price = parseFloat(price).toFixed(2);
		if (isNaN(price)) price = 0;
		price = parseFloat(price);
		price = price * 1;
		if (price < 0) price = 0;
	} else {
		price = 0;
	}
	return price;
}

function t_prod__roundPrice(price) {
	if (price) {
		price = parseFloat(price).toFixed(2);
		price = parseFloat(price);
		price = price * 1;
		if (price < 0) price = 0;
	} else {
		price = 0;
	}
	return price;
}

// Transform price in string price
function t_prod__showPrice(price) {
	if (!price) {
		price = '';
	} else {
		price = price.toString();

		if (window.tcart && window.tcart['currency_dec'] && window.tcart['currency_dec'] === '00') {
			if (price.indexOf('.') === -1 && price.indexOf(',') === -1) {
				price = price + '.00';
			} else {
				var foo = price.substr(price.indexOf('.') + 1);

				if (foo.length === 1) price = price + '0';
			}
		}

		price = price.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

		if (window.tcart && window.tcart['currency_sep'] && window.tcart['currency_sep'] === '.') {
			price = price.replace(',', '.');
		} else {
			price = price.replace('.', ',');
		}
	}
	return price;
}

// Method closest for ie
function t_getParent(element, className) {
	var node = element.parentNode;
	while (node) {
		if (node.classList.contains(className)) {
			return node;
		}
		node = node.parentNode;
	}
	return undefined;
}