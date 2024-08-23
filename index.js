// mongofunctions.js
let mongo;
let mongoDb;
const { MongoClient, ObjectId } = require("mongodb");
const { sizeObj } = require("./common");
// const mongolib = require("mongodb");
const operatorNotDeleted = { status: { $ne: "deleted" } };
const tagDeleted = { status: "deleted" };

let client;
let db;

async function connectToDatabase(connectionString, dbName) {
  // Check if a connection is already established and is still active
  if (client && client.topology && client.topology.isConnected()) return;

  // Create a new MongoClient instance with the provided connection string
  client = new MongoClient(connectionString, { useUnifiedTopology: true });

  // Connect to the MongoDB server
  await client.connect();

  // Set the database reference
  db = client.db(dbName);
}

async function AggregationMongo(arrAggregation, collection, databaseName) {
  try {
    // Set the database name
    const DatabaseName = databaseName || mongoDb;

    // Ensure a connection to the database is established
    await connectToDatabase(mongo.uri, DatabaseName);

    // Get a reference to the specified collection
    const dbo = db.collection(collection);

    // Execute the aggregation pipeline and return the results as an array
    const result = await dbo
      .aggregate(arrAggregation, { allowDiskUse: true })
      .toArray();
    return result;
  } catch (error) {
    // Log any errors that occur during the aggregation process
    console.error("Aggregation error:", error);
    return [];
  }
}

async function DeleteMongoby_id(_id, collection, databaseName) {
  try {
    // Set the database name
    const DatabaseName = databaseName || mongoDb;

    // Create the search object
    const query = { _id: new ObjectId(Id) };

    // Connect to the database
    await connectToDatabase(mongo.uri, DatabaseName);

    const result = await dbo.collection(collection).deleteOne(query);
    return result;
  } catch (error) {
    console.error("DeleteMongoby_id error:", error.message);
    return [];
  }
}

async function FindIDOne(Id, collection, databaseName) {
  try {
    // Set the database name
    const DatabaseName = databaseName || mongoDb;

    // Create the search object
    const query = { _id: new ObjectId(Id) };

    // Connect to the database
    await connectToDatabase(mongo.uri, DatabaseName);

    const result = await db.collection(collection).findOne(query);
    return result;
  } catch (error) {
    console.error("FindIDOne error:", error.message);
    return {};
  }
}

async function SavetoMongo(objectToSave, collection, databaseName) {
  try {
    // Convert IDs and dates if necessary
    objectToSave = ConvertIdtoObjectId(objectToSave);
    objectToSave = ConvertDatetoDatetime(objectToSave);

    // Set the database name
    const DatabaseName = databaseName || mongoDb;

    // Connect to the database
    await connectToDatabase(mongo.uri, DatabaseName);

    // Insert the object into the collection
    const result = await db.collection(collection).insertOne(objectToSave);

    // Return the result of the insertion
    return result;
  } catch (error) {
    // Log the error and return null if the operation fails
    console.error("SavetoMongo error:", error.message);
    return null;
  }
}

const Connect = (connectionString, defaultDbName) => {
  mongo = { uri: connectionString };
  mongoDb = defaultDbName;
  console.log("Conecting...");
  // try {
  //     let db = await MongoClient.connect(mongo.uri, {
  //       useUnifiedTopology: true,
  //     });
  //     await db.close();
  //     return true;
  //   } catch (error) {
  //     console.log(error.message);
  //     return false
  //   }
  return true;
};

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

const ConvertIdtoObjectId = (objectToSave) =>
  Object.keys(objectToSave).reduce((acum, property) => {
    if (property.includes("_id")) {
      if (Array.isArray(objectToSave[property])) {
        return {
          ...acum,
          [property]: objectToSave[property].map(
            (elementToConvert) => new ObjectId(elementToConvert)
          ),
        };
      }
      return { ...acum, [property]: new ObjectId(objectToSave[property]) };
    } else {
      return { ...acum, [property]: objectToSave[property] };
    }
  }, {});

