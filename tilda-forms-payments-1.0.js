/* Fields in the form indicating the need to create an order  */
  window.tildaForm.addPaymentInfoToForm = function (form) {
  if (!(form instanceof Element)) form = form[0];

  var allRecords = document.getElementById('allrecords');
  var inputPayment = form.querySelector('.js-tilda-payment');

  if (inputPayment) t_removeEl(inputPayment);

  var product = '';
  var productDiscount = 0;

  window.tildaForm.tildapayment = {};
  window.tildaForm.arProductsForStat = [];
  window.tildaForm.orderIdForStat = '';
  window.tildaForm.amountForStat = 0;
  window.tildaForm.currencyForStat = '';

  var currencyCode = allRecords.getAttribute('data-tilda-currency') || '';

  if (!currencyCode) {
    var t706block = document.querySelector('.t706');
    currencyCode = t706block ? t706block.getAttribute('data-project-currency-code') : '';
  }

  if (currencyCode) {
    window.tildaForm.currencyForStat = currencyCode;
    window.tildaForm.tildapayment['currency'] = currencyCode;
  } else if (window.tcart.currency) {
    window.tildaForm.currencyForStat = window.tcart.currency;
    window.tildaForm.tildapayment['currency'] = window.tcart.currency;
  }

  var inputRadio = document.querySelector('.t-radio_delivery:checked');

  if (!window.tcart.delivery && inputRadio && parseInt(inputRadio.getAttribute('data-delivery-price'), 10) > 0) {
    try {
      window.tildaForm.tildapayment = false;
      window.location.reload();
      return false;
    } catch (error) { /* */ }
  }

  window.tildaForm.amountForStat = window.tcart.amount;
  window.tildaForm.tildapayment['amount'] = window.tcart.amount;

  if (window.tcart.system) {
    window.tildaForm.tildapayment['system'] = window.tcart.system;
  } else {
    window.tildaForm.tildapayment['system'] = 'auto';
  }

  if (window.tcart.promocode && window.tcart.promocode.promocode) {
    window.tildaForm.tildapayment['promocode'] = window.tcart.promocode.promocode;

    if (window.tcart.prodamount_discountsum && parseFloat(window.tcart.prodamount_discountsum) > 0) {
      window.tildaForm.tildapayment['discount'] = window.tcart.prodamount_discountsum;
      productDiscount = window.tcart.prodamount_discountsum;
    } else if (window.tcart.amount_discountsum && parseFloat(window.tcart.amount_discountsum) > 0) {
      window.tildaForm.tildapayment['discount'] = window.tcart.amount_discountsum;
      productDiscount = window.tcart.amount_discountsum;
    }

    if (window.tcart.prodamount_withdiscount && parseFloat(window.tcart.prodamount_withdiscount) > 0) {
      window.tildaForm.tildapayment['prodamount_withdiscount'] = window.tcart.prodamount_withdiscount;
    }

    if (window.tcart.amount_withoutdiscount && parseFloat(window.tcart.amount_withoutdiscount) > 0) {
      window.tildaForm.tildapayment['amount_withoutdiscount'] = window.tcart.amount_withoutdiscount;
    }
  }

  if (window.tcart.prodamount && parseFloat(window.tcart.prodamount) > 0) {
    window.tildaForm.tildapayment['prodamount'] = window.tcart.prodamount;
  }

  /* remove empty or deleted products */
  var arrProducts = [];
  var products = window.tcart['products'];

  Array.prototype.forEach.call(products, function (product) {
    if (!t_isEmptyObject(product) && product.deleted !== 'yes') {
      arrProducts.push(product);
    }
  });

  window.tcart['products'] = arrProducts;

  var dateNow = new Date();
  var offsetFrom_UTC_to_Local = dateNow.getTimezoneOffset();

  window.tildaForm.tildapayment['timezoneoffset'] = offsetFrom_UTC_to_Local;

  var objProduct = {};
  var optionLabel = '';
  var productsCount = 0;

  if (window.tcart.products && window.tcart.products.length > 0) {
    productsCount = window.tcart.products.length;
  }

  window.tildaForm.tildapayment['products'] = [];

  for (var i = 0; i < productsCount; i++) {
    var product = window.tcart.products[i];

    objProduct = {};
    optionLabel = '';
    window.tildaForm.tildapayment['products'][i] = {};

    for (var j in product) {
      if (typeof (product[j]) !== 'function') {
        if (j === 'options') {
          window.tildaForm.tildapayment['products'][i][j] = {};

          for (var k in product[j]) {
            if (!window.tildaForm.tildapayment['products'][i][j][k]) {
              window.tildaForm.tildapayment['products'][i][j][k] = {};
            }
            if (product[j][k]['option']) {
              window.tildaForm.tildapayment['products'][i][j][k]['option'] = product[j][k]['option'];
            }
            if (product[j][k]['price'] && product[j][k]['price'] > 0) {
              window.tildaForm.tildapayment['products'][i][j][k]['price'] = product[j][k]['price'];
            }
            if (product[j][k]['variant']) {
              window.tildaForm.tildapayment['products'][i][j][k]['variant'] = product[j][k]['variant'];
            }
            if (product[j][k]['option'] && product[j][k]['variant']) {
              if (optionLabel) {
                optionLabel = optionLabel + ', ';
              }
              optionLabel = optionLabel + product[j][k]['option'] + ':' + product[j][k]['variant'];
            }
          }
        } else {
          window.tildaForm.tildapayment['products'][i][j] = product[j];
        }
      }
    }

    if (product.sku) {
      objProduct.id = product.sku;
    } else if (product.uid) {
      objProduct.id = product.uid;
    }
    objProduct.name = product.name;
    if (product.price) {
      objProduct.price = product.price;
      objProduct.quantity = parseInt(product.amount / product.price);
    } else if (product.quantity && product.quantity > 1) {
      objProduct.price = product.amount / product.quantity;
      objProduct.quantity = product.quantity;
    } else {
      objProduct.price = product.amount;
      objProduct.quantity = 1;
    }

    objProduct.name = product.name;

    if (optionLabel) {
      objProduct.name = objProduct.name + '(' + optionLabel + ')';
    }

    if (product.sku) {
      objProduct.sku = product.sku;
    }

    if (product.uid) {
      objProduct.uid = product.uid;
    }

    window.tildaForm.arProductsForStat.push(objProduct);
  }

  var priceDelivery = 0;

  if (window.tcart.delivery && window.tcart.delivery.name) {
    window.tildaForm.tildapayment['delivery'] = {
      name: window.tcart.delivery.name,
    };

    if (window.tcart.delivery && window.tcart.delivery.price >= 0) {
      priceDelivery = window.tcart.delivery.price;
      window.tildaForm.tildapayment['delivery']['price'] = window.tcart.delivery.price;

      if (window.tcart.prodamount > 0 && window.tcart.delivery.freedl && window.tcart.delivery.freedl > 0) {
        window.tildaForm.tildapayment['delivery']['freedl'] = window.tcart.delivery.freedl;
        if ((window.tcart.prodamount - productDiscount) >= window.tcart.delivery.freedl) {
          priceDelivery = 0;
        }
      }

      objProduct = {
        name: window.tcart.delivery.name,
        price: priceDelivery,
        quantity: 1,
        id: 'delivery',
      };

      window.tildaForm.arProductsForStat.push(objProduct);
    }
  }

  try {
    var keysForTildaPayment = [
      'city',
      'street',
      'pickup-name',
      'pickup-address',
      'pickup-id',
      'house',
      'entrance',
      'floor',
      'aptoffice',
      'phone',
      'entrancecode',
      'comment',
      'service-id',
      'hash',
      'postalcode',
      'country',
      'userinitials',
      'onelineaddress',
    ];

    Array.prototype.forEach.call(keysForTildaPayment, function (keyPayment) {
      if (window.tcart.delivery && window.tcart.delivery[keyPayment]) {
        window.tildaForm.tildapayment['delivery'][keyPayment] = window.tcart.delivery[keyPayment];
      }
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * We go for payment after sending the data to the forms server
 *
 * @param {Node} form - block form
 * @param {Object} objNext - obj data after successful sending
 * @returns {boolean} - return true/false
 */
window.tildaForm.payment = function (form, objNext) {
  if (!(form instanceof Element)) form = form[0];

  var successBox = form.querySelector('.js-successbox');

  if (form.getAttribute('data-formpaymentoff') === 'y') {
    window.tildaForm.clearTCart(form);
    return;
  }

  if (successBox) {
    var successBoxText = successBox.textContent || successBox.innerText;
    if (successBoxText) {
      form.tildaSuccessMessage = successBoxText;
    }

    if (t_forms__getMsg('successorder')) {
      successBox.innerHTML = t_forms__getMsg('successorder');
    }

    successBox.style.display = 'block';
  }

  t_addClass(form, 'js-send-form-success');

  if (objNext.type === 'link') {
    window.tildaForm.clearTCart(form);

    if (objNext.message && successBox) {
      successBox.innerHTML = objNext.message;
      successBox.style.display = 'block';
    }

    window.location.href = objNext.value;
    return true;
  }

  if (objNext.type === 'form') {
    var paymentForm = document.getElementById('js-tilda-payment-formid');
    var strHtml = '';
    var valueKey = '';

    if (paymentForm) {
      t_removeEl(paymentForm);
    }

    strHtml = '<form id="js-tilda-payment-formid" action="' + objNext.value.action + '" method="post"  style="position: absolue; opacity: 0; width: 1px; height: 1px; left: -5000px;">';
    objNext.value.action = '';

    for (var key in objNext.value) {
      valueKey = objNext.value[key];
      if (typeof (valueKey) !== 'function' && valueKey) {
        strHtml += "<input type='hidden' name='" + key + "' value='" + valueKey + "' >";
      }
    }

    strHtml += '</form>';

    document.body.insertAdjacentHTML('beforeend', strHtml);
    paymentForm = document.getElementById('js-tilda-payment-formid');
    window.tildaForm.clearTCart(form);

    if (paymentForm.getAttribute('action')) {
      paymentForm.submit();
    } else {
      setTimeout(function () {
        paymentForm.submit();
      }, 200);
    }
  }

  if (objNext.type === 'function') {
    var arrArgs = objNext.value.args;

    if (objNext.value.functioncode) {
      window.tildaForm.paysystemRun(objNext.value.script, objNext.value.sysname, form, objNext.value.functioncode, arrArgs);
    } else {
      /**
       * This check on jQuery is necessary for case, if function
       * works with jQuery object
       */

      if (typeof jQuery !== 'undefined') {
        eval(objNext.value.name + '($(form), arrArgs);');
      } else {
        eval(objNext.value.name + '(form, arrArgs);');
      }
    }

    return false;
  } else {
    window.tildaForm.clearTCart(form);

    if (objNext.type === 'text' && objNext.message && successBox) {
      successBox.innerHTML = objNext.message;
      successBox.style.display = 'block';
    }
  }
};

/**
 * Add pay system script
 *
 * @param {string} linkScript - src on script
 * @param {string} systemName - str system name
 * @returns
 */
window.tildaForm.paysystemScriptLoad = function (linkScript, systemName) {
  if (!systemName || !linkScript || linkScript.substring(0, 4) !== 'http') {
    console.log('Wrong script parameters.');
    return false;
  }

  if (!window.scriptSysPayment) {
    window.scriptSysPayment = {};
  }

  if (!window.scriptSysPayment[systemName] || window.scriptSysPayment[systemName] !== true) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = linkScript;
    document.body.appendChild(script);
    window.scriptSysPayment[systemName] = true;
  }
};

/**
 * Init pay system script
 *
 * @param {string} linkScript - src on script
 * @param {string} systemName - str system name
 * @param {Node} form - block form
 * @param {string} functionCode - str function code to execute
 * @param {Object} arArgs - obj data for pay system
 * @returns {boolean} - return false
 */
window.tildaForm.paysystemRun = function (linkScript, systemName, form, functionCode, arArgs) {
  if (!(form instanceof Element)) form = form[0];

  if (!window.scriptSysPayment) {
    window.scriptSysPayment = {};
  }

  if (!window.scriptSysPayment[systemName] || window.scriptSysPayment[systemName] !== true) {
    window.tildaForm.paysystemScriptLoad(linkScript, systemName);
    window.setTimeout(function () {
      window.tildaForm.paysystemRun(linkScript, systemName, form, functionCode, arArgs);
    }, 200);
    return false;
  }

  /* functionCode accepts args in jq el and old name params */
  var script = linkScript;
  var sysname = systemName;
  var functioncode = functionCode;
  var objArgs = arArgs;

  if (typeof jQuery !== 'undefined') {
    var $jform = $(form);
  }

  eval(functionCode);
};

/**
 * Action on successful payment
 *
 * @param {Node} form - block form
 * @param {Object} arArgs - obj data
 */
window.tildaForm.paysystemSuccess = function (form, arArgs) {
  if (!(form instanceof Element)) form = form[0];

  window.tildaForm.clearTCart(form);

  var allRecords = document.getElementById('allrecords');
  var formId = form.getAttribute('id');
  var successBox = form.querySelector('.js-successbox');
  var linkPage = '/tilda/' + formId + '/payment/';
  var title = 'Pay order in form ' + formId;
  var price = arArgs.amount;
  var product = arArgs.description;
  var dataSuccessMessage = '';

  if (window.Tilda && typeof window.Tilda.sendEventToStatistics === 'function') {
    var currencyCode = allRecords.getAttribute('data-tilda-currency') || '';

    if (!currencyCode) {
      var t706block = document.querySelector('.t706');
      currencyCode = t706block ? t706block.getAttribute('data-project-currency-code') : '';
    }

    if (!currencyCode) {
      allRecords.setAttribute('data-tilda-currency', arArgs.currency);
    }
    window.Tilda.sendEventToStatistics(linkPage, title, product, price);
  }

  if (form.tildaSuccessMessage) {
    dataSuccessMessage = form.tildaSuccessMessage;
  }

  if (arArgs.successurl) {
    window.setTimeout(function () {
      window.location.href = arArgs.successurl;
    }, 300);
  }

  successBox.innerHTML = dataSuccessMessage ? dataSuccessMessage : '';
  form.tildaSuccessMessage = '';
  var dataSuccessCallback = form.getAttribute('data-success-callback');
  window.tildaForm.successEnd(form, arArgs.successurl, dataSuccessCallback);
  t_triggerEvent(form, 'tildaform:aftersuccess');
};

/* Add stripe pay script */
window.tildaForm.stripeLoad = function () {
  if (window.stripeapiiscalled) return;
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://checkout.stripe.com/checkout.js';
  document.body.appendChild(script);
  window.stripeapiiscalled = true;
};

/**
 * Add stripe pay
 *
 * @param {Node} form - block form
 * @param {Object} arArgs obj data
 * @returns {boolean} - return true/false
 */
window.tildaForm.stripePay = function (form, arArgs) {
  if (!(form instanceof Element)) form = form[0];

  if (window.stripeapiiscalled !== true) {
    window.tildaForm.stripeLoad();
    window.setTimeout(function () {
      window.tildaForm.stripePay(form, arArgs);
    }, 200);
    return false;
  }

  var allRecords = document.getElementById('allrecords');
  var companyName = arArgs.companyname;
  var companyLogo = arArgs.companylogo;

  if (!companyName) {
    companyName = window.location.host;
  }

  if (!window.stripehandler) {
    if (typeof window.StripeCheckout !== 'object') {
      window.setTimeout(function () {
        window.tildaForm.stripePay(form, arArgs);
      }, 200);
      return false;
    }

    var objStripeInit = {
      key: arArgs.accountid,
      image: companyLogo,
      name: companyName,
      locale: 'auto',
    };

    if (arArgs.zipCode && arArgs.zipCode === 1) {
      objStripeInit.zipCode = true;
    }

    if (arArgs.billingAddress && arArgs.billingAddress === 1) {
      objStripeInit.billingAddress = true;
    }

    if (arArgs.shipping && arArgs.shipping === 1) {
      objStripeInit.shippingAddress = true;
    }

    window.stripehandler = window.StripeCheckout.configure(objStripeInit);

    /* close checkout on page navigation: */
    t_addEventListener(window, 'popstate', function () {
      window.stripehandler.close();
    });
  }

  window.tildaForm.orderIdForStat = arArgs.invoiceid;
  var multiple = 100;

  if (arArgs.multiple && arArgs.multiple > 0) {
    multiple = parseInt(arArgs.multiple, 10);
  }

  var formId = form.getAttribute('id');

  window.stripehandler.open({
    name: companyName,
    image: companyLogo,
    description: arArgs.description,
    amount: parseInt((parseFloat(arArgs.amount) * multiple).toFixed()),
    currency: arArgs.currency,
    shippingAddress: arArgs.shipping == '1',
    email: arArgs.email > '' ? arArgs.email : '',
    token: function (token) {
      if (token && token.id) {
        var dataForm = [{
            name: 'projectid',
            value: arArgs.projectid,
          },
          {
            name: 'invoiceid',
            value: arArgs.invoiceid,
          },
          {
            name: 'token',
            value: token.id,
          },
          {
            name: 'email',
            value: token.email,
          },
          {
            name: 'currency',
            value: arArgs.currency,
          },
          {
            name: 'amount',
            value: parseInt((parseFloat(arArgs.amount) * multiple).toFixed()),
          },
        ];

        dataForm = t_formData(dataForm);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://' + window.tildaForm.endpoint + '/payment/stripe/', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 400) {
              var data = xhr.responseText;
              if (data) {
                var objData = JSON.parse(data);
                if (typeof objData === 'object') {
                  window.tildaForm.clearTCart(form);

                  /* action on successful payment */
                  var linkPage = '/tilda/' + formId + '/payment/';
                  var title = 'Pay order in form ' + formId;
                  var price = arArgs.amount;
                  var product = arArgs.description;

                  if (window.Tilda && typeof window.Tilda.sendEventToStatistics === 'function') {
                    var t706block = document.querySelector('.t706');

                    if (!allRecords.getAttribute('data-tilda-currency') && (!t706block || !t706block.getAttribute('data-project-currency-code'))) {
                      allRecords.setAttribute('data-tilda-currency', arArgs.currency);
                    }

                    window.Tilda.sendEventToStatistics(linkPage, title, product, price);
                  }

                  if (form.tildaSuccessMessage) {
                    dataSuccessMessage = form.tildaSuccessMessage;
                  }

                  if (arArgs.successurl) {
                    window.setTimeout(function () {
                      window.location.href = arArgs.successurl;
                    }, 300);
                  }

                  successBox.innerHTML = dataSuccessMessage ? dataSuccessMessage : '';
                  form.tildaSuccessMessage = '';
                  var dataSuccessCallback = form.getAttribute('data-success-callback');
                  window.tildaForm.successEnd(form, arArgs.successurl, dataSuccessCallback);
                  t_triggerEvent(form, 'tildaform:aftersuccess');
                }
              }
            }
          }
        };
        xhr.send(dataForm);
      }
    }
  });
};

