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

function tern(a, b, c, d) {
  return a == b ? c : d;
}

function equals(a, b) {
  return a == b;
}

function fixedNum(num) {
  return num.toFixed(2);
}

function taxBase(invoice) {
  const baseValue = invoiceValue(invoice);
  const discount =  (invoice && invoice.discountType === 'percentage')
    ? (baseValue * (invoice ? invoice.discount : 0) / 100)
    : invoice ? invoice.discount : 0;
  return baseValue - discount;
}

function taxAmount(invoice) {
  return taxBase(invoice) * (invoice ? invoice.vat : 0) / 100;
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
  return parseFloat(number).toLocaleString('en-US', {minimumFractionDigits: 2});
}

function deepFind(obj, path) {
  var paths = path.split('.')
    , current = obj
    , i;

  for (i = 0; i < paths.length; ++i) {
    if (current[paths[i]] == undefined) {
      return undefined;
    } else {
      current = current[paths[i]];
    }
  }
  return current;
}

function numberToWords(value, invoice) {
    const numbersKey = 'app.invoices.numbers';
    const currencyKey = `${numbersKey}.currencies.${invoice.currency.name}`;

    let mainKeys = toWords(value, numbersKey);

    if (Math.floor(value) === 1) {
      mainKeys.push(`${currencyKey}.single`);
    } else {
      mainKeys.push(`${currencyKey}.multiple`);
    }

    const cents = parseInt(((value % 1) * 100).toFixed(2), 10);
    if (cents !== 0) {
      mainKeys.push(`${numbersKey}.and`);
      const subKeys = toWords(cents, numbersKey);

      if (cents === 1) {
        subKeys.push(`${currencyKey}.subSingle`);
      } else {
        subKeys.push(`${currencyKey}.subMultiple`);
      }

      mainKeys = mainKeys.concat(subKeys);
    }

    return mainKeys;
  }

function toWords(value, numbersKey) {
    const thousands = Math.floor(value / 1000);
    const hundreds = Math.floor((value % 1000) / 100);
    const tens = Math.floor((value % 100) / 10);
    const ones = Math.floor(value % 10);
    let keys = [];

    if (thousands > 0) {
      if (thousands === 1) {
        keys.push(`${numbersKey}.1000`);
      } else if (thousands > 9) {
        keys = this.toWords(thousands, numbersKey);
        keys.push(`${numbersKey}.thousands`);
      } else {
        keys.push(`${numbersKey}.${thousands}`);
        keys.push(`${numbersKey}.thousands`);
      }
    }

    if (hundreds > 0) {
      keys.push(`${numbersKey}.${hundreds * 100}`);
    }

    if (hundreds !== 0 && tens === 0) {
      keys.push(`${numbersKey}.and`);
    }

    if (tens > 1) {
      if (ones === 0) {
        keys.push(`${numbersKey}.${tens * 10}`);
      } else {
        keys.push(`${numbersKey}.${tens * 10}`);
        keys.push(`${numbersKey}.and`);
        keys.push(`${numbersKey}.${ones}`);
      }
    } else if (tens === 1) {
      if (thousands !== 0 || hundreds !== 0) {
        keys.push(`${numbersKey}.and`);
      }

      keys.push(`${numbersKey}.${tens}${ones}`);
    } else if (ones > 0) {
      keys.push(`${numbersKey}.${ones}`);
    }

    return keys;
  }