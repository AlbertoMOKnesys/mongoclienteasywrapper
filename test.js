const MongoWraper = require("mongoclienteasywrapper")(
  "mongodb://knesys:knesysiot123@localhost:27030"
);

const test = async () => {
  console.log("Entre a la prueba");
  const status = await MongoWraper.SavetoMongo(
    {
      prueba_id: "624e021f06f5551d4f645903",
      test_id: ["624e021f06f5551d4f645903", "624e09075bda143a913c5d61"],
      horaIngreso_datetime: "2022-05-11T20:17:36Z",
      horaInicio_datetime: "2022-05-11T20:17:36Z",
      hora_datetime: ["2022-05-11T20:17:36Z", "2022-05-11T20:17:36Z"],
    },
    "new",
    "tracsadb"
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
