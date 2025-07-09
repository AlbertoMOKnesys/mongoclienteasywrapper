/**
 * Converts any property whose name contains "_datetime" to Date.
 */
function ConvertDatetoDatetime(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    const val = obj[key];

    if (key.includes("_datetime")) {
      acc[key] = Array.isArray(val)
        ? val.map((v) => new Date(v))
        : new Date(val);
    } else {
      acc[key] = val;
    }
    return acc;
  }, {});
}

module.exports = { ConvertDatetoDatetime };
