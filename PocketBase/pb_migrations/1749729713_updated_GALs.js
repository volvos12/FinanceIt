/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3826392912")

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "date3415181003",
    "max": "",
    "min": "",
    "name": "last_checked",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1200858852",
    "max": 0,
    "min": 0,
    "name": "last_hash",
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
  collection.fields.removeById("date3415181003")

  // remove field
  collection.fields.removeById("text1200858852")

  return app.save(collection)
})
