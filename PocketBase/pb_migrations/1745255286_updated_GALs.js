/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3826392912")

  // remove field
  collection.fields.removeById("url2295489659")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3826392912")

  // add field
  collection.fields.addAt(10, new Field({
    "exceptDomains": null,
    "hidden": false,
    "id": "url2295489659",
    "name": "Website",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  return app.save(collection)
})
