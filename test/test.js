const { ObjectId } = require("mongodb");

const MongoWraper = require("mongoclienteasywrapper")(
  "mongodb://knesys:knesysiot123@localhost:27017"
);

const test = async () => {
  console.log("Entre a la prueba");
  // const stadtus = await MongoWraper.SavetoMongo(
  //   {
  //     prueba_id: "624e021f06f5551d4f645903",
  //     test_id: ["624e021f06f5551d4f645903", "624e09075bda143a913c5d61"],
  //     horaIngreso_datetime: "2022-05-11T20:17:36Z",
  //     horaInicio_datetime: "2022-05-11T20:17:36Z",
  //     hora_datetime: ["2022-05-11T20:17:36Z", "2022-05-11T20:17:36Z"],
  //   },
  //   "estadios",
  //   "EMPRESAPACHUCA719481"
  // );

  const status = await MongoWraper.UpdateMongoManyPullIDToCollectionPull(
    { eventos_id: ObjectId("62b269ae108bf4fd0355c199") },
    "torneos",
    "EMPRESAPACHUCA719481"
  );
  console.log(status);
  // const status2 = await MongoWraper.FindIDOne(
  //   "624e09075bda143a913c5d61",
  //   "new",
  //   "tracsadb"
  // );
  // console.log(status2);
};

const testGetNextSequenceValue = async () => {
  console.log("Entre a la prueba");
  const stadtus = await MongoWraper.UpsertMongo(
    {
      name: "folioPaseSalida",
    },
    {
      name: "folioPaseSalida",
    },
    "counter",
    "EMPRESAGUSTAVO8501348"
  );

  const getnext = await MongoWraper.GetNextSequenceValue(
    {
      name: "folioPaseSalida",
    },
    1,
    "counter",
    "EMPRESAGUSTAVO8501348"
  );
  console.log(getnext);
  console.log("fue esto?");
  // const status2 = await MongoWraper.FindIDOne(
  //   "624e09075bda143a913c5d61",
  //   "new",
  //   "tracsadb"
  // );
  // console.log(status2);
};
testGetNextSequenceValue();
// test();