const ConvertDatetoDatetime = (objectToSave) =>
  Object.keys(objectToSave).reduce((acum, property) => {
    if (property.includes("_datetime")) {
      if (Array.isArray(objectToSave[property])) {
        return {
          ...acum,
          [property]: objectToSave[property].map(
            (elementToConvert) => new Date(elementToConvert)
          ),
        };
      }
      return { ...acum, [property]: new Date(objectToSave[property]) };
    } else {
      return { ...acum, [property]: objectToSave[property] };
    }
  }, {});

async function SavetoMongoMany(arrToSave, collection, databaseName) {
  try {
    // revisar si existe alguna propiedad que sea ObjectId

    arrToSave = arrToSave.map((objectToSave) =>
      ConvertIdtoObjectId(objectToSave)
    );
    arrToSave = arrToSave.map((objectToSave) =>
      ConvertDatetoDatetime(objectToSave)
    );
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    let result = await dbo.collection(collection).insert(arrToSave);
    await db.close();
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}
async function SaveManyBatch(arrToSave, collection, databaseName) {
  try {
    arrToSave = arrToSave.map((objectToSave) =>
      ConvertIdtoObjectId(objectToSave)
    );
    arrToSave = arrToSave.map((objectToSave) =>
      ConvertDatetoDatetime(objectToSave)
    );
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    let result = await dbo.collection(collection).insertMany(arrToSave);
    await db.close();
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}
async function InsertIndexUnique(index, collection, databaseName) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, { useUnifiedTopology: true });
    const dbo = db.db(DatabaseName);
    let result = await dbo
      .collection(collection)
      .createIndex(index, { unique: true });
    await db.close();
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
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    let result = await dbo.collection(collection).distinct(query);
    // .toArray();

    await db.close();
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
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    let result = dbo
      .collection(collection)
      .aggregate(arrAggregation, { cursor: { batchSize: 100 } });
    // await db.close();

    return {
      cursor: result,
      closeConnection: () => {
        db.close();
      },
    };
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function DeleteMongo(query, collection, databaseName) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    let result = await dbo.collection(collection).deleteMany(query);
    await db.close();
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function ND_DeleteMongoby_id(_id, collection, databaseName) {
  try {
    const query = { _id: new ObjectId(_id) };
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    var newvalues = { $set: tagDeleted };
    let result = await dbo.collection(collection).updateOne(query, newvalues);

    let indexes = await dbo.collection(collection).indexes();
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
      let arrIndenfificados = await dbo
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
      let resultIndex = await dbo
        .collection(collection)
        .updateOne(query, newvaluesIndex);

      console.log("MOFIFICADO TAMBIEN INDICES");
    }
    await db.close();
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function getIndexs(collection, databaseName) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    const indexes = await dbo.collection(collection).indexes();
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

    await db.close();
    return indexes;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function UpdateMongo(query, newProperties, collection, databaseName) {
  try {
    newProperties = ConvertIdtoObjectId(newProperties);
    newProperties = ConvertDatetoDatetime(newProperties);
    //cro que esto esta de mas poir que ya esta la funcion de arriba
    query = Object.keys(query).reduce((acum, property) => {
      if (property.includes("_id")) {
        return { ...acum, [property]: ObjectId(query[property]) };
      } else {
        return { ...acum, [property]: query[property] };
      }
    }, {});
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    var newvalues = { $set: newProperties };
    let result = await dbo.collection(collection).updateOne(query, newvalues);
    await db.close();
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}
async function UpsertMongo(query, newProperties, collection, databaseName) {
  try {
    newProperties = ConvertIdtoObjectId(newProperties);
    newProperties = ConvertDatetoDatetime(newProperties);
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, { useUnifiedTopology: true });
    const dbo = db.db(DatabaseName);
    var newvalues = { $set: newProperties };
    let result = await dbo
      .collection(collection)
      .updateOne(query, newvalues, { upsert: true });
    await db.close();
    //console.log(util.inspect(result, false, null, true /* enable colors */))
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}
async function UpdateMongoMany(query, newProperties, collection, databaseName) {
  try {
    newProperties = ConvertIdtoObjectId(newProperties);
    newProperties = ConvertDatetoDatetime(newProperties);
    query = Object.keys(query).reduce((acum, property) => {
      if (property.includes("_id")) {
        return { ...acum, [property]: ObjectId(query[property]) };
      } else {
        return { ...acum, [property]: query[property] };
      }
    }, {});
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    var newvalues = { $set: newProperties };
    let result = await dbo.collection(collection).updateMany(query, newvalues);
    await db.close();
    return result;
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
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    var newvalues = { $rename: newProperties };
    let result = await dbo.collection(collection).updateMany(query, newvalues);
    await db.close();
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function UpdateMongoBy_id(_id, newProperties, collection, databaseName) {
  try {
    newProperties = ConvertIdtoObjectId(newProperties);
    newProperties = ConvertDatetoDatetime(newProperties);
    const query = { _id: ObjectId(_id) };
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    var newvalues = { $set: newProperties };
    let result = await dbo.collection(collection).updateOne(query, newvalues);
    await db.close();
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
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    var newvalues = { $push: newProperties };
    let result = await dbo.collection(collection).updateOne(query, newvalues);
    await db.close();
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
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    var newvalues = { $push: newProperties };
    let result = await dbo.collection(collection).updateMany(query, newvalues);
    await db.close();
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
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    var newvalues = { $addToSet: newProperties };
    let result = await dbo.collection(collection).updateMany(query, newvalues);
    await db.close();
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
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    var newvalues = { $pull: newProperties };
    let result = await dbo.collection(collection).updateMany(query, newvalues);
    await db.close();
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
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    var newvalues = { $pull: query };
    let result = await dbo.collection(collection).updateMany(query, newvalues);
    await db.close();
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
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    var valuesToRemove = { $unset: { [property]: 1 } };
    let result = await dbo
      .collection(collection)
      .updateOne(query, valuesToRemove);
    await db.close();
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
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);

    var newvalues = {
      $push: { [originCollection]: new ObjectId(new_id) },
    };
    let result = await dbo.collection(collection).updateOne(query, newvalues);
    await db.close();
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
async function FindOneLast(query, sortobj, collection, databaseName) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, { useUnifiedTopology: true });
    const dbo = db.db(DatabaseName);
    let result = await dbo
      .collection(collection)
      .find(query)
      .sort(sortobj)
      .limit(1)
      .toArray();
    await db.close();
    //console.log(util.inspect(result, false, null, true /* enable colors */))
    return result[0];
  } catch (error) {
    console.log(error.message);
    return [];
  }
}

async function GetNextSequenceValue(
  query,
  increment,
  collection,
  databaseName
) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, { useUnifiedTopology: true });
    const dbo = db.db(DatabaseName);
    let result = await dbo
      .collection(collection)
      .findOneAndUpdate(
        query,
        { $inc: { sequence_value: increment } },
        { upsert: true }
      );
    await db.close();
    //console.log(util.inspect(result, false, null, true /* enable colors */))
    return result.value.sequence_value;
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

async function GetLastMongo(limit, collection, databaseName) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    let result = await dbo
      .collection(collection)
      .find()
      .sort({ _id: 1 })
      .limit(limit)
      .toArray();
    await db.close();
    return result;
  } catch (error) {
    console.log(error.message);
    return [];
  }
}