/* Add widget cloud payments to page (Payment system) */
window.tildaForm.cloudpaymentLoad = function () {
  if (window.cloudpaymentsapiiscalled) return;
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://widget.cloudpayments.ru/bundles/cloudpayments.js';
  document.body.appendChild(script);
  window.cloudpaymentsapiiscalled = true;
};

/**
 * Init widget cloud payments for form cart (Payment system)
 *
 * @param {Node} form - block form
 * @param {Object} arArgs - obj data for widget
 * @returns {boolean} - return false
 */
window.tildaForm.cloudpaymentPay = function (form, arArgs) {
  if (!(form instanceof Element)) form = form[0];

  if (window.cloudpaymentsapiiscalled !== true) {
    window.tildaForm.cloudpaymentLoad();
    window.setTimeout(function () {
      window.tildaForm.cloudpaymentPay(form, arArgs);
    }, 200);
    return false;
  }

  var allRecords = document.getElementById('allrecords');
  var formId = form.getAttribute('id');
  var successBox = form.querySelector('.js-successbox');
  var dataSuccessMessage = '';
  var currency = arArgs.currency;
  var language = arArgs.language;
  var initCP = {};

  if (!language) {
    if (currency == 'RUB' || currency == 'BYR' || currency == 'BYN' || currency == 'RUR') {
      language = 'ru-RU';
    } else if (currency == 'UAH') {
      language = 'uk';
    } else {
      language = 'en-US';
    }
  }

  if (!window.cloudpaymentshandler) {
    if (typeof window.cp !== 'object') {
      window.setTimeout(function () {
        window.tildaForm.cloudpaymentPay(form, arArgs);
      }, 200);
      return false;
    }

    initCP = {
      language: language,
    };

    if (arArgs.applePaySupport && arArgs.applePaySupport === 'off') {
      initCP.applePaySupport = false;
    }

    if (arArgs.googlePaySupport && arArgs.googlePaySupport === 'off') {
      initCP.googlePaySupport = false;
    }

    window.cloudpaymentshandler = new cp.CloudPayments(initCP);
  }

  var objData = {};
  objData.projectid = arArgs.projectid;

  if (arArgs.cloudPayments && (arArgs.cloudPayments.recurrent || arArgs.cloudPayments.customerReceipt)) {
    objData.cloudPayments = arArgs.cloudPayments;
  }

  var oldStyle = '';
  var popup = form.closest('.t-popup_show');

  if (!popup) popup = form.closest('.t706__cartwin_showed');
  if (popup) {
    oldStyle = popup.getAttribute('style');
    popup.style.zIndex = 100;
  }

  window.tildaForm.orderIdForStat = arArgs.invoiceId;

  if (!arArgs.skin) {
    arArgs.skin = 'classic';
  }

  window.cloudpaymentshandler.charge({
      publicId: arArgs.publicId,
      description: arArgs.description,
      amount: parseFloat(arArgs.amount),
      currency: currency,
      accountId: arArgs.accountId,
      invoiceId: arArgs.invoiceId,
      requireEmail: arArgs.requireEmail === true ? true : false,
      email: arArgs.email,
      skin: arArgs.skin,
      data: objData,
    },
    /* In case of success */
    function (options) {
      window.cloudpaymentshandler = false;

      if (popup && oldStyle) {
        popup.setAttribute('style', oldStyle);
      }

      /* action on successful payment */
      var linkPage = '/tilda/' + formId + '/payment/';
      var title = 'Pay order in form ' + formId;
      var price = arArgs.amount;
      var product = arArgs.description;

      allRecords.setAttribute('data-tilda-currency', currency);

      if (window.Tilda && typeof window.Tilda.sendEventToStatistics === 'function') {
        window.Tilda.sendEventToStatistics(linkPage, title, product, price);
      }

      window.tildaForm.clearTCart(form);

      if (arArgs.successurl) {
        window.setTimeout(function () {
          window.location.href = arArgs.successurl;
        }, 300);
      }

      if (form.tildaSuccessMessage) dataSuccessMessage = form.tildaSuccessMessage;
      dataSuccessMessage ? successBox.innerHTML = dataSuccessMessage : successBox.innerHTML = '';
      form.tildaSuccessMessage = '';
      var dataSuccessCallback = form.getAttribute('data-success-callback');
      window.tildaForm.successEnd(form, arArgs.successurl, dataSuccessCallback);
      t_triggerEvent(form, 'tildaform:aftersuccess');
    },
    /* In case of fail */
    function (reason, options) {
      if (popup && oldStyle) {
        popup.setAttribute('style', oldStyle);
      }

      successBox.style.display = 'none';
      if (form.tildaSuccessMessage) dataSuccessMessage = form.tildaSuccessMessage;
      dataSuccessMessage ? successBox.innerHTML = dataSuccessMessage : successBox.innerHTML = '';
      form.tildaSuccessMessage = '';
      window.cloudpaymentshandler = false;

      if (arArgs.failureurl) {
        window.location.href = arArgs.failureurl;
      } else {
        if (popup) {
          var popupProducts = popup.querySelector('.t706__cartwin-products');
          var popupWrapMount = popup.querySelector('.t706__cartwin-prodamount-wrap');
          var popupBottomText = popup.querySelector('.t706__form-bottom-text');

          if (popupProducts) popupProducts.style.display = 'block';
          if (popupWrapMount) popupWrapMount.style.display = 'block';
          if (popupBottomText) popupBottomText.style.display = 'block';
        }

        var formInputsBox = form.querySelector('.t-form__inputsbox');
        if (formInputsBox) formInputsBox.style.display = 'block';

        try {
          tcart__lockScroll();
        } catch (error) { /* */ }
      }
    }
  );

  return false;
};

