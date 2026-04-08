const Role = require("../models/Role");

const findRolesByNames = (names, session = null) => {
  const query = Role.find({ name: { $in: names } });
  return session ? query.session(session) : query;
};

module.exports = {
  findRolesByNames
};
