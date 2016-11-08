const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

// the `{shoppingListStorage: storage}` syntax uses destructuring
// assignment to import `shoppingListStorage` and immediatley
// rename it to `storage` inside this module.
const {shoppingListStorage: storage} = require('./storage');

// we're going to add some items to storage
// so there's some data to look at
storage.add('beans', true);
storage.add('tomatoes', false);
storage.add('peppers', false);

// when the root of this router is called with GET, return
// all current storage items
router.get('/', (req, res) => {
  res.json(storage.getItems());
});


// when a new shopping list item is posted, make sure it's
// got required fields ('name' and 'checked'). if not,
// log an error and return a 400 status code. if okay,
// add new item to storage and return it with a 201.
router.post('/', jsonParser, (req, res) => {
  // ensure `name` and `budget` are in request body
  const requiredFields = ['name', 'checked'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  const item = storage.add(req.body.name, req.body.checked);
  res.status(201).json(item);
});


// when DELETE request comes in with an id in path,
// try to delete that item from storage.
router.delete('/:id', (req, res) => {
  storage.deleteItem(req.params.id);
  console.log(`Deleted shopping list item \`${req.params.ID}\``);
  res.status(204).end();
});

// when PUT request comes in with updated item, ensure has
// required fields. also ensure that item id in url path, and
// item id in updated item object match. if problems with any
// of that, log error and send back status code 400. otherwise
// call `storage.updateItem` with updated item.
router.put('/:id', jsonParser, (req, res) => {
  const requiredFields = ['name', 'checked', 'id'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    const message = (
      `Request path id (${req.params.id}) and request body id `
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating shopping list item \`${req.params.id}\``);
  const updatedItem = storage.updateItem({
    id: req.params.id,
    name: req.body.name,
    checked: req.body.checked
  });
  res.status(204).json(updatedItem);
})

module.exports = router;