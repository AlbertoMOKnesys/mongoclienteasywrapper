const MongoWraper = require("mongoclienteasywrapper")(
  "mongodb://knesys:knesysiot123@localhost:27030"
);

const test = async () => {
  const status = await MongoWraper.SavetoMongo(
    { prueba: true },
    "new",
    "tracsadb"
  );
  console.log(status);
  const status2 = await MongoWraper.FindIDOne(
    "624e09075bda143a913c5d61",
    "new",
    "tracsadb"
  );
  console.log(status2);
};
test();
