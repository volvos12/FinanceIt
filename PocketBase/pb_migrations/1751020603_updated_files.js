/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3446931122")

  // remove field
  collection.fields.removeById("file1665149175")

  // add field
  collection.fields.addAt(3, new Field({
    "exceptDomains": null,
    "hidden": false,
    "id": "url1665149175",
    "name": "fisier",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3446931122")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "file1665149175",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "fisier",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // remove field
  collection.fields.removeById("url1665149175")

  return app.save(collection)
})
