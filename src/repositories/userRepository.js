const User = require("../models/User");

const findUsersByRoleIds = (roleIds, session = null) => {
  const query = User.find({ role: { $in: roleIds } });
  return session ? query.session(session) : query;
};

module.exports = {
  findUsersByRoleIds
};
