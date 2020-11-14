const IsDayOffAPI = require('./lib/api');

module.exports = (options) => new IsDayOffAPI(options);
module.exports.IsDayOffAPI = IsDayOffAPI;
