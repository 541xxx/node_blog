// import { create } from 'domain';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const bluebird = require('bluebird');
const pbkdf2Async = bluebird.promisify(crypto.pbkdf2);
const SALT = require('../../cipher').PASSWORD_SALT;
const UserSchema = new Schema({
  name: {type: String, required: true},
  age: {type: Number},
  avatar: {type: String},
  password: String,
  phoneNumber: String
});

UserSchema.index({name: 1}, {unique: true});
UserSchema.index({name: 1, age: 1});

const DEFAULT_PROJECTION = {password: 0, phoneNumber: 0, __v: 0};
const UserModel = mongoose.model('user', UserSchema);

async function createANewUser(params) {
  const user = new UserModel({name: params.name, age:params.age, phoneNumber: params.phoneNumber});

  user.password = await pbkdf2Async(params.password, SALT, 512, 128, 'sha1')
    .then(r => r.toString())
    .catch(e => {
      throw new Error('something went wrong inside server');
    });
  let created = await user.save()
    .catch(e => {
      switch(e.code) {
        case 11000:
        throw new Error('someone has picked that name, choose an anther！');
        default:
        throw new Error(`error creating user ${ JSON.stringify(params)}`);
      }
    });

    return {
      name: created.name,
      _id: created._id,
      age: created.age
    }
}


async function getUsers (params = {page: 0, pageSize: 10}) {
  let flow = UserModel.find({});
  flow.select(DEFAULT_PROJECTION);
  flow.skip(params.page * params.pageSize);
  flow.limit(params.pageSize);
  return await flow
    .catch(e => {
      console.log(e);
      throw new Error('error getting users from db');
    });
}

async function getUserById(userId) {
  return UserModel.findOne({_id: userId})
    .select(DEFAULT_PROJECTION)
    .catch(e => {
      console.log(e);
      throw new Error(`error getting user by id: ${userId}`);
    });
}

async function updateUserById(userId, update) {
  return await UserModel.findOneAndUpdate({_id: userId}, update, {new: true})
    .select(DEFAULT_PROJECTION)
    .catch(e => {
      throw new Error(`err updating user by id: ${userId}`);
    });
}

async function login(phoneNumber, password) {
  password = await pbkdf2Async(password, SALT, 512, 128, 'sha1')
  .then(r => r.toString())
  .catch(e => {
    throw new Error('something went wrong inside server');
    next(e);
  });

  const user = await UserModel.findOne({phoneNumber, password})
    .select(DEFAULT_PROJECTION)
    .catch(e => {
      console.log(`errpr logging in, phone${phoneNumber}`, {err: e.stack || e});
      throw new Error('something went wrong with the server');
    });
    if (!user) {
      throw Error('No such user!');
    }
    return user;
}
module.exports = {
  model: UserModel,
  createANewUser,
  getUsers,
  getUserById,
  updateUserById,
  login
}
