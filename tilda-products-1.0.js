function t_prod__init(recid){
	var rec=$('#rec'+recid);
	rec.find('.js-product').each(function() {
		if($(this).find('.js-product-option').length){
			t_prod__initProduct(recid,$(this));
		}
	});
}

function t_prod__initProduct(recid,el_prod){
	t_prod__initPrice(recid,el_prod);
	t_prod__addEvents__options(recid,el_prod);
	t_prod__updatePrice(recid,el_prod);
}

function t_prod__initPrice (recid,el_prod) {
	var el_price=el_prod.find('.js-product-price');
	if (el_price.length){
	} else {
		el_prod.append("<div style='display:none;' class='js-product-price'></div>");
		var el_price=el_prod.find('.js-product-price');
	}
	var price=el_price.html();
	if (typeof price!='undefined' && price!='') {
		if (! el_price.attr('data-product-price-def') && ! el_price.attr('data-product-price-def-str')) {
			var p=t_prod__cleanPrice(price);
			el_price.attr('data-product-price-def',p);
			price = price.replace(/"/g,'');
			el_price.attr('data-product-price-def-str',price);
		}
	} else {
		el_price.attr('data-product-price-def','0');
	}
}

function t_prod__updatePrice(recid, el_prod) {
    var totalprice = 0;
    var add = 0;
    var el_price = el_prod.find('.js-product-price:not(.js-store-prod-price-range-val)');
		// If user selected to draw prices as price range via options, do not change price here
		// Change price range in tilda-catalog only
		if (!el_price.length) {
			return;
		}
    var price = el_price.attr('data-product-price-def');
    price = price * 1;

    el_prod.find('.js-product-option-variants').each(function () {
        var el_opt = $(this);
        var op_price = el_opt.find('option:selected').attr('data-product-variant-price');
        if (typeof op_price != 'undefined' && op_price != '') {
            var p = t_prod__cleanPrice(op_price);
            if (op_price.indexOf('+') > -1) {
                add += p;
            } else if (parseFloat(p) !== 0) {
                price = p;
            }
        }
    });

    totalprice += price + add;

    if (totalprice > 0) {
        el_price.html(t_prod__showPrice(t_prod__roundPrice(totalprice)));
    } else {
        var defval = el_price.attr('data-product-price-def-str');
        el_price.html(defval);
    }
}

function t_prod__addEvents__options(recid,el_prod){
	var el=el_prod.find('.js-product-option-variants');
	if(el.length){
		el.change(function() {
			var el_prod=$(this).closest('.js-product');
			t_prod__updatePrice(recid,el_prod);
		});
	}
}

function t_prod__cleanPrice(price){
	if(typeof price=='undefined' || price === null || price == '' || price == 0){
		price=0;
	}else{
		price = price.toString();
		price = price.replace(',','.');
		price = price.replace(/[^0-9\.]/g,'');
		price = parseFloat(price).toFixed(2);
		if(isNaN(price))price=0;
		price = parseFloat(price);
		price = price*1;
		if(price<0)price=0;
	}
	return price;
}

function t_prod__roundPrice(price){
	if(typeof price=='undefined' || price=='' || price==0){
		price=0;
	}else{
		price = parseFloat(price).toFixed(2);
		price = parseFloat(price);
		price = price*1;
		if(price<0)price=0;
	}
	return price;
}

function t_prod__showPrice(price){
	if(typeof price=='undefined' || price==0 || price==''){
		price='';
	}else{
		price = price.toString();

		if(typeof window.tcart!='undefined' && typeof window.tcart['currency_dec']!='undefined' && window.tcart['currency_dec']=='00'){
			if(price.indexOf('.')===-1 && price.indexOf(',')===-1){
				price=price+'.00';
			}else{
				var foo=price.substr( price.indexOf('.')+1 );
				if(foo.length===1){
					price=price+'0';
				}
			}
		}

		price = price.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

		if(typeof window.tcart!='undefined' && typeof window.tcart['currency_sep']!='undefined' && window.tcart['currency_sep']=='.'){
			price = price.replace(',','.');
		}else{
			price = price.replace('.',',');
		}
	}
	return price;
}