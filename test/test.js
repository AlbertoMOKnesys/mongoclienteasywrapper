const { ObjectId } = require("mongodb");

const MongoWraper = require("mongoclienteasywrapper")("");

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
