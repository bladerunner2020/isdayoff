/* eslint-disable no-console */
const debug = require('debug');
const api = require('..')();

debug.enable('isdayoff');
debug.log = console.log.bind(console);

api.period({
  start: new Date('2020-01-01'),
  end: new Date('2021-01-01')
})
  .then((res) => {
    console.log(`Days: ${res.length}`);
    console.log(JSON.stringify(res));
  })
  .catch((err) => console.log(err.message));

// api.today()
//   .then((res) => console.log(`Today is ${res ? 'non-' : ''}working day.`))
//   .catch((err) => console.log(err.message));

// api.date({ month: 8, date: 10 })
//   .then(console.log)
//   .catch((err) => console.log(err.message));

// api.year()
//   .then((res) => console.log(JSON.stringify(res)))
//   .catch((err) => console.log(err.message));

// api.getData({
//   month: 1,
//   date: 1,
//   pre: true,
//   covid: true
// })
//   .then(console.log)
//   .catch((err) => console.log(err.message));
