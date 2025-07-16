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

## [1.2.2]  ‑  2025‑07‑15

### Added

- **Generic pagination support**
  - `PaginationQueryDto` (`src/common/dto/pagination-query.dto.ts`)  
    Handles `page` and `limit` query params with validation/auto‑casting.
  - Helper `countDocuments` in `mongoclienteasywrapper` for total‑record count (used by paginated endpoints).

### Changed

- **`FindMany`**
  - New 4th parameter **`options`** (projection, sort, skip, limit, hint, …).
  - Backward‑compatible – defaults to `{}` when omitted.
  - Log messages now include page and limit information.
- **Other services** that rely on `FindMany` updated to pass `options` when appropriate.

### Fixed

### Documentation

- Added detailed JSDoc to **`FindMany`** illustrating the new `options` argument and sample pagination usage.

---

## [1.2.3]  ‑  2025‑07‑16

### Added

- **Generic pagination support** across services.
  - Query params `page` & `limit` now parsed and validated (auto‑cast to numbers).
- **Pagination test suite (shared collection)**:
  - Seeds numbered docs into the existing test collection.
  - `testFindManyPagination()` asserts skip/limit + ordering.
  - `testFindManyProjection()` asserts projection exclusion.

### Changed

- **`FindMany`**
  - New 4th param `options` supporting `projection`, `sort`, `skip`, `limit`, `hint`, etc.
  - Explicitly applies `skip`/`limit` on the cursor (handles `0` correctly).
  - Backward‑compatible: defaults to `{}` when omitted.
- Updated service methods that paginate (e.g., Transactions) to pass `page`/`limit` options and return `{ meta, data }`.
- Added pagination‑aware log messages (include page & limit).

### Fixed

- Incorrect page‑1 results when `skip=0` (falsy check) — now respected.
- Projection leakage in tests: wrapper honors `projection` exclusions.

### Documentation

- Expanded JSDoc for **`FindMany`** to document the `options` argument and show pagination usage.
- Added comments to pagination test helpers explaining seed/cleanup flow.

---
