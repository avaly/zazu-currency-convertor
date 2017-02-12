const utils = require('./utils');

module.exports = (pluginContext) => {
  return (query, env = {}) => {
    return new Promise((resolve, reject) => {
      const parsed = utils.parse(query);
      if (!parsed) {
        return reject(false);
      }

      utils.convert(parsed)
        .then((amount) => {
          if (!amount) {
            return reject(false);
          }

          const value = `${parsed.amount.toLocaleString()} ${parsed.from} = ` +
            `${amount.toLocaleString()} ${parsed.to}`;

          resolve([
            {
              icon: 'fa-money',
              title: `Currency Convertor: ${query}`,
              subtitle: 'Use ISO currency identifiers (e.g. USD, EUR, GBP)',
              value: value,
            },
          ]);
        });
    });
  };
};
