// mongofunctions.js
const { MongoClient, ObjectId } = require("mongodb");
const mongoDBConnectionManager = require("./mongoDBConnectionManager");
const { ConvertIdtoObjectId } = require("./utils/convertId");
const { ConvertDatetoDatetime } = require("./utils/convertDatetime");

const operatorNotDeleted = { status: { $ne: "deleted" } };
const tagDeleted = { status: "deleted" };

let mongo;
let mongoDb;

/**
 * Returns a MongoDB database instance, ensuring there is an active
 * connection before accessing the requested database.
 *
 * @param {string} dbName - Name of the database you want to work with.
 * @returns {Promise<Db>} A ready-to-use MongoDB `Db` object.
 */
async function getMongoClient(dbName) {
  // If there is no active connection, establish a new one
  if (!mongoDBConnectionManager.isConnected()) {
    // console.log("Establish new connection...");
    await mongoDBConnectionManager.connect(mongo.uri);
  }
  // Otherwise, an existing connection will be reused
  // console.log("Reusing existing connection...");

  // Retrieve and return the database handle for the given name
  return await mongoDBConnectionManager.getDatabase(dbName);
}

/**
 * Runs an aggregation pipeline on a specific collection and
 * returns the results as an array.
 *
 * @param {Array<Object>} arrAggregation - Array of aggregation stages.
 * @param {string}        collection     - Collection on which to run the pipeline.
 * @param {string} [databaseName]        - Optional DB name; falls back to `mongoDb`.
 * @returns {Promise<Array>} Aggregated documents.
 */
async function AggregationMongo(arrAggregation, collection, databaseName) {
  try {
    // Determine the database to use (incoming param or default)
    const DatabaseName = databaseName || mongoDb;

    // Connect to the database
    const db = await getMongoClient(DatabaseName);

    // Reference to the target collection
    const col = db.collection(collection);

    // Execute the aggregation pipeline and return the results as an array
    const docs = await col
      .aggregate(arrAggregation, { allowDiskUse: true })
      .toArray();

    return docs; // Return aggregated results
  } catch (error) {
    // Capture and log any error that occurs during aggregation
    console.error("Aggregation error:", error);
    return []; // Return empty array on failure to keep API consistent
  }
}

/**
 * Deletes a single document from a MongoDB collection by its `_id`.
 *
 * @param {string|ObjectId} Id          The document’s `_id` (string or ObjectId).
 * @param {string}          collection  Collection name where the document lives.
 * @param {string} [databaseName]       Optional DB name; defaults to `mongoDb`.
 * @returns {Promise<DeleteResult>}     MongoDB DeleteResult object.
 */
async function DeleteMongoby_id(Id, collection, databaseName) {
  try {
    // Resolve which database to use (fallback to global default)
    const dbName = databaseName || mongoDb;

    // Build the deletion filter using the provided Id
    const query = { _id: new ObjectId(Id) };

    // Obtain a DB handle (ensures connection is open/reused)
    const db = await getMongoClient(dbName);

    // Perform the deletion and return the raw Mongo response
    return await db.collection(collection).deleteOne(query);
  } catch (error) {
    // Log any error and return an empty result to keep API consistent
    console.error("DeleteMongoby_id error:", error.message);
    return [];
  }
}

/**
 * DeleteMongo
 * ----------------------------------------------------
 * Removes all documents that match a given filter from a collection.
 *
 * @param {Object}  query          - MongoDB filter used to select documents to delete.
 * @param {string}  collection     - Name of the collection.
 * @param {string} [databaseName]  - Optional DB name; defaults to the global `mongoDb`.
 * @returns {Promise<DeleteResult | []>} MongoDB `DeleteResult` on success
 *                                       or empty array on failure.
 */
async function DeleteMongo(query, collection, databaseName) {
  try {
    // Choose the database: provided name or fallback to default
    const dbName = databaseName || mongoDb;

    // Ensure we have a connection, then get the DB handle
    const db = await getMongoClient(dbName);

    // Delete every document that matches the filter
    return await db.collection(collection).deleteMany(query);
  } catch (error) {
    // Log the error and return a safe fallback
    console.error("DeleteMongo error:", error.message);
    return [];
  }
}

/**
 * DropCollection
 * ----------------------------------------------------
 * Permanently removes an entire collection (and its data)
 * from the specified MongoDB database.
 *
 * @param {string}  collection     - Name of the collection to drop.
 * @param {string} [databaseName]  - Optional DB name; defaults to `mongoDb`.
 * @returns {Promise<boolean | []>} `true` if the collection is dropped,
 *                                  or an empty array on failure.
 */
async function DropCollection(collection, databaseName) {
  try {
    // Choose the database to work with (parameter or default)
    const dbName = databaseName || mongoDb;

    // Get a connected `Db` instance
    const db = await getMongoClient(dbName);

    // Drop the collection and return MongoDB's boolean response
    return await db.collection(collection).drop();
  } catch (error) {
    // Log the error and return a safe fallback
    console.log("DropCollection error:", error);
    return [];
  }
}

/**
 * FindIDOne
 * ----------------------------------------------------
 * Retrieves a single document by its `_id` from the specified
 * MongoDB collection.
 *
 * @param {string|ObjectId} Id           - The document’s `_id`
 *                                         (string or ObjectId).
 * @param {string}          collection   - Collection name to query.
 * @param {string} [databaseName]        - Optional DB name; falls back
 *                                         to the global `mongoDb`.
 * @returns {Promise<Object>}            The matched document, or an empty
 *                                       object if not found / on error.
 */
async function FindIDOne(Id, collection, databaseName) {
  try {
    // Resolve database name (parameter overrides default)
    const dbName = databaseName || mongoDb;

    // Build query filter using a proper ObjectId
    const query = { _id: new ObjectId(Id) };

    // Ensure we have a live DB connection
    const db = await getMongoClient(dbName);

    // Fetch a single matching document
    return await db.collection(collection).findOne(query);
  } catch (error) {
    // Log and return an empty object to keep the API predictable
    console.error("FindIDOne error:", error);
    return {};
  }
}