async function FindOne(query, collection, databaseName) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    let result = await dbo.collection(collection).findOne(query);
    await db.close();
    return result;
  } catch (error) {
    console.log(error.message);
    return {};
  }
}

async function ND_FindOne(query, collection, databaseName) {
  try {
    const queryNotDeletes = { ...query, ...operatorNotDeleted };
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    let result = await dbo.collection(collection).findOne(queryNotDeletes);
    await db.close();
    return result;
  } catch (error) {
    console.log(error.message);
    return {};
  }
}

async function FindManyLimit(query, limit, collection, databaseName) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    let result = await dbo
      .collection(collection)
      .find(query)
      .limit(limit)
      .toArray();
    await db.close();
    return result;
  } catch (error) {
    console.log(error.message);
    return [];
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
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    let result = await dbo
      .collection(collection)
      .find(queryNotDeletes)
      .sort(order)
      .toArray();
    await db.close();
    return result;
  } catch (error) {
    console.log(error.message);
    return [];
  }
}
async function FindMany(query, collection, databaseName) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    let result = await dbo.collection(collection).find(query).toArray();
    await db.close();
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
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    // const skipIndex = (page - 1) * limit;
    let result = await dbo
      .collection(collection)
      .find(query)
      .sort({ _id: 1 })
      .limit(nPerPage)
      .skip(pageNumber > 0 ? pageNumber * nPerPage : 0)
      .toArray();
    await db.close();
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
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    // const skipIndex = (page - 1) * limit;
    let result = await dbo
      .collection(collection)
      .find(queryNotDeletes)
      .sort({ _id: 1 })
      .limit(nPerPage)
      .skip(pageNumber > 0 ? pageNumber * nPerPage : 0)
      .toArray();
    await db.close();
    return result;
  } catch (error) {
    console.log(error.message);
    return [];
  }
}

