// mongofunctions.js
var mongo;
var mongoDb;
const { MongoClient, Timestamp } = require("mongodb");
const { sizeObj } = require("./common");
const ObjectId = require("mongodb").ObjectID;
const mongolib = require("mongodb");
const operatorNotDeleted = { status: { $ne: "deleted" } };
const tagDeleted = { status: "deleted" };

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

async function FindIDOne(Id, collection, databaseName) {
  const DatabaseName = databaseName == null ? mongoDb : databaseName;
  var o_id = new ObjectId(Id);
  const query = { _id: o_id };
  try {
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

async function SavetoMongo(objectToSave, collection, databaseName) {
  try {
    // revisar si existe alguna propiedad que sea ObjectId
    const properties = Object.keys(objectToSave);
    const allKeys = properties.filter((property) => property.includes("_id"));
    console.log();
    allKeys.map((prop) => {
      console.log("objectToSave[prop]: ", objectToSave[prop]);
      return (objectToSave[prop] = new ObjectId(objectToSave[prop]));
    });
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    let result = await dbo.collection(collection).insertOne(objectToSave);
    await db.close();
    return result;
  } catch (error) {
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

async function AggregationMongo(arrAggregation, collection, databaseName) {
  try {
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    let result = await dbo
      .collection(collection)
      .aggregate(arrAggregation, { allowDiskUse: true })
      .toArray();
    await db.close();
    return result;
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

async function DeleteMongoby_id(_id, collection, databaseName) {
  try {
    const query = { _id: mongolib.ObjectID(_id) };
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);
    let result = await dbo.collection(collection).deleteOne(query);
    await db.close();
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function ND_DeleteMongoby_id(_id, collection, databaseName) {
  try {
    const query = { _id: mongolib.ObjectID(_id) };
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
async function UpdateMongoMany(query, newProperties, collection, databaseName) {
  try {
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

async function UpdateMongoBy_id(_id, newProperties, collection, databaseName) {
  try {
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
    const query = { _id: mongolib.ObjectID(_id) };
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
  const _idArrObject = _idArr.map((e) => mongolib.ObjectID(e));
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
  const _idArrObject = _idArr.map((e) => mongolib.ObjectID(e));
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
async function UpdateMongoBy_idRemoveProperty(
  _id,
  property,
  collection,
  databaseName
) {
  try {
    const query = { _id: mongolib.ObjectID(_id) };
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
    const query = { _id: mongolib.ObjectID(_id) };
    const DatabaseName = databaseName == null ? mongoDb : databaseName;
    let db = await MongoClient.connect(mongo.uri, {
      useUnifiedTopology: true,
    });
    const dbo = db.db(DatabaseName);

    var newvalues = {
      $push: { [originCollection]: mongolib.ObjectID(new_id) },
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
      // no hay ni un solo registro de esta consulta
      return [];
    }
  } catch (error) {
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
    UpdateMongoManyPull: UpdateMongoManyPull,
    UpdateMongoManyBy_idPush: UpdateMongoManyBy_idPush,
    UpdateMongoMany: UpdateMongoMany,
    FindOneLast: FindOneLast,
    AggregationMongo: AggregationMongo,
    UpdateMongo: UpdateMongo,
    UpdateMongoBy_id: UpdateMongoBy_id,
    UpdateBy_idPush_id: UpdateBy_idPush_id,
    FindOne: FindOne,
    FindIDOne: FindIDOne,
    GetAll: GetAll,
    SavetoMongoCallback: SavetoMongoCallback,
    SavetoMongo: SavetoMongo,
    DropCollection: DropCollection,
    DeleteMongoCallback: DeleteMongoCallback,
    DeleteMongo: DeleteMongo,
    Distinct: Distinct,
    DeleteMongoby_id: DeleteMongoby_id,
    GetLastMongo: GetLastMongo,
    FindManyLimit: FindManyLimit,
    FindMany: FindMany,
    FindLimitLast: FindLimitLast,
    Populate: Populate,
    PopulateAuto: PopulateAuto,
    FindPaginated: FindPaginated,
    FindIDOnePopulated: FindIDOnePopulated,
    UpdateMongoBy_idRemoveProperty: UpdateMongoBy_idRemoveProperty,
    UpdateMongoBy_idPush: UpdateMongoBy_idPush,
    ND_FindPaginated: ND_FindPaginated,
    ND_PopulateAuto: ND_PopulateAuto,
    ND_FindIDOnePopulated: ND_FindIDOnePopulated,
    ND_DeleteMongoby_id: ND_DeleteMongoby_id,
    ND_FindMany: ND_FindMany,
    UpdateMongoManyBy_idAddToSet: UpdateMongoManyBy_idAddToSet,
    ND_FindOne: ND_FindOne,
    getIndexs: getIndexs,
  };
};
// exports.Connect=Connect;
// exports.UpdateMongoManyBy_idPush = UpdateMongoManyBy_idPush;
// exports.UpdateMongoMany = UpdateMongoMany;
// exports.AggregationMongo = AggregationMongo;
// exports.UpdateMongo = UpdateMongo;
// exports.UpdateMongoBy_id = UpdateMongoBy_id;
// exports.UpdateBy_idPush_id = UpdateBy_idPush_id;
// exports.FindOne = FindOne;
// exports.FindIDOne = FindIDOne;
// exports.GetAll = GetAll;
// exports.SavetoMongoCallback = SavetoMongoCallback;
// exports.SavetoMongo = SavetoMongo;
// exports.DropCollection = DropCollection;
// exports.DeleteMongoCallback = DeleteMongoCallback;
// exports.DeleteMongo = DeleteMongo;
// exports.DeleteMongoby_id = DeleteMongoby_id;
// exports.GetLastMongo = GetLastMongo;
// exports.FindManyLimit = FindManyLimit;
// exports.FindMany = FindMany;
// exports.FindLimitLast = FindLimitLast;
// exports.Populate = Populate;
// exports.PopulateAuto = PopulateAuto;
// exports.FindPaginated = FindPaginated;
// exports.FindIDOnePopulated = FindIDOnePopulated;
// exports.UpdateMongoBy_idRemoveProperty = UpdateMongoBy_idRemoveProperty;
// exports.UpdateMongoBy_idPush = UpdateMongoBy_idPush;
// exports.ND_FindPaginated = ND_FindPaginated;
// exports.ND_PopulateAuto = ND_PopulateAuto;
// exports.ND_FindIDOnePopulated = ND_FindIDOnePopulated;
// exports.ND_DeleteMongoby_id = ND_DeleteMongoby_id;
// exports.ND_FindMany = ND_FindMany;
// exports.UpdateMongoManyBy_idAddToSet = UpdateMongoManyBy_idAddToSet;
// exports.ND_FindOne = ND_FindOne;
// exports.getIndexs = getIndexs;
