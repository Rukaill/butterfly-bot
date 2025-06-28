// utils/isAdmin.js
module.exports = (member) =>
  member.permissions.has('ManageGuild') ||
  member.roles.cache.some(r => r.name === 'Admin');