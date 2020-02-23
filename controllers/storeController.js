const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image');

    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: "That filetype ism't allowed!" }, false);
    }
  },
};

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

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // if there is no new file to resize
  if (!req.file) {
    next(); // skip to the next middleware
    return;
  }

  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;

  // now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);

  // once we have written our photo to disk, keep going
  next();
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

exports.getStoreBySlug = async (req, res, next) => {
  // 1. Find store in database
  const store = await Store.findOne({ slug: req.params.slug });
  if (!store) {
    next();
    return;
  }
  // 2. Render store
  res.render('store', { title: store.name, store });
};

exports.editStore = async (req, res) => {
  // 1. Find the store with the given id
  const store = await Store.findOne({ _id: req.params.id });
  // 2. Confirm the store owner
  // TODO:
  // 3. Render the edit form so the user can update the store
  res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  // 0. Set the location data to be a point
  // req.body.location.type = 'Point';

  // 1. Find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  }).exec();
  req.flash(
    'success',
    `Successfully updated <b>${store.name}</b>. <a href=/stores/${store.slug}>Visit the store →</a>`
  );
  // 2. Redirect to the store and show that store is updated
  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoresByTag = async (req, res) => {
  const tags = await Store.getTagsList();
  const tag = req.params.tag;
  res.render('tags', { tags, title: 'Tags', tag });
};
