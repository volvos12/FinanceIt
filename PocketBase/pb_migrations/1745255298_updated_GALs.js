/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3826392912")

  // add field
  collection.fields.addAt(11, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2295489659",
    "max": 0,
    "min": 0,
    "name": "Website",
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
  collection.fields.removeById("text2295489659")

  return app.save(collection)
})
