const { ObjectId } = require("mongodb");

/**
 * Converts any property whose name contains "_id" to ObjectId.
 */
function ConvertIdtoObjectId(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    const val = obj[key];

    if (key.includes("_id")) {
      acc[key] = Array.isArray(val)
        ? val.map((v) => new ObjectId(v))
        : new ObjectId(val);
    } else {
      acc[key] = val;
    }
    return acc;
  }, {});
}

module.exports = { ConvertIdtoObjectId };
