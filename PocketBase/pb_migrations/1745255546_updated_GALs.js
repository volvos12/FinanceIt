/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3826392912")

  // remove field
  collection.fields.removeById("email642995056")

  // add field
  collection.fields.addAt(11, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text642995056",
    "max": 0,
    "min": 0,
    "name": "Email",
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

  // add field
  collection.fields.addAt(9, new Field({
    "exceptDomains": null,
    "hidden": false,
    "id": "email642995056",
    "name": "Email",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "email"
  }))

  // remove field
  collection.fields.removeById("text642995056")

  return app.save(collection)
})
