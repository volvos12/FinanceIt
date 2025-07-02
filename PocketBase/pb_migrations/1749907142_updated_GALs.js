/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3826392912")

  // remove field
  collection.fields.removeById("text1200858852")

  // remove field
  collection.fields.removeById("text810592793")

  // remove field
  collection.fields.removeById("text4025657210")

  // remove field
  collection.fields.removeById("text1504393053")

  // remove field
  collection.fields.removeById("url516051502")

  // remove field
  collection.fields.removeById("url4017702518")

  // remove field
  collection.fields.removeById("url1362242926")

  // add field
  collection.fields.addAt(15, new Field({
    "hidden": false,
    "id": "json3464387932",
    "maxSize": 0,
    "name": "snapshot_config",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "hidden": false,
    "id": "select1643386684",
    "maxSelect": 1,
    "name": "snapshot_status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "active",
      "inactive",
      "error"
    ]
  }))

  // update field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "date3415181003",
    "max": "",
    "min": "",
    "name": "last_snapshot_date",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // update field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3065134063",
    "max": 0,
    "min": 0,
    "name": "section_hash",
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

  // remove field
  collection.fields.removeById("json3464387932")

  // remove field
  collection.fields.removeById("select1643386684")

  // update field
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

  // update field
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

  return app.save(collection)
})
