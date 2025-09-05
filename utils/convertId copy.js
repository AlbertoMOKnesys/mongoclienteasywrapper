// src/utils/convert-id.ts
const { ObjectId } = require("mongodb");

function isHex24(s) {
  return typeof s === "string" && /^[a-fA-F0-9]{24}$/.test(s);
}

/**
 * Recursively converts any property whose name includes "_id" or ends in "Id"
 * to ObjectId, both in objects and arrays, without breaking operators ($set, $inc, ...).
 */
function ConvertIdtoObjectId(input) {
  if (input == null) return input;

  // Arrays
  if (Array.isArray(input)) {
    return input.map((v) => ConvertIdtoObjectId(v));
  }

  // Primitivos u ObjectId ya existente
  if (typeof input !== "object") return input;
  if (input._bsontype === "ObjectID") return input; // is already ObjectId

  const out = {};
  for (const [key, val] of Object.entries(input)) {
    // If operator ($set, $inc, ...) => process its value recursively
    if (key.startsWith("$")) {
      out[key] = ConvertIdtoObjectId(val);
      continue;
    }

    // If the key is *_id or *Id and the value is a hex string of 24 => convert
    const looksLikeIdKey = key.endsWith("_id") || key.endsWith("Id");
    if (looksLikeIdKey) {
      if (Array.isArray(val)) {
        out[key] = val.map((v) =>
          isHex24(v) ? new ObjectId(v) : ConvertIdtoObjectId(v)
        );
      } else if (isHex24(val)) {
        out[key] = new ObjectId(val);
      } else {
        // in case it is a subdoc or other structure
        out[key] = ConvertIdtoObjectId(val);
      }
    } else {
      out[key] = ConvertIdtoObjectId(val);
    }
  }
  return out;
}

module.exports = { ConvertIdtoObjectId };
