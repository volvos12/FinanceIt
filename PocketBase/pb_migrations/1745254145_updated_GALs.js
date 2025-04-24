/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3826392912")

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "number2484911564",
    "max": null,
    "min": null,
    "name": "Nr_crt",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3826392912")

  // remove field
  collection.fields.removeById("number2484911564")

  return app.save(collection)
})