/**
 * FindMany
 * ----------------------------------------------------
 * Retrieves all documents that match a given filter from a collection
 * and returns them as an array.
 *
 * @param {Object}  query          - Standard MongoDB filter object
 *                                   (e.g. `{ status: "active" }`).
 * @param {string}  collection     - Name of the collection to query.
 * @param {string} [databaseName]  - Optional DB name; defaults to global `mongoDb`.
 * @returns {Promise<Array>}       Array of matched documents, or an empty
 *                                 array if none found / on error.
 */
async function FindMany(query, collection, databaseName) {
  try {
    // Choose the database (explicit parameter or default)
    const dbName = databaseName || mongoDb;

    // Obtain a connection and run the query
    const db = await getMongoClient(dbName);
    return await db.collection(collection).find(query).toArray();
  } catch (error) {
    // Log the failure and return a predictable fallback
    console.log("FindMany error:", error);
    return [];
  }
}

/**
 * FindManyLimit
 * ----------------------------------------------------
 * Retrieves up to `limit` documents that match a given filter
 * from a MongoDB collection.
 *
 * @param {Object}  query           - MongoDB filter object.
 * @param {number}  limit           - Maximum number of documents to return.
 * @param {string}  collection      - Collection name.
 * @param {string} [databaseName]   - Optional DB name; defaults to global `mongoDb`.
 * @returns {Promise<Array>}        Array of matched documents (≤ limit),
 *                                  or an empty array on error.
 */
async function FindManyLimit(query, limit, collection, databaseName) {
  try {
    // Resolve DB name (explicit param overrides default)
    const dbName = databaseName || mongoDb;

    // Get a DB handle and execute the limited query
    const db = await getMongoClient(dbName);
    return await db.collection(collection).find(query).limit(limit).toArray();
  } catch (error) {
    // Log and return empty array if something goes wrong
    console.log("FindManyLimit error:", error);
    return [];
  }
}

/**
 * FindOne
 * ----------------------------------------------------
 * Retrieves the first document that matches the provided filter
 * from a MongoDB collection.
 *
 * @param {Object}  query           - MongoDB filter object (e.g. `{ email: "x@x.com" }`).
 * @param {string}  collection      - Name of the collection to query.
 * @param {string} [databaseName]   - Optional DB name; defaults to global `mongoDb`.
 * @returns {Promise<Object>}       The matched document, or an empty object on error.
 */
async function FindOne(query, collection, databaseName) {
  try {
    // Determine which database to use (parameter overrides default)
    const dbName = databaseName || mongoDb;

    // Obtain a DB handle (reuses or establishes connection)
    const db = await getMongoClient(dbName);

    // Fetch the first document that matches the filter
    return await db.collection(collection).findOne(query);
  } catch (error) {
    // Log the failure and return a safe fallback
    console.error("FindOne error:", error);
    return {};
  }
}

/**
 * FindOneAndUpdate
 * ----------------------------------------------------
 * Finds a single document matching `query`, applies the update
 * defined in `newProperties`, and returns the document (before or
 * after the update, depending on `options.returnDocument`).
 *
 * Helper behaviour:
 *  • Automatically converts any field containing “_id” in either
 *    `query` or `newProperties` into a MongoDB `ObjectId`.
 *  • Converts ISO date strings / timestamps in `newProperties`
 *    (e.g. inside `$set`) into native `Date` objects.
 *
 * @param {Object}  query           - Filter to locate the document.
 * @param {Object}  newProperties   - Update document (e.g. `{ $set: { ... } }`).
 * @param {string}  collection      - Collection name.
 * @param {string} [databaseName]   - Optional DB name; defaults to global `mongoDb`.
 * @param {Object} [options]        - Options passed directly to `findOneAndUpdate`
 *                                    (e.g. `{ returnDocument: "after", upsert: true }`).
 * @returns {Promise<Document|null>} The matched document (depending on `returnDocument`)
 *                                   or `null` on error.
 */
async function FindOneAndUpdate(
  query,
  newProperties,
  collection,
  databaseName,
  options = {}
) {
  try {
    // Select the database (parameter → fallback to default)
    const dbName = databaseName || mongoDb;

    // Get DB handle
    const db = await getMongoClient(dbName);

    // Convert possible ObjectId / Date values
    query = ConvertIdtoObjectId(query);
    newProperties = ConvertIdtoObjectId(newProperties);
    newProperties = ConvertDatetoDatetime(newProperties);

    /* -------- Core operation -------- */
    return await db
      .collection(collection)
      .findOneAndUpdate(query, newProperties, options);
  } catch (err) {
    console.error("FindOneAndUpdate error:", err);
    return null;
  }
}

/**
 * FindOneLast
 * ----------------------------------------------------
 * Retrieves the most recent (or otherwise “last”) document that matches
 * a filter, based on a custom sort order.
 *
 * @param {Object}  query           - MongoDB filter (e.g. `{ status: "active" }`).
 * @param {Object}  sortobj         - Sort specification (e.g. `{ createdAt: -1 }`).
 *                                    Use descending order to fetch the latest record.
 * @param {string}  collection      - Collection name.
 * @param {string} [databaseName]   - Optional DB name; defaults to global `mongoDb`.
 * @returns {Promise<Object|[]>}    The single matched document, or an empty array on error.
 */
async function FindOneLast(query, sortobj, collection, databaseName) {
  try {
    // Decide which database to use
    const dbName = databaseName || mongoDb;

    // Obtain a DB handle
    const db = await getMongoClient(dbName);

    // Find → sort → limit(1) → toArray()   (cursor → [doc])
    const docs = await db
      .collection(collection)
      .find(query)
      .sort(sortobj)
      .limit(1)
      .toArray();

    // Return the first (and only) result, or undefined if none found
    return docs[0];
  } catch (error) {
    console.log("FindOneLast error:", error);
    return [];
  }
}

