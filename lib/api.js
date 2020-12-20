const { request } = require('https');
const debug = require('debug')('isdayoff');

const formatDate = (date) => {
  const y = `0000${date.getFullYear()}`.slice(-4);
  const m = `00${date.getMonth() + 1}`.slice(-2);
  const d = `00${date.getDate()}`.slice(-2);
  return `${y}${m}${d}`;
};

const callApi = ({
  year = (new Date()).getFullYear(),
  month,
  date,
  start,
  end,
  country,
  pre,
  covid
}) => new Promise((resolve, reject) => {
  let buffer = '';

  const options = {
    hostname: 'isdayoff.ru',
    method: 'GET'
  };
  if (typeof year !== 'undefined') {
    options.path = `/api/getData?year=${year}`;
    if (typeof month !== 'undefined') {
      options.path += `&month=${`00${month + 1}`.slice(-2)}`;
      if (typeof date !== 'undefined') {
        options.path += `&day=${`00${date}`.slice(-2)}`;
      }
    }
  }
  if (typeof start !== 'undefined') {
    options.path = `/api/getData?date1=${formatDate(start)}`;
    if (typeof end !== 'undefined') {
      options.path += `&date2=${formatDate(end)}`;
    }
  }

  if (typeof country !== 'undefined') {
    options.path += `&cc=${country}`;
  }
  if (typeof pre !== 'undefined') {
    options.path += `&pre=${pre ? 1 : 0}`;
  }
  if (typeof covid !== 'undefined') {
    options.path += `&covid=${covid ? 1 : 0}`;
  }

  debug(`URL: ${options.hostname}${options.path}`);
  const req = request(options, (res) => {
    debug(`STATUS: ${res.statusCode}`);

    res.on('data', (chunk) => {
      debug(`BODY: ${chunk}`);
      buffer += chunk;
    });
    res.on('end', () => {
      switch (buffer) {
        // case '0':
        // case '1':
        // case '2':
        // case '4':
        //   return resolve(+buffer);
        case '100':
          return reject(new Error('Invalid date (response code: 100)'));
        case '101':
          return reject(new Error('Data not found (response code: 101)'));
        case '199':
          return reject(new Error('Service error (response code: 199)'));
        default:
          if (/[0124]+/.test(buffer)) return resolve(buffer);
          return reject(new Error(`Unexpected response: ${buffer}`));
      }
    });
  });

  req.on('error', (err) => {
    reject(err);
  });

  req.end();
});

class IsDayOffAPI {
  async today(options) {
    const now = new Date();
    const res = await this.getRawData({
      ...options,
      year: now.getFullYear(),
      month: now.getMonth(),
      date: now.getDate()
    });

    return +res;
  }

  async month({
    year = (new Date()).getFullYear(),
    month = (new Date()).getMonth(),
    date, // remove from request if any
    ...options
  } = {}) {
    return this.getData({ year, month, ...options });
  }

  async year({
    year = (new Date()).getFullYear(),
    month, // remove from request if any
    date, // remove from request if any
    ...options
  } = {}) {
    return this.getData({ year, ...options });
  }

  async date({
    year = (new Date()).getFullYear(),
    month = (new Date()).getMonth(),
    date = (new Date()).getDate(),
    ...options
  } = {}) {
    return +(await this.getRawData({
      year, month, date, ...options
    }));
  }

  async period({
    start,
    end,
    year, // remove from request if any
    month, // remove from request if any
    date, // remove from request if any
    ...options
  }) {
    const res = await this.getRawData({ start, end, ...options });
    return res.split('').map((item) => Number(item));
  }

  async getData({
    year = (new Date()).getFullYear(),
    ...options
  }) {
    const res = await this.getRawData({ year, ...options });
    return res.split('').map((item) => Number(item));
  }

  // eslint-disable-next-line class-methods-use-this
  getRawData(options) {
    return callApi(options);
  }
}

module.exports = IsDayOffAPI;
