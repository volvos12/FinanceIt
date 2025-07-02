/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3826392912")

  // add field
  collection.fields.addAt(14, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text810592793",
    "max": 0,
    "min": 0,
    "name": "Calendar_hash",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text4025657210",
    "max": 0,
    "min": 0,
    "name": "Latest_SDL_hash",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1504393053",
    "max": 0,
    "min": 0,
    "name": "Apeluri_hash",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3065134063",
    "max": 0,
    "min": 0,
    "name": "LEADER_hash",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "exceptDomains": null,
    "hidden": false,
    "id": "url304544997",
    "name": "Calendar_url",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  // add field
  collection.fields.addAt(19, new Field({
    "exceptDomains": null,
    "hidden": false,
    "id": "url516051502",
    "name": "SDL_url",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  // add field
  collection.fields.addAt(20, new Field({
    "exceptDomains": null,
    "hidden": false,
    "id": "url4017702518",
    "name": "Apeluri_url",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  // add field
  collection.fields.addAt(21, new Field({
    "exceptDomains": null,
    "hidden": false,
    "id": "url1362242926",
    "name": "Leader_url",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  // update field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1200858852",
    "max": 0,
    "min": 0,
    "name": "home_hash",
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
  collection.fields.removeById("text810592793")

  // remove field
  collection.fields.removeById("text4025657210")

  // remove field
  collection.fields.removeById("text1504393053")

  // remove field
  collection.fields.removeById("text3065134063")

  // remove field
  collection.fields.removeById("url304544997")

  // remove field
  collection.fields.removeById("url516051502")

  // remove field
  collection.fields.removeById("url4017702518")

  // remove field
  collection.fields.removeById("url1362242926")

  // update field
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
})
