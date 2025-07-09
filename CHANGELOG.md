# Changelog

All notable changes to this project will be documented in this file.

---

## [1.1.4] - 2025-06-13

### Added

- `FindOneAndUpdate`: Adds support for updating and returning a document in a single operation.
- `UpdateOneRaw`: Directly updates documents using raw MongoDB update syntax with flexible options.

### Changed

- Improved `FindOne` to support conversion of ObjectIds and Dates before querying.
- Updated `UpdateMongo` function to the new convention

### Fixed

---

## [1.1.5] - 2025-07-08

### Added

- New **`src/utils/`** folder containing helper utilities:
  - `convertIdToObjectId`
  - `convertDateToDatetime`

### Changed

- **`DropCollection`** refactored to use the new conversion helpers.
- **`FindMany`** refactored to use the new conversion helpers.
- **`FindManyLimit`** refactored to use the new conversion helpers.
- **`FindOneLast`** refactored to use the new conversion helpers.
- **`GetAll`** refactored to use the new conversion helpers.
- **`GetLastMongo`** refactored to use the new conversion helpers.
- **`UpsertMongo`** refactored to use the new conversion helpers.
- All internal import paths updated to reference the new utilities.

### Fixed

### Documentation

- Added inline English JSDoc comments to:

  - `aggregationMongo`
  - `DeleteMongoby_id`
  - `DeleteMongo`
  - `DropCollection`
  - `FindIDOne`
  - `FindMany`
  - `FindManyLimit`
  - `FindOne`
  - `FindOneAndUpdate`
  - `FindOneLast`
  - `GetAll`
  - `GetLastMongo`
  - `SaveManyBatch`
  - `SavetoMongoMany`
  - `SavetoMongo`
  - `UpdateMongo`
  - `UpdateMongoBy_id`
  - `UpdateMongoMany`
  - `UpdateOneRaw`
  - `UpsertMongo`
  - `getMongoClient`

---