/**
 * GetAll
 * ----------------------------------------------------
 * Retrieves every document from the specified collection, sorted by `_id`
 * in ascending order.
 *
 * @param {string}  collection      - Name of the collection to read.
 * @param {string} [databaseName]   - Optional DB name; defaults to global `mongoDb`.
 * @returns {Promise<Array>}        All documents in the collection, or an empty
 *                                  array if an error occurs.
 */
async function GetAll(collection, databaseName) {
  try {
    // Choose the target database (explicit param or default)
    const dbName = databaseName || mongoDb;

    // Establish / reuse a connection and obtain the DB handle
    const db = await getMongoClient(dbName);

    // Fetch all documents, sorted by _id ascending
    return await db.collection(collection).find().sort({ _id: 1 }).toArray();
  } catch (error) {
    console.log("GetAll error:", error);
    return [];
  }
}

/**
 * GetLastMongo
 * ----------------------------------------------------
 * Retrieves the last `limit` documents from a collection, ordered by `_id`.
 * A higher `_id` value is considered “newer” because MongoDB ObjectIds are
 * roughly chronological. Passing `limit = 1` effectively fetches the latest document.
 *
 * @param {number}  limit           - Maximum number of documents to return.
 * @param {string}  collection      - Collection name.
 * @param {string} [databaseName]   - Optional DB name; defaults to global `mongoDb`.
 * @returns {Promise<Array>}        Array with up to `limit` documents or `[]` on error.
 */
async function GetLastMongo(limit, collection, databaseName) {
  try {
    // Pick database: explicit param overrides global default
    const dbName = databaseName || mongoDb;

    // Ensure connection and obtain a DB handle
    const db = await getMongoClient(dbName);

    // Query everything, sort by _id descending (latest first), then limit
    return await db
      .collection(collection)
      .find()
      .sort({ _id: -1 }) // DESC to get newest first
      .limit(limit)
      .toArray();
  } catch (error) {
    console.log("GetLastMongo error:", error);
    return [];
  }
}

async function ND_PopulateAuto(query, collection, databaseName) {
  try {
    // Set the database name
    const DatabaseName = databaseName || mongoDb;

    query = Object.keys(query).reduce((acum, property) => {
      if (property.includes("_id")) {
        return { ...acum, [property]: new ObjectId(query[property]) };
      } else {
        return { ...acum, [property]: query[property] };
      }
    }, {});

    const queryNotDeletes = { ...query, ...operatorNotDeleted };

    // Connect to the database
    const db = await getMongoClient(DatabaseName);

    // para obtener el arreglo de todas las properties que contienen la coleccion
    var allKeys = new Set(); // new set es para guardar unicamente una vez(no duplicados)
    let properties = [];
    await db
      .collection(collection)
      .find()
      .forEach(function (o) {
        for (key in o) allKeys.add(key);
      });
    for (let key of allKeys) properties.push(key);

    if (properties) {
      // si hay almenos un documento
      // const properties = Object.keys(doc[0]);
      // queryNotDeletes
      const allKeys = properties.filter((property) => property.includes("_id"));
      if (allKeys.length > 1) {
        /// existe almenos una referencia _id aparte del current _id
        const aggregate = [{ $match: queryNotDeletes }];

        const lookups = allKeys.slice(1).map((toJoin) => {
          const collectionName = toJoin.replace("_id", "");
          return {
            $lookup: {
              from: collectionName,
              localField: toJoin,
              foreignField: "_id",
              as: collectionName,
            },
          };
        });

        aggregate.push(...lookups);
        // if (Object.keys(query).length !== 0) {
        //   lookup.push({ $match: query });
        // }
        let result = await db
          .collection(collection)
          .aggregate(aggregate)
          .toArray();
        // await db.close();
        return result;
      } else {
        let result = await db
          .collection(collection)
          .find(queryNotDeletes)
          .toArray();
        // await db.close();
        return result;
      }
    } else {
      // no hay ni un solo registro de esta consulta
      return [];
    }
  } catch (error) {
    console.error("ND_PopulateAuto error:", error.message);
    return [];
  }
}

/**
 * SaveManyBatch
 * ----------------------------------------------------
 * Inserts a batch of documents into a collection, performing
 * automatic conversions for any `"_id"` or `"_datetime"` fields
 * found inside each object.
 *
 * Conversions applied to each element in `arrToSave`:
 *  • Every property name containing “_id”  → `ObjectId`
 *  • Every property name containing “_datetime” → native `Date`
 *
 * @param {Array<Object>} arrToSave      - Array of plain objects to insert.
 * @param {string}        collection     - Target collection name.
 * @param {string} [databaseName]        - Optional DB name; defaults to `mongoDb`.
 * @returns {Promise<InsertManyResult|[]>} MongoDB `InsertManyResult` on success,
 *                                        or empty array on error.
 */
async function SaveManyBatch(arrToSave, collection, databaseName) {
  try {
    /* -------- 1. Pre-process each document -------- */
    arrToSave = arrToSave.map(ConvertIdtoObjectId).map(ConvertDatetoDatetime);

    /* -------- 2. Get DB handle -------- */
    const dbName = databaseName || mongoDb;
    const db = await getMongoClient(dbName);

    /* -------- 3. Bulk insert -------- */
    return await db.collection(collection).insertMany(arrToSave);
  } catch (error) {
    console.error("SaveManyBatch error:", error.message);
    return [];
  }
}