async function GetAll(collection, databaseName) {
  try {
    //// GUS si estas leyendo, el problema esta en que se perdieron las variables en la mac
    //// tienes que hacer docker-compose down de todo el proyecto y volverlo a levantar
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    let result = await dbo
      .collection(collection)
      .find()
      .sort({ _id: 1 })
      .toArray();
    await db.close();
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
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    let result = await dbo
      .collection(collection)
      .find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .toArray();
    await db.close();
    return result;
  } catch (error) {
    console.log(error.message);
    return [];
  }
}

async function DropCollection(collection, databaseName) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    let result = await dbo.collection(collection).drop();
    await db.close();
    return result;
  } catch (error) {
    console.log(error.message);
    return [];
  }
}

async function Populate(collection, databaseName, joinCollection) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });

    // hacer la populacion
    const dbo = db.db(DatabaseName);
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

    let result = await dbo.collection(collection).aggregate(lookup).toArray();
    await db.close();
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
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);

    var doc = await dbo.collection(collection).findOne(query);
    if (doc) {
      /// si hay almenos un documento
      const properties = Object.keys(doc);
      const allKeys = properties.filter((property) => property.includes("_id"));
      if (allKeys.length > 1) {
        /// existe almenos una referencia _id aparte del current _id
        allKeys.shift(); // para remover el primer registro _id
        const lookup = allKeys.map((toJoin) => {
          toJoin = toJoin.replace("_id", "");
          return {
            $lookup: {
              from: toJoin,
              localField: toJoin + "_id",
              foreignField: "_id",
              as: toJoin,
            },
          };
        });

        if (Object.keys(query).length !== 0) {
          lookup.push({ $match: query });
        }
        let result = await dbo
          .collection(collection)
          .aggregate(lookup)
          .toArray();
        await db.close();
        return result;
      } else {
        let result = await dbo.collection(collection).find(query).toArray();
        await db.close();
        return result;
      }
    } else {
      await db.close();
      // no hay ni un solo registro de esta consulta
      return [];
    }
  } catch (error) {
    // await db.close();
    console.log(error.message);
    return [];
  }
}

