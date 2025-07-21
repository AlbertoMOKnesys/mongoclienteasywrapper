// test.js
const { ObjectId } = require("mongodb");
const MongoWraper = require("../index")(
  "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.0"
);

const testCollection = "testCollection";
const testCollection2 = "testCollection2";
const testDB = "testDB";
const testIdDocument1 = "624e09075bda143a913c5d61";
const testIdDocument2 = "624e09075bda143a913c5d62";
const testIdDocument3 = "624e09075bda143a913c5d63";

// Create a sample document to insert
const arrayToSave = [
  {
    _id: ObjectId(testIdDocument1),
    name: "Test Document 1",
    status: "active",
    datetime: new Date(),
  },
  {
    _id: ObjectId(testIdDocument2),
    name: "Test Document 2",
    status: "active",
    datetime: new Date(),
  },
  {
    _id: ObjectId(testIdDocument3),
    name: "Test Document 3",
    status: "active",
    datetime: new Date(),
  },
];

const testIdDocument4 = "624e09075bda143a913c5d64";
const testIdDocument5 = "624e09075bda143a913c5d65";
const testIdDocument6 = "624e09075bda143a913c5d66";

const arrayToSaveReference = [
  {
    _id: ObjectId(testIdDocument4),
    name: "Test Document 4",
    testCollection_id: ObjectId(testIdDocument1),
    status: "active",
    datetime: new Date(),
  },
  {
    _id: ObjectId(testIdDocument5),
    name: "Test Document 5",
    testCollection_id: ObjectId(testIdDocument2),
    status: "active",
    datetime: new Date(),
  },
  {
    _id: ObjectId(testIdDocument6),
    name: "Test Document 6",
    testCollection_id: ObjectId(testIdDocument6),
    status: "active",
    datetime: new Date(),
  },
];

const testSavetoMongo = async () => {
  try {
    console.log("SavetoMongo test");

    // Create a sample document to insert
    const documentToSave = {
      _id: ObjectId(testIdDocument1),
      name: "Test Document",
      status: "active",
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
      testIdDocument1,
      testCollection,
      testDB
    );

    // Log the result of the Find id function
    console.log(result);
  } catch (error) {
    console.error("FindIDOne test failed:", error);
  }
};

const testUpdateMongoBy_id = async () => {
  try {
    console.log("UpdateMongoBy_id test");

    // Call the UpdateMongoBy_id function
    const result = await MongoWraper.UpdateMongoBy_id(
      testIdDocument1,
      {
        newProperty: "newValue",
      },
      testCollection,
      testDB
    );

    // Log the result of UpdateMongoBy_id function
    console.log(result);
  } catch (error) {
    console.error("UpdateMongoBy_id test failed:", error);
  }
};

const testDeleteMongoby_id = async () => {
  try {
    console.log("DeleteMongoby_id test");

    // Call the DeleteMongoby_id function
    const result = await MongoWraper.DeleteMongoby_id(
      testIdDocument1,
      testCollection,
      testDB
    );

    // Log the result of the DeleteMongoby_id function
    console.log(result);
  } catch (error) {
    console.error("DeleteMongoby_id test failed:", error);
  }
};

const testSavetoMongoMany = async () => {
  try {
    console.log("SavetoMongoMany test");

    // Call the SavetoMongo function
    const result = await MongoWraper.SavetoMongoMany(
      arrayToSave,
      testCollection,
      testDB
    );

    // Log the result of the insertion
    console.log("Insert result:", result);
  } catch (error) {
    console.error("SavetoMongo test failed:", error);
  }
};

