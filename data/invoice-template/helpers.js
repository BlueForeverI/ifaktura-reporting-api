const {sDumi} = require('s-dumi');
const {ToWords} = require('to-words');

function isExpense(invoice) {
  return invoice.type == 'expense' || invoice.type == 'creditOrder';
}

function isOrder(invoice) {
  return invoice.type == 'debitOrder' || invoice.type == 'creditOrder';
}

function invoiceValue(invoice) {
  return invoice ? invoice.products.reduce((sum, current) => sum + current.price * current.quantity, 0) : 0;
}

function concat(a, b) {
  return a + b;
}

function mult(a, b) {
  return a * b;
}

function and(a, b) {
  return a && b;
}

function or(a, b) {
  return a || b;
}

function tern(a, b, c, d) {
  return a == b ? c : d;
}

function not(a) {
  return !a;
}

function equals(a, b) {
  return a == b;
}

function fixedNum(num) {
  if (typeof num === 'string') {
    num = parseFloat(num);
  }
  return num.toFixed(2);
}

function taxBase(invoice) {
  const baseValue = invoiceValue(invoice);
  const discount =  (invoice && invoice.discountType === 'percentage')
    ? (baseValue * (invoice ? invoice.discount : 0) / 100)
    : invoice ? invoice.discount : 0;
  return baseValue - discount;
}

function isBankTransfer(invoice) {
  return invoice.paymentMethod &&
    invoice.paymentMethod === 'bankTransfer';
}

function invoiceNumber(value) {
    if (/[a-zA-Z-]/.test(value)) {
      return value;
    }

    return value ? `${value}`.padStart(10, '0') : '';
  }

function dateFormat(date) {
    const parsed = new Date(date);
    return `${parsed.getDate().toString().padStart(2, '0')}/${(parsed.getMonth() + 1).toString().padStart(2, '0')}/${parsed.getFullYear()}`;
}

function formatNumber(number) {
  return parseFloat(number).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function deepFind(obj, path) {
  var paths = path.split('.')
    , current = obj
    , i;

  for (i = 0; i < paths.length; ++i) {
    if (current[paths[i]] == undefined) {
      return paths[i];
    } else {
      current = current[paths[i]];
    }
  }
  return current;
}

function numberToWords(value, invoice, options) {
    const numbersKey = 'app.invoices.numbers';
    const currencyKey = `${numbersKey}.currencies.${invoice.currency.name}`;

    let mainKeys = [toWords(value, options)];

    if (Math.floor(value) === 1) {
      mainKeys.push(`${currencyKey}.single`);
    } else {
      mainKeys.push(`${currencyKey}.multiple`);
    }

    const cents = parseInt(((value % 1) * 100).toFixed(2), 10);
    if (cents !== 0) {
      mainKeys.push(`${numbersKey}.and`);
      const subKeys = [toWords(cents, options)];

      if (cents === 1) {
        subKeys.push(`${currencyKey}.subSingle`);
      } else {
        subKeys.push(`${currencyKey}.subMultiple`);
      }

      mainKeys = mainKeys.concat(subKeys);
    }

    return mainKeys;
  }

function toWords(value, options) {
    const converter = new ToWords({
      localeCode: 'en-US',
      converterOptions: {
        currency: false,
        ignoreDecimal: true,
        ignoreZeroCurrency: true,
      }
    });
    let raw = sDumi(value);
    return options.language == 'en' 
      ? converter.convert(value).toLowerCase() 
      : raw.toLowerCase().substring(0, raw.indexOf(' лв'));
  }