/**
 * SavetoMongoMany
 * ------------------------------------------------------------------
 * Bulk-inserts an array of documents into a collection after normalising
 * any `_id` and `_datetime` fields inside each object.
 *
 * 🔄  Pre-processing for every element in `arrToSave`
 *   • Keys containing “_id”        ➜ converted to `ObjectId`
 *   • Keys containing “_datetime”  ➜ converted to native `Date`
 *
 * @param {Array<Object>} arrToSave      Array of plain JS objects to insert.
 * @param {string}        collection     Name of the target MongoDB collection.
 * @param {string} [databaseName]        Optional DB name; defaults to global `mongoDb`.
 * @returns {Promise<InsertManyResult|[]>}
 *          On success: MongoDB `InsertManyResult`
 *          On failure: empty array (and error logged to console).
 */
async function SavetoMongoMany(arrToSave, collection, databaseName) {
  try {
    // 1. Normalise ids and dates
    arrToSave = arrToSave.map(ConvertIdtoObjectId).map(ConvertDatetoDatetime);

    // 2. Obtain database handle
    const dbName = databaseName || mongoDb;
    const db = await getMongoClient(dbName);

    // 3. Bulk-insert and return the MongoDB result
    return await db.collection(collection).insertMany(arrToSave);
  } catch (error) {
    console.error("SavetoMongoMany error:", error.message);
    return [];
  }
}

/**
 * SavetoMongo
 * ------------------------------------------------------------------
 * Inserts a single document into a collection after normalising any
 * `_id` or `_datetime` fields.
 *
 * Steps performed:
 *  1. Converts keys containing “_id” → `ObjectId`.
 *  2. Converts keys containing “_datetime” → native `Date`.
 *  3. Obtains a database handle (using `databaseName` or default `mongoDb`).
 *  4. Executes `insertOne` and returns MongoDB’s `InsertOneResult`.
 *
 * @param {Object}  objectToSave   Plain JS object to be persisted.
 * @param {string}  collection     Target MongoDB collection.
 * @param {string} [databaseName]  Optional database name; defaults to `mongoDb`.
 * @returns {Promise<InsertOneResult|null>} Insert result on success, or
 *                                          `null` on failure.
 */
async function SavetoMongo(objectToSave, collection, databaseName) {
  try {
    // 1. Normalise any IDs and date-time strings
    objectToSave = ConvertIdtoObjectId(objectToSave);
    objectToSave = ConvertDatetoDatetime(objectToSave);

    // 2. Decide which database to use
    const dbName = databaseName || mongoDb;

    // 3. Get DB handle (reusing or establishing connection)
    const db = await getMongoClient(dbName);

    // 4. Insert the document and return the result
    return await db.collection(collection).insertOne(objectToSave);
  } catch (error) {
    console.error("SavetoMongo error:", error.message);
    return null;
  }
}

/**
 * UpdateMongo
 * ------------------------------------------------------------------
 * Updates a single document that matches `query` by applying a `$set`
 * with the provided `newProperties`.
 *
 * Pre-processing:
 *   • Converts any property containing “_id” in `newProperties` ➜ `ObjectId`.
 *   • Converts any property containing “_datetime” ➜ native `Date`.
 *
 * @param {Object}  query           - MongoDB filter to locate the document.
 * @param {Object}  newProperties   - Plain object with the fields to update.
 * @param {string}  collection      - Target collection name.
 * @param {string} [databaseName]   - Optional DB name; defaults to global `mongoDb`.
 * @returns {Promise<UpdateResult|[]>}
 *          On success: MongoDB `UpdateResult`
 *          On failure : empty array (and error logged).
 */
async function UpdateMongo(query, newProperties, collection, databaseName) {
  try {
    /* -------- 1. Normalise update payload -------- */
    newProperties = ConvertIdtoObjectId(newProperties);
    newProperties = ConvertDatetoDatetime(newProperties);

    /* -------- 2. Choose DB and connect -------- */
    const dbName = databaseName || mongoDb;
    const db = await getMongoClient(dbName);

    /* -------- 3. Perform the update -------- */
    const result = await db
      .collection(collection)
      .updateOne(query, { $set: newProperties });

    return result; // { acknowledged, matchedCount, modifiedCount, upsertedId }
  } catch (error) {
    console.error("UpdateMongo error:", error);
    return [];
  }
}

/**
 * UpdateMongoBy_id
 * ------------------------------------------------------------------
 * Updates a single document identified by its `_id`, applying a `$set`
 * with the provided `newProperties`.
 *
 * Pre-processing steps:
 *   • Converts any property in `newProperties` whose key contains “_id”
 *     to `ObjectId`.
 *   • Converts any property whose key contains “_datetime” to native `Date`.
 *
 * @param {string|ObjectId} _id        - The document’s `_id` to update.
 * @param {Object}          newProperties - Plain object containing the fields to update.
 * @param {string}          collection - Target collection name.
 * @param {string} [databaseName]      - Optional DB name; defaults to global `mongoDb`.
 * @returns {Promise<UpdateResult|[]>}
 *          MongoDB `UpdateResult` on success, or an empty array on failure.
 */
async function UpdateMongoBy_id(_id, newProperties, collection, databaseName) {
  try {
    /* -------- 1. Normalise update payload -------- */
    newProperties = ConvertIdtoObjectId(newProperties);
    newProperties = ConvertDatetoDatetime(newProperties);

    /* -------- 2. Build filter by ObjectId -------- */
    const query = { _id: new ObjectId(_id) };

    /* -------- 3. Obtain DB handle -------- */
    const dbName = databaseName || mongoDb;
    const db = await getMongoClient(dbName);

    /* -------- 4. Perform update -------- */
    const result = await db
      .collection(collection)
      .updateOne(query, { $set: newProperties });

    return result; // { acknowledged, matchedCount, modifiedCount, upsertedId }
  } catch (error) {
    console.error("UpdateMongoBy_id error:", error.message);
    return [];
  }
}

