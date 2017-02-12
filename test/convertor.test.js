const nock = require('nock');
const convertor = require('../src/convertor');

describe('convertor', () => {
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

  test('returns a result', () => {
    convertor()('EUR to USD').then((results) => {
      expect(results).toHaveLength(1);
      expect(results[0].title).toBeDefined();
      expect(results[0].value).toEqual('1 EUR = 1.25 USD');
    });
  });
});
