const fetch = require('node-fetch');

const PROVIDER = 'http://api.fixer.io/latest';

let ratesData = null;
let ratesMatrix = {};

const createMatrix = () => {
  const {base, rates} = ratesData;
  const currencies = [ratesData.base].concat(Object.keys(ratesData.rates));
  ratesMatrix = {};
  currencies.forEach(a => {
    ratesMatrix[a] = {};
    currencies.forEach(b => {
      if (a === b) {
        ratesMatrix[a][b] = null;
      } else {
        if (a === base) {
          ratesMatrix[a][b] = rates[b];
        } else if (b === base) {
          ratesMatrix[a][b] = 1 / rates[a];
        } else {
          ratesMatrix[a][b] = rates[b] / rates[a];
        }
      }
    });
  });
};

module.exports = {
  parse(query) {
    const match = query.match(
      /^(\d+)?\s*([a-z]{3})\s+((in|to)\s+)?([a-z]{3})$/i
    );
    if (!match) {
      return null;
    }

    const parsed = {
      amount: 1,
      from: match[2].toUpperCase(),
      to: match[5].toUpperCase(),
    };
    if (match[1]) {
      parsed.amount = parseInt(match[1], 10);
    }

    return parsed;
  },

  getRates() {
    if (ratesData) {
      return Promise.resolve(ratesData);
    }

    return fetch(PROVIDER)
      .then((response) => response.json())
      .then((data) => {
        ratesData = data;
        createMatrix();
        return ratesData;
      });
  },

  convert(parsed) {
    return this.getRates()
      .then(() => {
        const {
          amount,
          from,
          to,
        } = parsed;

        if (!ratesMatrix[from] || !ratesMatrix[from][to]) {
          return null;
        }

        const result = amount * ratesMatrix[from][to];

        return result;
      });
  },
};