/**
 * UpdateMongoMany
 * ------------------------------------------------------------------
 * Updates all documents that match `query` by applying a `$set`
 * with `newProperties`.
 *
 * Normalisation steps:
 *   1. Converts every field in `newProperties` whose key contains “_id”
 *      to an `ObjectId`, and every “_datetime” field to a native `Date`.
 *   2. Converts any key containing “_id” inside `query` to `ObjectId`,
 *      leaving other filter fields untouched.
 *
 * @param {Object}  query            - MongoDB filter to select documents.
 * @param {Object}  newProperties    - Values to be assigned via `$set`.
 * @param {string}  collection       - Target collection.
 * @param {string} [databaseName]    - Optional DB name; defaults to `mongoDb`.
 * @returns {Promise<UpdateResult|[]>}
 *          MongoDB `UpdateResult` on success, empty array on failure.
 */
async function UpdateMongoMany(query, newProperties, collection, databaseName) {
  try {
    /* -------- 1. Normalise update payload -------- */
    newProperties = ConvertIdtoObjectId(newProperties);
    newProperties = ConvertDatetoDatetime(newProperties);

    /* -------- 2. Normalise filter (ObjectId conversion) -------- */
    query = Object.keys(query).reduce((acc, key) => {
      return key.includes("_id")
        ? { ...acc, [key]: new ObjectId(query[key]) }
        : { ...acc, [key]: query[key] };
    }, {});

    /* -------- 3. Database connection -------- */
    const dbName = databaseName || mongoDb;
    const db = await getMongoClient(dbName);

    /* -------- 4. Execute bulk update -------- */
    return await db
      .collection(collection)
      .updateMany(query, { $set: newProperties });
  } catch (error) {
    console.error("UpdateMongoMany error:", error);
    return [];
  }
}

/**
 * UpdateOneRaw
 * ------------------------------------------------------------------
 * Direct wrapper around MongoDB’s `updateOne`, allowing the caller to
 * pass a fully-formed update document (`newProperties`) and `options`
 * object without this helper forcing `$set`.
 *
 * Pre-processing:
 *   • Converts any field in `query` or `newProperties` whose key
 *     contains “_id” → `ObjectId`.
 *   • Converts any field whose key contains “_datetime” → native `Date`.
 *
 * @param {Object}  query           - Filter used to locate the document.
 * @param {Object}  newProperties   - Raw update document
 *                                    (e.g. `{ $inc: { counter: 1 } }`,
 *                                    `{ $set: {...}, $unset: {...} }`).
 * @param {string}  collection      - Collection name.
 * @param {string} [databaseName]   - Optional DB name; defaults to `mongoDb`.
 * @param {Object} [options={}]     - Options forwarded to `updateOne`
 *                                    (upsert, write concern, etc.).
 * @returns {Promise<UpdateResult|null>}
 *          The MongoDB `UpdateResult` on success, or `null` on failure.
 */
async function UpdateOneRaw(
  query,
  newProperties,
  collection,
  databaseName,
  options = {}
) {
  try {
    /* -------- 1. Decide database & connect -------- */
    const dbName = databaseName || mongoDb;
    const db = await getMongoClient(dbName);

    /* -------- 2. Normalise filter and update docs -------- */
    query = ConvertIdtoObjectId(query);
    newProperties = ConvertIdtoObjectId(newProperties);
    newProperties = ConvertDatetoDatetime(newProperties);

    /* -------- 3. Execute raw update -------- */
    return await db
      .collection(collection)
      .updateOne(query, newProperties, options);
  } catch (err) {
    console.error("UpdateOneRaw error:", err);
    return null;
  }
}

/**
 * UpsertMongo
 * ------------------------------------------------------------------
 * Updates a single document if it exists; otherwise inserts a new one.
 * (`updateOne` with `{ upsert: true }`)
 *
 * Pre-processing on `newProperties`:
 *   • Fields containing “_id”   ➜ converted to `ObjectId`
 *   • Fields containing “_datetime” ➜ converted to native `Date`
 *
 * @param {Object}  query            - Filter used to locate the document.
 * @param {Object}  newProperties    - Values to set (wrapped in `$set` automatically).
 * @param {string}  collection       - Collection name.
 * @param {string} [databaseName]    - Optional DB name; defaults to global `mongoDb`.
 * @returns {Promise<UpdateResult|[]>}
 *          MongoDB `UpdateResult` (contains `upsertedId` if a new doc was created),
 *          or an empty array on failure.
 */
async function UpsertMongo(query, newProperties, collection, databaseName) {
  try {
    /* -------- 1. Normalise update payload -------- */
    newProperties = ConvertIdtoObjectId(newProperties);
    newProperties = ConvertDatetoDatetime(newProperties);

    /* -------- 2. Connect to the correct DB -------- */
    const dbName = databaseName || mongoDb;
    const db = await getMongoClient(dbName);

    /* -------- 3. Perform upsert -------- */
    return await db
      .collection(collection)
      .updateOne(query, { $set: newProperties }, { upsert: true });
  } catch (error) {
    console.log("UpsertMongo error:", error);
    return [];
  }
}

// --- The following functions have not been cleaned yet, but they work ---
function SavetoMongoCallback(objectToSave, collection, databaseName) {
  const DatabaseName = databaseName == null ? mongoDb : databaseName;
  MongoClient.connect(mongo.uri, { useUnifiedTopology: true }, (err, db) => {
    if (err) console.log(err);
    const dbo = db.db(DatabaseName);
    dbo.collection(collection).insertOne(objectToSave, (err2) => {
      if (err2) console.log(err2);
      db.close();
    });
  });
}

