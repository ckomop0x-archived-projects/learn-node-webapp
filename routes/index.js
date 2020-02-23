const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

const { catchErrors } = require('../handlers/errorHandlers');

// Do work here

// main page
router.get('/', catchErrors(storeController.getStores));

// Add store getData
router.get('/add', storeController.addStore);
// Add store saveData
router.post(
  '/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);
// Add store add/update store
router.post(
  '/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

// All stores page
router.get('/stores', catchErrors(storeController.getStores));

// All stores page
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

// Edit store page
router.get('/stores/:id/edit', catchErrors(storeController.editStore));

// Tags page
router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

module.exports = router;
