// test.js
const { ObjectId } = require("mongodb");
const MongoWraper = require("mongoclienteasywrapper")(
  // "mongodb://username:password@localhost:27017/DataBaseTest_MongoClientEasyWrapper"
  "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.0"
);

const testCollection = "testCollection";
const testDB = "testDB";
const testIdDocument = "624e09075bda143a913c5d61";

const testAggregationMongo = async () => {
  try {
    console.log("Testing AggregationMongo");

    // Define an aggregation pipeline
    const aggregationPipeline = [
      { $match: { status: { $ne: "deleted" } } }, // Example stage to match documents where status is not "deleted"
      { $group: { _id: "$category", total: { $sum: "$amount" } } }, // Example stage to group by category and sum amounts
      { $sort: { total: -1 } }, // Example stage to sort results by total in descending order
    ];

    // Call AggregationMongo with the pipeline, collection, and database
    const result = await MongoWraper.AggregationMongo(
      aggregationPipeline,
      testCollection,
      testDB
    );

    // Log the results of the aggregation
    console.log("Aggregation result:", result);
  } catch (error) {
    console.error("AggregationMongo test failed:", error);
  }
};

const testSavetoMongo = async () => {
  try {
    console.log("SavetoMongo test");

    // Create a sample document to insert
    const documentToSave = {
      _id: ObjectId(testIdDocument),
      name: "Test Document",
      datetime: new Date(),
    };

    // Call the SavetoMongo function
    const result = await MongoWraper.SavetoMongo(
      documentToSave,
      testCollection,
      testDB
    );

    // Log the result of the insertion
    console.log("Insert result:", result);
  } catch (error) {
    console.error("SavetoMongo test failed:", error);
  }
};

const testFindIDOne = async () => {
  try {
    console.log("FindIDOne test");

    // Call the FindIDOne function
    const result = await MongoWraper.FindIDOne(
      testIdDocument,
      testCollection,
      testDB
    );

    // Log the result of the Find id function
    console.log(result);
  } catch (error) {
    console.error("FindIDOne test failed:", error);
  }
};

const testDeleteMongoby_id = async () => {
  try {
    console.log("DeleteMongoby_id test");

    // Call the DeleteMongoby_id function
    const result = await MongoWraper.DeleteMongoby_id(
      testIdDocument,
      testCollection,
      testDB
    );

    // Log the result of the DeleteMongoby_id function
    console.log(result);
  } catch (error) {
    console.error("DeleteMongoby_id test failed:", error);
  }
};

// Run all tests in sequence
const runTests = async () => {
  await testSavetoMongo();
  await testFindIDOne();
  // await testAggregationMongo();
  await testDeleteMongoby_id();

  // Exit the process after all tests are complete
  process.exit(0);
};

// Execute the tests
runTests();

// const { ObjectId } = require("mongodb");

// const test = async () => {
//   console.log("Entre a la prueba");
//   Identifier = "4692455";
//   for (let index = 0; index < 100; index++) {
//     const trab = await MongoWraper.PopulateAuto(
//       {
//         status: { $ne: "deleted" },
//         numeroEmpleado: Identifier,
//       },
//       "trabajadores",
//       "GrupoGarzaPonce903228"
//     );
//     console.log(trab[0].numeroEmpleado);
//   }
// };

// const testGetNextSequenceValue = async () => {
//   console.log("Entre a la prueba");
//   const stadtus = await MongoWraper.UpsertMongo(
//     {
//       name: "folioPaseSalida",
//     },
//     {
//       name: "folioPaseSalida",
//     },
//     "counter",
//     "EMPRESAGUSTAVO8501348"
//   );

//   const getnext = await MongoWraper.GetNextSequenceValue(
//     {
//       name: "folioPaseSalida",
//     },
//     1,
//     "counter",
//     "EMPRESAGUSTAVO8501348"
//   );
//   console.log(getnext);
//   console.log("fue esto?");

//   // const status2 = await MongoWraper.FindIDOne(
//   //   "624e09075bda143a913c5d61",
//   //   "new",
//   //   "tracsadb"
//   // );
//   // console.log(status2);
// };

// testGetNextSequenceValue();
// test();
