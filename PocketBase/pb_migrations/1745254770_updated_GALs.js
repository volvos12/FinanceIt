/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3826392912")

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number3337150024",
    "max": null,
    "min": null,
    "name": "Populatie",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3826392912")

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number3337150024",
    "max": null,
    "min": null,
    "name": "Populaie",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