async function ND_PopulateAuto(query, collection, databaseName) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    query = Object.keys(query).reduce((acum, property) => {
      if (property.includes("_id")) {
        return { ...acum, [property]: ObjectId(query[property]) };
      } else {
        return { ...acum, [property]: query[property] };
      }
    }, {});
    const queryNotDeletes = { ...query, ...operatorNotDeleted };
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);

    /// para obtener el arreglo de todas las properties que contienen la coleccion
    var allKeys = new Set(); // new set es para guardar unicamente una vez(no duplicados)
    let properties = [];
    await dbo
      .collection(collection)
      .find()
      .forEach(function (o) {
        for (key in o) allKeys.add(key);
      });
    for (let key of allKeys) properties.push(key);

    if (properties) {
      /// si hay almenos un documento
      // const properties = Object.keys(doc[0]);
      const allKeys = properties.filter((property) => property.includes("_id"));
      if (allKeys.length > 1) {
        /// existe almenos una referencia _id aparte del current _id
        allKeys.shift(); // para remover el primer registro _id
        const lookup = allKeys.map((toJoin) => {
          toJoin = toJoin.replace("_id", "");
          return {
            $lookup: {
              from: toJoin,
              localField: toJoin + "_id",
              foreignField: "_id",
              as: toJoin,
            },
          };
        });

        // if (Object.keys(query).length !== 0) {
        lookup.push({ $match: queryNotDeletes });
        // }
        console.log("lookup: ", lookup);
        let result = await dbo
          .collection(collection)
          .aggregate(lookup)
          .toArray();
        await db.close();
        return result;
      } else {
        let result = await dbo
          .collection(collection)
          .find(queryNotDeletes)
          .toArray();
        await db.close();
        return result;
      }
    } else {
      // no hay ni un solo registro de esta consulta
      return [];
    }
  } catch (error) {
    console.log(error.message);
    return [];
  }
}
async function FindIDOnePopulated(Id, collection, databaseName) {
  const DatabaseName = databaseName == null ? mongoDb : databaseName;
  var o_id = new ObjectId(Id);
  const query = { _id: o_id };
  try {
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    // let result = await dbo.collection(collection).findOne(query);
    // await db.close();
    // //console.log(util.inspect(result, false, null, true /* enable colors */))
    // return result;

    const doc = await dbo.collection(collection).findOne(query);
    if (doc) {
      /// si hay almenos un documento
      const properties = Object.keys(doc);
      const allKeys = properties.filter((property) => property.includes("_id"));
      if (allKeys.length > 1) {
        /// existe almenos una referencia _id aparte del current _id
        allKeys.shift(); // para remover el primer registro _id
        const lookup = allKeys.map((toJoin) => {
          toJoin = toJoin.replace("_id", "");
          return {
            $lookup: {
              from: toJoin,
              localField: toJoin + "_id",
              foreignField: "_id",
              as: toJoin,
            },
          };
        });

        if (sizeObj(query) > 0) {
          lookup.push({ $match: query });
        }
        let result = await dbo
          .collection(collection)
          .aggregate(lookup)
          .toArray();
        await db.close();
        return result;
      } else {
        let result = await dbo.collection(collection).find(query).toArray();
        await db.close();
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
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    // let result = await dbo.collection(collection).findOne(query);
    // await db.close();
    // //console.log(util.inspect(result, false, null, true /* enable colors */))
    // return result;

    const doc = await dbo.collection(collection).findOne(queryNotDeletes);
    if (doc) {
      /// si hay almenos un documento
      const properties = Object.keys(doc);
      const allKeys = properties.filter((property) => property.includes("_id"));
      if (allKeys.length > 1) {
        /// existe almenos una referencia _id aparte del current _id
        allKeys.shift(); // para remover el primer registro _id
        const lookup = allKeys.map((toJoin) => {
          toJoin = toJoin.replace("_id", "");
          return {
            $lookup: {
              from: toJoin,
              localField: toJoin + "_id",
              foreignField: "_id",
              as: toJoin,
            },
          };
        });

        // if (sizeObj(query) > 0) {
        lookup.push({ $match: queryNotDeletes });
        // }
        let result = await dbo
          .collection(collection)
          .aggregate(lookup)
          .toArray();
        await db.close();
        return result;
      } else {
        let result = await dbo
          .collection(collection)
          .find(queryNotDeletes)
          .toArray();
        await db.close();
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
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    let result = await dbo.collection(collection).count(query);
    await db.close();
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
    let db = await MongoClient.connect(mongo.uri, { useUnifiedTopology: true });
    const dbo = db.db(DatabaseName);
    var removeValues = { $pull: propertiesRemove };
    let result = await dbo
      .collection(collection)
      .updateMany(query, removeValues);
    await db.close();
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
  };
};
