// test.js
const MongoWraper = require("mongoclienteasywrapper")(
  "mongodb://username:password@localhost:27017/DataBaseTest_MongoClientEasyWrapper"
);

const testFindIDOne = async () => {
  console.log("Entre a la prueba de FindIDOne");
  const idToFind = "624e09075bda143a913c5d61"; // Coloca aquí el ID que quieras probar
  const result = await MongoWraper.FindIDOne(idToFind, "new", "tracsadb");
  console.log(result);
};
testFindIDOne();

const { ObjectId } = require("mongodb");
const test = async () => {
  console.log("Entre a la prueba");
  Identifier = "4692455";
  for (let index = 0; index < 100; index++) {
    const trab = await MongoWraper.PopulateAuto(
      {
        status: { $ne: "deleted" },
        numeroEmpleado: Identifier,
      },
      "trabajadores",
      "GrupoGarzaPonce903228"
    );
    console.log(trab[0].numeroEmpleado);
  }
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

// testGetNextSequenceValue();
test();