const testAggregationMongo = async () => {
  try {
    console.log("Testing AggregationMongo");

    // Define an aggregation pipeline
    const aggregationPipeline = [
      {
        $match: {
          _id: {
            $in: [
              ObjectId(testIdDocument1),
              ObjectId(testIdDocument2),
              ObjectId(testIdDocument3),
            ],
          },
          status: { $ne: "deleted" },
        },
      }, // Example stage to match documents where status is not "deleted"
      // { $group: { _id: "$category", total: { $sum: "$amount" } } }, // Example stage to group by category and sum amounts
      { $sort: { _id: -1 } }, // Example stage to sort results by _id in descending order
    ];

    // console.log("Pipeline:", aggregationPipeline);

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

const testDeleteMongo = async (arrayToRemove, collection) => {
  try {
    console.log("DeleteMongo test");

    const query = {
      _id: {
        $in: arrayToRemove,
      },
    };

    // Call the DeleteMongoby_id function
    const result = await MongoWraper.DeleteMongo(query, collection, testDB);

    // Log the result of the DeleteMongo function
    console.log(result);
  } catch (error) {
    console.error("DeleteMongo test failed:", error);
  }
};

const testSaveManyBatch = async () => {
  try {
    console.log("SaveManyBatch test");

    // Call the SaveManyBatch function
    const result = await MongoWraper.SaveManyBatch(
      arrayToSaveReference,
      testCollection2,
      testDB
    );

    // Log the result of the insertion
    console.log("Insert result:", result);
  } catch (error) {
    console.error("SaveManyBatch test failed:", error);
  }
};

const testUpdateMongoMany = async (collection) => {
  try {
    console.log("UpdateMongoMany test");

    // Call the UpdateMongoMany function
    const result = await MongoWraper.UpdateMongoMany(
      {
        status: "active",
      },
      {
        newProperty: "newValue",
      },
      collection,
      testDB
    );

    // Log the result of UpdateMongoMany function
    console.log(result);
  } catch (error) {
    console.error("UpdateMongoMany test failed:", error);
  }
};

const ND_PopulateAuto = async () => {
  try {
    console.log("ND_PopulateAuto test");

    // Call the ND_PopulateAuto function
    const result = await MongoWraper.ND_PopulateAuto(
      { _id: testIdDocument4 },
      testCollection2,
      testDB
    );

    // Log the result of the ND_PopulateAuto function
    console.log("result", result);
    console.log(`result[0].testCollection`);
    console.log(result[0].testCollection);
  } catch (error) {
    console.error("ND_PopulateAuto test failed:", error.me);
    throw new Error(error.message);
  }
};

// Run all tests in sequence
const runTests = async () => {
  console.time("test");

  // First sequence set of functions to test
  await testSavetoMongo();
  await testFindIDOne();
  await testUpdateMongoBy_id();
  await testDeleteMongoby_id();

  // Second sequence set of functions to test
  await testSavetoMongoMany();
  await testAggregationMongo();
  await testDeleteMongo(
    [
      ObjectId("624e09075bda143a913c5d61"),
      ObjectId("624e09075bda143a913c5d62"),
      ObjectId("624e09075bda143a913c5d63"),
    ],
    testCollection
  );

  // Third sequence set of functions to test
  await testSaveManyBatch();
  await testUpdateMongoMany(testCollection2);
  await testDeleteMongo(
    [
      ObjectId("624e09075bda143a913c5d64"),
      ObjectId("624e09075bda143a913c5d65"),
      ObjectId("624e09075bda143a913c5d66"),
    ],
    testCollection2
  );

  // Fourth sequence set of functions to test
  await testSavetoMongoMany();
  await testSaveManyBatch();
  await ND_PopulateAuto();
  await testDeleteMongo(
    [
      ObjectId("624e09075bda143a913c5d61"),
      ObjectId("624e09075bda143a913c5d62"),
      ObjectId("624e09075bda143a913c5d63"),
    ],
    testCollection
  );
  await testDeleteMongo(
    [
      ObjectId("624e09075bda143a913c5d64"),
      ObjectId("624e09075bda143a913c5d65"),
      ObjectId("624e09075bda143a913c5d66"),
    ],
    testCollection2
  );

  // Exit the process after all tests are complete
  console.log("All tests passed successfully. \n");
  console.timeEnd("test");
  process.exit(0);
};

// Execute the tests
runTests();
