const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
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
  req.body.author = req.user._id;
  const store = await new Store(req.body).save();
  req.flash(
    'success',
    `Successfully Created ${store.name}. Care to leave a review`
  );
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // 1. List database for list of all stores
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores });
};

exports.getStoreBySlug = async (req, res, next) => {
  // 1. Find store in database
  const store = await Store.findOne({ slug: req.params.slug }).populate(
    'author reviews'
  );
  if (!store) {
    next();
    return;
  }
  // 2. Render store
  res.render('store', { title: store.name, store });
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user.id)) {
    throw Error('You must own a store in order to edit it!');
  }
};

exports.editStore = async (req, res) => {
  // 1. Find the store with the given id
  const store = await Store.findOne({ _id: req.params.id });
  // 2. Confirm the store owner
  confirmOwner(store, req.user);
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
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

  res.render('tag', { tags, title: 'Tags', tag, stores });
};

exports.searchStores = async (req, res) => {
  const stores = await Store.find(
    {
      $text: {
        $search: req.query.q,
      },
    },
    {
      score: { $meta: 'textScore' },
    }
  )
    // sort by score
    .sort({
      score: { $meta: 'textScore' },
    })
    //limit to 5 results
    .limit(5);
  res.json(stores);
};

exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
        $maxDistance: 10000,
      },
    },
  };

  const stores = await Store.find(q)
    .select('photo name slug description location')
    .limit(10);

  res.json(stores);
};

exports.mapPage = async (req, res) => {
  res.render('map', { title: 'Map' });
};

exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map(heart => heart.toString());
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { [operator]: { hearts: req.params.id } },
    { new: true }
  );
  res.json(user);
};

exports.heartsPage = async (req, res) => {
  const stores = await Store.find({ _id: { $in: req.user.hearts } });
  res.render('stores', { title: 'Hearted stores', stores });
};

exports.getTopStores = async (req, res) => {
  const stores = await Store.getTopStores();
  res.render('topStores', { stores, title: '★ Top Stores!' });
};