async function InsertIndexUnique(index, collection, databaseName) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    // let db = await MongoClient.connect(mongo.uri, { useUnifiedTopology: true });
    // const dbo = db.db(DatabaseName);
    const db = await getMongoClient(DatabaseName);

    let result = await db
      .collection(collection)
      .createIndex(index, { unique: true });
    // await db.close();
    //console.log(util.inspect(result, false, null, true /* enable colors */))
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function Distinct(query, collection, databaseName) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    // let db = await MongoClient.connect(mongo.uri, {
    //   useUnifiedTopology: true,
    // });
    // const dbo = db.db(DatabaseName);
    const db = await getMongoClient(DatabaseName);

    let result = await db.collection(collection).distinct(query);
    // .toArray();

    // await db.close();
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function AggregationMongoCursor(
  arrAggregation,
  collection,
  databaseName
) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    // let db = await MongoClient.connect(mongo.uri, {
    //   useUnifiedTopology: true,
    // });
    // const dbo = db.db(DatabaseName);

    const db = await getMongoClient(DatabaseName);

    let result = db
      .collection(collection)
      .aggregate(arrAggregation, { cursor: { batchSize: 100 } });
    // await db.close();

    return {
      cursor: result,
      // closeConnection: () => {
      //   db.close();
      // },
    };
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function ND_DeleteMongoby_id(_id, collection, databaseName) {
  try {
    const query = { _id: new ObjectId(_id) };
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    // let db = await MongoClient.connect(mongo.uri, {
    //   useUnifiedTopology: true,
    // });
    // const dbo = db.db(DatabaseName);
    const db = await getMongoClient(DatabaseName);

    var newvalues = { $set: tagDeleted };
    let result = await db.collection(collection).updateOne(query, newvalues);

    let indexes = await db.collection(collection).indexes();
    console.log("infices de la colleccion: " + collection, indexes);
    // [
    //   {
    //     v: 2,
    //     key: { _id: 1 },
    //     name: "_id_",
    //     ns: "EMPRESAMEMIN23899203.trabajadores",
    //   },
    //   {
    //     v: 2,
    //     unique: true,
    //     key: { curp: 1 },
    //     name: "curp_1",
    //     ns: "EMPRESAMEMIN23899203.trabajadores",
    //   },
    //   {
    //     v: 2,
    //     unique: true,
    //     key: { imss: 1 },
    //     name: "imss_1",
    //     ns: "EMPRESAMEMIN23899203.trabajadores",
    //   },
    // ];

    const arrIndices = indexes.map((index) => Object.keys(index.key)[0]);
    arrIndices.shift();
    console.log("arrIndices: ", arrIndices);
    if (arrIndices.length > 0) {
      let arrIndenfificados = await db
        .collection(collection)
        .find(query)
        .toArray();
      const identificado = arrIndenfificados[0];
      console.log("identificado: ", identificado);

      const indexTagDeleted = arrIndices.reduce((acc, property) => {
        return (acc = {
          ...acc,
          [property]: "Deleted" + Date.now() + "-" + identificado[property],
        });
      }, {});

      console.log(indexTagDeleted);

      var newvaluesIndex = { $set: indexTagDeleted };
      let resultIndex = await db
        .collection(collection)
        .updateOne(query, newvaluesIndex);

      console.log("MOFIFICADO TAMBIEN INDICES");
    }
    // await db.close();
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function getIndexs(collection, databaseName) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    const db = await getMongoClient(DatabaseName);

    const indexes = await db.collection(collection).indexes();
    console.log("infices de la colleccion: " + collection, indexes);

    return indexes;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function UpdateMongoManyRename(
  query,
  newProperties,
  collection,
  databaseName
) {
  try {
    // newProperties = ConvertIdtoObjectId(newProperties);
    // newProperties = ConvertDatetoDatetime(newProperties);

    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    const db = await getMongoClient(DatabaseName);

    var newvalues = { $rename: newProperties };
    let result = await db.collection(collection).updateMany(query, newvalues);
    // await db.close();
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function UpdateMongoBy_idPush(
  _id,
  newProperties,
  collection,
  databaseName
) {
  try {
    const query = { _id: new ObjectId(_id) };
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    const db = await getMongoClient(DatabaseName);

    var newvalues = { $push: newProperties };
    let result = await db.collection(collection).updateOne(query, newvalues);
    // await db.close();
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function UpdateMongoManyBy_idPush(
  _idArr,
  newProperties,
  collection,
  databaseName
) {
  const _idArrObject = _idArr.map((e) => new ObjectId(e));
  //si no lo resuelvo con or
  try {
    const query = { _id: { $in: _idArrObject } };
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    const db = await getMongoClient(DatabaseName);

    var newvalues = { $push: newProperties };
    let result = await db.collection(collection).updateMany(query, newvalues);
    // await db.close();
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function UpdateMongoManyBy_idAddToSet(
  _idArr,
  newProperties,
  collection,
  databaseName
) {
  const _idArrObject = _idArr.map((e) => new ObjectId(e));
  //si no lo resuelvo con or
  try {
    const query = { _id: { $in: _idArrObject } };
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    const db = await getMongoClient(DatabaseName);

    var newvalues = { $addToSet: newProperties };
    let result = await db.collection(collection).updateMany(query, newvalues);
    // await db.close();
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function UpdateMongoManyBy_idPull(
  _idArr,
  newProperties,
  collection,
  databaseName
) {
  const _idArrObject = _idArr.map((e) => new ObjectId(e));
  //si no lo resuelvo con or
  try {
    const query = { _id: { $in: _idArrObject } };
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    const db = await getMongoClient(DatabaseName);

    var newvalues = { $pull: newProperties };
    let result = await db.collection(collection).updateMany(query, newvalues);
    // await db.close();
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function UpdateMongoManyPullIDToCollectionPull(
  query,
  collection,
  databaseName
) {
  try {
    // ejemplo querie
    // {eventos_id:"fwefewhui32432u"}

    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    const db = await getMongoClient(DatabaseName);

    var newvalues = { $pull: query };
    let result = await db.collection(collection).updateMany(query, newvalues);
    // await db.close();
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function UpdateMongoBy_idRemoveProperty(
  _id,
  property,
  collection,
  databaseName
) {
  try {
    const query = { _id: new ObjectId(_id) };
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    const db = await getMongoClient(DatabaseName);

    var valuesToRemove = { $unset: { [property]: 1 } };
    let result = await db
      .collection(collection)
      .updateOne(query, valuesToRemove);
    // await db.close();
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function UpdateBy_idPush_id(
  _id,
  originCollection,
  new_id,
  collection,
  databaseName
) {
  try {
    const query = { _id: new ObjectId(_id) };
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    const db = await getMongoClient(DatabaseName);

    var newvalues = {
      $push: { [originCollection]: new ObjectId(new_id) },
    };
    let result = await db.collection(collection).updateOne(query, newvalues);
    // await db.close();
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

function DeleteMongoCallback(idObjectToDelete, collection, databaseName) {
  const DatabaseName = databaseName == null ? mongoDb : databaseName;
  MongoClient.connect(mongo.uri, { useUnifiedTopology: true }, (err, db) => {
    if (err) console.log(err);
    const dbo = db.db(DatabaseName);
    var myquery = { _id: idObjectToDelete };
    dbo.collection(collection).deleteOne(myquery, (err2) => {
      if (err2) console.log(err2);
      db.close();
    });
  });
}

async function GetNextSequenceValue(
  query,
  increment,
  collection,
  databaseName
) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    const db = await getMongoClient(DatabaseName);

    let result = await db
      .collection(collection)
      .findOneAndUpdate(
        query,
        { $inc: { sequence_value: increment } },
        { upsert: true }
      );
    // await db.close();
    //console.log(util.inspect(result, false, null, true /* enable colors */))
    return result.value.sequence_value;
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

async function ND_FindOne(query, collection, databaseName) {
  try {
    const queryNotDeletes = { ...query, ...operatorNotDeleted };
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    const db = await getMongoClient(DatabaseName);

    let result = await db.collection(collection).findOne(queryNotDeletes);
    // await db.close();
    return result;
  } catch (error) {
    console.log(error.message);
    return {};
  }
}

async function ND_FindMany(
  query,
  collection,
  databaseName,
  order = { _id: 1 }
) {
  try {
    const queryNotDeletes = { ...query, ...operatorNotDeleted };
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    const db = await getMongoClient(DatabaseName);

    let result = await db
      .collection(collection)
      .find(queryNotDeletes)
      .sort(order)
      .toArray();
    // await db.close();
    return result;
  } catch (error) {
    console.log(error.message);
    return [];
  }
}

async function FindPaginated(
  query,
  pageNumber,
  nPerPage,
  collection,
  databaseName
) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    const db = await getMongoClient(DatabaseName);

    // const skipIndex = (page - 1) * limit;
    let result = await db
      .collection(collection)
      .find(query)
      .sort({ _id: 1 })
      .limit(nPerPage)
      .skip(pageNumber > 0 ? pageNumber * nPerPage : 0)
      .toArray();
    // await db.close();
    return result;
  } catch (error) {
    console.log(error.message);
    return [];
  }
}

async function ND_FindPaginated(
  query,
  pageNumber,
  nPerPage,
  collection,
  databaseName
) {
  try {
    const queryNotDeletes = { ...query, ...operatorNotDeleted };
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    const db = await getMongoClient(DatabaseName);

    // const skipIndex = (page - 1) * limit;
    let result = await db
      .collection(collection)
      .find(queryNotDeletes)
      .sort({ _id: 1 })
      .limit(nPerPage)
      .skip(pageNumber > 0 ? pageNumber * nPerPage : 0)
      .toArray();
    // await db.close();
    return result;
  } catch (error) {
    console.log(error.message);
    return [];
  }
}

async function FindLimitLast(query, limit, collection, databaseName) {
  try {
    const properties = Object.keys(query);
    const allKeys = properties.filter((property) => property.includes("_id"));
    allKeys.forEach((prop) => {
      console.log("entro almenos una vez: ", query[prop]);
      query[prop] = new ObjectId(query[prop]);
    });
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    const db = await getMongoClient(DatabaseName);

    let result = await db
      .collection(collection)
      .find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .toArray();
    // await db.close();
    return result;
  } catch (error) {
    console.log(error.message);
    return [];
  }
}

async function Populate(collection, databaseName, joinCollection) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    const db = await getMongoClient(DatabaseName);

    const lookup = joinCollection.map((toJoin) => {
      return {
        $lookup: {
          from: toJoin,
          localField: toJoin + "_id",
          foreignField: "_id",
          as: toJoin,
        },
      };
    });

    let result = await db.collection(collection).aggregate(lookup).toArray();
    // await db.close();
    return result;
  } catch (error) {
    console.log(error.message);
    return [];
  }
}

async function PopulateAuto(query, collection, databaseName) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    if (query._id) query._id = new ObjectId(query._id);
    const db = await getMongoClient(DatabaseName);

    var doc = await db.collection(collection).findOne(query);
    if (doc) {
      /// si hay almenos un documento
      const properties = Object.keys(doc);
      const allKeys = properties.filter((property) => property.includes("_id"));
      if (allKeys.length > 1) {
        /// existe almenos una referencia _id aparte del current _id
        // allKeys.shift(); // para remover el primer registro _id
        const aggregate = [{ $match: query }];

        const lookups = allKeys.slice(1).map((toJoin) => {
          const collectionName = toJoin.replace("_id", "");
          return {
            $lookup: {
              from: collectionName,
              localField: toJoin,
              foreignField: "_id",
              as: collectionName,
            },
          };
        });

        aggregate.push(...lookups);
        // if (Object.keys(query).length !== 0) {
        //   lookup.push({ $match: query });
        // }
        let result = await db
          .collection(collection)
          .aggregate(aggregate)
          .toArray();
        // await db.close();
        return result;
      } else {
        let result = await db.collection(collection).find(query).toArray();
        // await db.close();
        return result;
      }
    } else {
      // await db.close();
      // no hay ni un solo registro de esta consulta
      return [];
    }
  } catch (error) {
    // await db.close();
    console.log(error.message);
    return [];
  }
}

async function FindIDOnePopulated(Id, collection, databaseName) {
  const DatabaseName = databaseName == null ? mongoDb : databaseName;
  var o_id = new ObjectId(Id);
  const query = { _id: o_id };
  try {
    const db = await getMongoClient(DatabaseName);
    // let result = await dbo.collection(collection).findOne(query);
    // await db.close();
    // //console.log(util.inspect(result, false, null, true /* enable colors */))
    // return result;

    const doc = await db.collection(collection).findOne(query);
    if (doc) {
      /// si hay almenos un documento
      const properties = Object.keys(doc);
      const allKeys = properties.filter((property) => property.includes("_id"));
      if (allKeys.length > 1) {
        const aggregate = [{ $match: query }];

        const lookups = allKeys.slice(1).map((toJoin) => {
          const collectionName = toJoin.replace("_id", "");
          return {
            $lookup: {
              from: collectionName,
              localField: toJoin,
              foreignField: "_id",
              as: collectionName,
            },
          };
        });

        aggregate.push(...lookups);
        // if (Object.keys(query).length !== 0) {
        //   lookup.push({ $match: query });
        // }
        let result = await db
          .collection(collection)
          .aggregate(aggregate)
          .toArray();
        // await db.close();
        return result;
      } else {
        let result = await db.collection(collection).find(query).toArray();
        // await db.close();
        return result;
      }
    } else {
      // no hay ni un solo registro de esta consulta
      return {};
    }
  } catch (error) {
    console.log(error.message);
    return {};
  }
}

async function ND_FindIDOnePopulated(Id, collection, databaseName) {
  const DatabaseName = databaseName == null ? mongoDb : databaseName;
  var o_id = new ObjectId(Id);
  const query = { _id: o_id };
  const queryNotDeletes = { ...query, ...operatorNotDeleted };
  try {
    const db = await getMongoClient(DatabaseName);

    // let result = await dbo.collection(collection).findOne(query);
    // await db.close();
    // //console.log(util.inspect(result, false, null, true /* enable colors */))
    // return result;

    const doc = await db.collection(collection).findOne(queryNotDeletes);
    if (doc) {
      /// si hay almenos un documento
      const properties = Object.keys(doc);
      const allKeys = properties.filter((property) => property.includes("_id"));
      //queryNotDeletes
      if (allKeys.length > 1) {
        /// existe almenos una referencia _id aparte del current _id
        // allKeys.shift(); // para remover el primer registro _id
        const aggregate = [{ $match: queryNotDeletes }];

        const lookups = allKeys.slice(1).map((toJoin) => {
          const collectionName = toJoin.replace("_id", "");
          return {
            $lookup: {
              from: collectionName,
              localField: toJoin,
              foreignField: "_id",
              as: collectionName,
            },
          };
        });

        aggregate.push(...lookups);
        // if (Object.keys(query).length !== 0) {
        //   lookup.push({ $match: query });
        // }
        let result = await db
          .collection(collection)
          .aggregate(aggregate)
          .toArray();
        // await db.close();
        return result;
      } else {
        let result = await db
          .collection(collection)
          .find(queryNotDeletes)
          .toArray();
        // await db.close();
        return result;
      }
    } else {
      // no hay ni un solo registro de esta consulta
      return {};
    }
  } catch (error) {
    console.log(error.message);
    return {};
  }
}

async function Count(query, collection, databaseName) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    const db = await getMongoClient(DatabaseName);

    let result = await db.collection(collection).count(query);
    // await db.close();
    return result;
  } catch (error) {
    console.log(error.message);
    return {};
  }
}

async function UpdateMongoManyPull(
  query,
  propertiesRemove,
  collection,
  databaseName
) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    const db = await getMongoClient(DatabaseName);

    var removeValues = { $pull: propertiesRemove };
    let result = await db
      .collection(collection)
      .updateMany(query, removeValues);
    // await db.close();
    //console.log(util.inspect(result, false, null, true /* enable colors */))
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

module.exports = function (connectionString, defaultDbName) {
  // Connect=Connect;
  mongo = { uri: connectionString };
  mongoDb = defaultDbName;

  return {
    AggregationMongo,
    AggregationMongoCursor,
    Count,
    DeleteMongo,
    DeleteMongoby_id,
    DeleteMongoCallback,
    Distinct,
    DropCollection,
    FindIDOne,
    FindIDOnePopulated,
    FindLimitLast,
    FindMany,
    FindManyLimit,
    FindOne,
    FindOneAndUpdate,
    FindOneLast,
    FindPaginated,
    GetAll,
    getIndexs,
    GetLastMongo,
    GetNextSequenceValue,
    InsertIndexUnique,
    ND_DeleteMongoby_id,
    ND_FindIDOnePopulated,
    ND_FindMany,
    ND_FindOne,
    ND_FindPaginated,
    ND_PopulateAuto,
    Populate,
    PopulateAuto,
    SaveManyBatch,
    SavetoMongo,
    SavetoMongoCallback,
    SavetoMongoMany,
    UpdateBy_idPush_id,
    UpdateMongo,
    UpdateMongoBy_id,
    UpdateMongoBy_idPush,
    UpdateMongoBy_idRemoveProperty,
    UpdateMongoMany,
    UpdateMongoManyBy_idAddToSet,
    UpdateMongoManyBy_idPull,
    UpdateMongoManyBy_idPush,
    UpdateMongoManyPull,
    UpdateMongoManyPullIDToCollectionPull,
    UpdateMongoManyRename,
    UpsertMongo,
    UpdateOneRaw,
  };
};
