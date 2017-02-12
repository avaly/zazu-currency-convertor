const nock = require('nock');
const utils = require('../src/utils');

describe('utils', () => {
  beforeEach(() => {
    nock('http://api.fixer.io')
      .get('/latest')
      .reply(200, {
        base: 'EUR',
        rates: {
          USD: 1.25,
          GBP: 1.9,
        },
      });
  });

  describe('parse', () => {
    const testAll = (cases) => {
      cases.forEach(([query, expected]) => {
        test(query, () => {
          expect(utils.parse(query)).toEqual(expected);
        });
      });
    };

    testAll([
      ['EUR to USD', { amount: 1, from: 'EUR', to: 'USD' }],
      ['usd in sek', { amount: 1, from: 'USD', to: 'SEK' }],
      ['gbp eur', { amount: 1, from: 'GBP', to: 'EUR' }],
      ['123 eur to NZD', { amount: 123, from: 'EUR', to: 'NZD' }],
      ['sad', null],
      ['now to', null],
      ['eur in us', null],
      ['abc eur in usd', null],
    ]);
  });

  describe('getRates', () => {
    it('fetches latest rates and caches', () => {
      return utils.getRates()
        .then(data => {
          expect(data.base).toEqual('EUR');
          expect(data.rates).toBeDefined();
          expect(data.rates.USD).toBeDefined();
        })
        .then(() => utils.getRates())
        .then(data => {
          expect(data.base).toEqual('EUR');
        });
    });
  });

  describe('convert', () => {
    it('converts valid currencies from base', () => {
      return utils.convert({
        amount: 5,
        from: 'EUR',
        to: 'USD',
      }).then((result) => {
        expect(result).toEqual(6.25);
      });
    });

    it('converts valid currencies to base', () => {
      return utils.convert({
        amount: 5,
        from: 'GBP',
        to: 'EUR',
      }).then((result) => {
        expect(result).toBeCloseTo(2.632);
      });
    });

    it('converts valid currencies without base', () => {
      return utils.convert({
        amount: 5,
        from: 'GBP',
        to: 'USD',
      }).then((result) => {
        expect(result).toBeCloseTo(3.289);
      });
    });

    it('converts big numbers', () => {
      return utils.convert({
        amount: 12345678,
        from: 'EUR',
        to: 'USD',
      }).then((result) => {
        expect(result).toBeCloseTo(15432097.5);
      });
    });

    it('returns null for unknown to', () => {
      return utils.convert({
        amount: 5,
        from: 'EUR',
        to: 'FOO',
      }).then((result) => {
        expect(result).toBe(null);
      });
    });

    it('returns null for unknown from', () => {
      return utils.convert({
        amount: 5,
        from: 'FOO',
        to: 'EUR',
      }).then((result) => {
        expect(result).toBe(null);
      });
    });
  });
});
