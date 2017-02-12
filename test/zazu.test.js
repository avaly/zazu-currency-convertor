const zazu = require('../zazu.json');

describe('zazu.json', () => {
  it('is valid', () => {
    expect(zazu).toBeDefined();
    expect(zazu.name).toEqual('zazu-currency-convertor');
    expect(zazu.blocks).toBeDefined();
    expect(zazu.blocks.input).toBeDefined();
    expect(zazu.blocks.output).toBeDefined();
  });
});
