const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
  res.render('index', {
    name: req.name,
  });
};

exports.addStore = (req, res) => {
  res.render('editStore', {
    title: 'Add Store',
  });
};

exports.createStore = async (req, res) => {
  const store = await new Store(req.body).save();
  req.flash(
    'success',
    `Successfully Created ${store.name}. Care to leave a review`
  );
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // 1. List database for list of all stores
  const stores = await Store.find({});
  res.render('stores', { title: 'Stores', stores });
};

exports.editStore = async (req, res) => {
  // 1. Find the store with the given id
  const store = await Store.findOne({ _id: req.params.id })
  // 2. Confirm the store owner
  // TODO:
  // 3. Render the edit form so the user can update the store
  res.render('editStore', { title: `Edit ${store.name}`, store })
};

exports.updateStore = async (req, res) => {
  // 1. Find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true
  }).exec()
  req.flash('success', `Successfully updated <b>${store.name}</b>. <a href=/stores/${store.slug}>Visit the store →</a>`)
  // 2. Redirect to the store and show that store is updated
  res.redirect(`/stores/${store._id}/edit`)
}