/**
 * Add popup bank transfer form (Leave company details)
 *
 * @param {Node} form - block form
 * @param {Object} arArgs - obj data
 * @param {boolean} sendStat - flag true/false
 */
window.tildaForm.sendStatAndShowMessage = function (form, arArgs, sendStat) {
  if (!(form instanceof Element)) form = form[0];

  var allRecords = document.getElementById('allrecords');
  var formId = form.getAttribute('id');
  var successBox = form.querySelector('.js-successbox');
  var dataSuccessPopup = form.getAttribute('data-success-popup');
  var dataSuccessMessage = '';

  /* action on successful payment */
  if (sendStat) {
    var linkPage = '/tilda/' + formId + '/payment/';
    var title = 'Pay order in form ' + formId;
    var price = arArgs.amount;
    var product = arArgs.description;

    if (window.Tilda && typeof window.Tilda.sendEventToStatistics === 'function') {
      var t706block = document.querySelector('.t706');

      if (!allRecords.getAttribute('data-tilda-currency') && (!t706block || !t706block.getAttribute('data-project-currency-code'))) {
        allRecords.setAttribute('data-tilda-currency', arArgs.currency);
      }

      window.Tilda.sendEventToStatistics(linkPage, title, product, price);
    }
  }

  if (successBox) {
    if (dataSuccessPopup === 'y') {
      successBox.style.display = 'none';
    }

    if (arArgs.successmessage) {
      successBox.innerHTML = arArgs.successmessage;
    } else if (form.tildaSuccessMessage) {
      successBox.innerHTML = form.tildaSuccessMessage;
    } else if (t_forms__getMsg('success')) {
      successBox.innerHTML = t_forms__getMsg('success');
    } else {
      successBox.innerHTML = '';
    }

    form.tildaSuccessMessage = '';

    if (dataSuccessPopup === 'y') {
      window.tildaForm.showSuccessPopup(successBox.textContent || successBox.innerText);
    } else {
      successBox.style.display = 'block';
    }
  }

  t_addClass(form, 'js-send-form-success');
  window.tildaForm.clearTCart(form);

  if (arArgs.successurl) {
    window.setTimeout(function () {
      window.location.href = arArgs.successurl;
    }, 300);
  }

  var successCallback = form.getAttribute('data-success-callback');

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
  }

  var upwidgetRemoveBtns = form.querySelectorAll('.t-upwidget-container__data_table_actions_remove svg');
  var inputText = form.querySelectorAll('input[type="text"]');
  var inputPhone = form.querySelectorAll('input[type="tel"]');
  var inputTextarea = form.querySelectorAll('textarea');

  /* replace to public function */
  Array.prototype.forEach.call(upwidgetRemoveBtns, function (widget) {
    t_triggerEvent(widget, 'click');
  });

  Array.prototype.forEach.call(inputText, function (text) {
    text.value = '';
  });

  Array.prototype.forEach.call(inputPhone, function (phone) {
    phone.value = '';
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

  t_triggerEvent(form, 'tildaform:aftersuccess');
};

/**
 * Add bank transfer pay, init at bank transfer, send an application after entering the details in one field
 *
 * @param {Node} form block form
 * @param {Object} arArgs - obj data
 */
window.tildaForm.banktransferPay = function (form, arArgs) {
  if (!(form instanceof Element)) form = form[0];

  if (arArgs && arArgs.condition === 'fast') {
    window.tildaForm.sendStatAndShowMessage(form, arArgs, true);
  } else {
    if (arArgs && arArgs.html) {
      var body = document.body;
      var allRecords = document.getElementById('allrecords');

      allRecords.insertAdjacentHTML('beforeend', '<div id="banktransfer">' + arArgs.html + '</div>');

      var bankTransfer = document.getElementById('banktransfer');
      var popupBankTransfer = document.querySelector('.t-banktransfer');
      var popupCloseBtn = popupBankTransfer.querySelector('.t-popup__close');

      /* Close popup */
      /* eslint-disable-next-line no-inner-declarations */
      function t_forms__closePopup() {
        t_removeClass(body, 't-body_popupshowed');
        if (bankTransfer) t_removeEl(bankTransfer);

        try {
          if (typeof tcart__closeCart == 'function') {
            tcart__closeCart();

            /* the animation of hiding the cart lasts 300 ms */
            setTimeout(function () {
              var popup = form.closest('.t-popup_show');
              if (!popup) popup = form.closest('.t706__cartwin_showed');

              var popupProducts = popup.querySelector('.t706__cartwin-products');
              var popupWrapMount = popup.querySelector('.t706__cartwin-prodamount-wrap');
              var popupBottomText = popup.querySelector('.t706__form-bottom-text');
              var formInputsBox = form.querySelector('.t-form__inputsbox');

              if (popupProducts) popupProducts.style.display = 'block';
              if (popupWrapMount) popupWrapMount.style.display = 'block';
              if (popupBottomText) popupBottomText.style.display = 'block';
              if (formInputsBox) formInputsBox.style.display = 'block';
            }, 300);
          }
        } catch (error) { /* */ }
        return false;
      }

      t_removeEventListener(popupCloseBtn, 'click', t_forms__closePopup);
      t_addEventListener(popupCloseBtn, 'click', t_forms__closePopup);
      t_addClass(body, 't-body_popupshowed');

      var bankForm = document.getElementById('formbanktransfer');
      var arrErrors = [];

      /**
       * Send popup
       *
       * @param {MouseEvent} event - event
       * @returns {boolean} - return false
       */
      // eslint-disable-next-line no-inner-declarations
      function t_forms__sendPopup(event) {
        event = event || window.event;
        event.preventDefault ? event.preventDefault() : (event.returnValue = false);

        arrErrors = window.tildaForm.validate(bankForm);

        if (arrErrors && arrErrors.length > 0) {
          window.tildaForm.showErrors(bankForm, arrErrors);
          return false;
        }

        var dataForm = t_serializeArray(bankForm);
        dataForm = t_formData(dataForm);

        var xhr = new XMLHttpRequest();

        xhr.open('POST', 'https://' + window.tildaForm.endpoint + '/payment/banktransfer/', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 400) {
              var data = xhr.responseText;
              if (data) {
                var objData = JSON.parse(data);
                if (typeof objData === 'object') {
                  t_removeClass(body, 't-body_popupshowed');

                  if (bankTransfer) {
                    t_removeEl(bankTransfer);
                  }

                  if (!objData) {
                    objData = {
                      error: 'Unknown error. Please reload page and try again later.'
                    };
                  }
                  if (objData && objData.error) {
                    alert(objData.error);
                    return false;
                  }

                  window.tildaForm.sendStatAndShowMessage(form, arArgs, true);
                }
              }
            } else {
              t_removeClass(body, 't-body_popupshowed');

              if (bankTransfer) {
                t_removeEl(bankTransfer);
              }

              alert(objData);
            }
          }
        };
        xhr.send(dataForm);
      }

      if (bankForm) {
        t_removeEventListener(bankForm, 'submit', t_forms__sendPopup);
        t_addEventListener(bankForm, 'submit', t_forms__sendPopup);
      }
    } else {
      window.tildaForm.sendStatAndShowMessage(form, arArgs, true);
    }
  }
};

/* Function isEmptyObject for IE8+ */
function t_isEmptyObject(obj) {
	for (var key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			return false;
		}
	}
	return true;
}