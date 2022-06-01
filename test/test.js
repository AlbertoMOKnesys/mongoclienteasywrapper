const { ObjectId } = require("mongodb");

const MongoWraper = require("mongoclienteasywrapper")(
  "mongodb://knesys:knesysiot123@localhost:27018"
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

  const status = await MongoWraper.UpdateMongoManyBy_idPull(
    ["6285082968486e9f70cc2b69", "6297dcb134f83be782e70eea"],
    {
      puertas_id: {
        $in: [
          ObjectId("6297ae16ee24062667e2079e"),
          ObjectId("6297ad53ee24062667e2079d"),
        ],
      },
    },
    "estadios",
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
test();
