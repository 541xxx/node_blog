let UESR_ID_INIT = 10000;
let users = [];

class User {
  constructor(params) {
    if (!params.name || !params.age) {
      throw new Error('age and name required')
    }
    this.name = params.name;
    this.age = params.age;
    this._id = UESR_ID_INIT++;
  }
}

async function createANewUser(parmas) {
  const user = new User(parmas);
  users.push(user);
  return user;
}

async function getUsers(params) {
  return users;
}

async function getUserById(userId) {
  return users.find(u => u._id === Number(userId));
}
async function updateUserById(userId, update) {
  const user =  users.find(u => u._id === userId);
  if (update.name) {
    user.name = update.name;
  }
  if (update.age) {
    user.age = update.age;
  }
  return user;
}

module.exports = {
  model: User,
  createANewUser,
  getUsers,
  getUserById,
  updateUserById
};