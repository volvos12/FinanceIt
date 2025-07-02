/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3826392912")

  // add field
  collection.fields.addAt(16, new Field({
    "hidden": false,
    "id": "number4206946737",
    "max": null,
    "min": null,
    "name": "total_files_count",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "hidden": false,
    "id": "date3483425062",
    "max": "",
    "min": "",
    "name": "last_files_extracted",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3551837371",
    "max": 0,
    "min": 0,
    "name": "extraction_status",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3826392912")

  // remove field
  collection.fields.removeById("number4206946737")

  // remove field
  collection.fields.removeById("date3483425062")

  // remove field
  collection.fields.removeById("text3551837371")

  return app.save(collection)
})
