jest.mock('https');

const { request } = require('https');
const { IsDayOffAPI } = require('..');

const now = new Date();

function MockResponse(data) {
  this.on = (event, cb) => {
    if (event === 'data') cb(data);
    if (event === 'end') cb();
  };
}

describe('IsDayOffAPI tests', () => {
  it('today', async () => {
    const api = new IsDayOffAPI();
    const year = now.getFullYear();
    const month = `00${now.getMonth() + 1}`.slice(-2);
    const date = `00${now.getDate()}`.slice(-2);

    request.mockImplementationOnce((options, cb) => {
      expect(options.hostname).toBe('isdayoff.ru');
      expect(options.path)
        .toBe(`/api/getData?year=${year}&month=${month}&day=${date}`);
      expect(options.method).toBe('GET');

      return {
        on: () => {},
        end: () => cb(new MockResponse(1))
      };
    });
    const res = await api.today();
    expect(res).toBe(1);
  });

  it('month', async () => {
    const api = new IsDayOffAPI();
    const fakeData = '110000011000001100000110000011';

    request.mockImplementationOnce((options, cb) => {
      expect(options.hostname).toBe('isdayoff.ru');
      expect(options.path).toBe(`/api/getData?year=${now.getFullYear()}&month=09`);
      expect(options.method).toBe('GET');

      return {
        on: () => {},
        end: () => cb(new MockResponse(fakeData))
      };
    });
    const res = await api.month({ month: 8 });
    expect(res.length).toBe(fakeData.length);
    expect(res).toEqual(fakeData.split('').map((item) => Number(item)));
  });

  it('year', async () => {
    const api = new IsDayOffAPI();
    const fakeData = '10'.repeat(366 / 2);

    request.mockImplementationOnce((options, cb) => {
      expect(options.hostname).toBe('isdayoff.ru');
      expect(options.path).toBe('/api/getData?year=2020');
      expect(options.method).toBe('GET');

      return {
        on: () => {},
        end: () => cb(new MockResponse(fakeData))
      };
    });
    const res = await api.year({ year: 2020 });
    expect(res.length).toBe(fakeData.length);
    expect(res).toEqual(fakeData.split('').map((item) => Number(item)));
  });

  it('date', async () => {
    const api = new IsDayOffAPI();

    const date = new Date();
    date.setDate(10);
    date.setMonth(8);
    date.setFullYear(1970);

    request.mockImplementationOnce((options, cb) => {
      expect(options.hostname).toBe('isdayoff.ru');
      expect(options.path).toBe('/api/getData?year=1970&month=09&day=10&pre=1');
      expect(options.method).toBe('GET');

      return {
        on: () => {},
        end: () => cb(new MockResponse(2))
      };
    });
    const res = await api.date({
      year: 1970, month: 8, date: 10, pre: true
    });
    expect(res).toBe(2);
  });

  it('period', async () => {
    const api = new IsDayOffAPI();

    const fakeData = '01204';

    const start = new Date();
    start.setDate(10);
    start.setMonth(8);
    start.setFullYear(2020);

    const end = new Date();
    end.setDate(15);
    end.setMonth(8);
    end.setFullYear(2020);

    request.mockImplementationOnce((options, cb) => {
      expect(options.hostname).toBe('isdayoff.ru');
      expect(options.path).toBe('/api/getData?date1=20200910&date2=20200915');
      expect(options.method).toBe('GET');

      return {
        on: () => {},
        end: () => cb(new MockResponse(fakeData))
      };
    });
    const res = await api.period({ start, end });
    expect(res.length).toBe(fakeData.length);
    expect(res).toEqual(fakeData.split('').map((item) => Number(item)));
  });
});
