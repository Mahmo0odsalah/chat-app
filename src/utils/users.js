const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!room || !username) {
    return { error: "Room and username must be provided" };
  }

  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });
  if (existingUser) {
    return { error: "Username already taken" };
  }
  users.push({ id, username, room });
  return { user: { id, username, room } };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index >= 0) return users.splice(index, 1)[0];
};

const getUser = (id) => {
  const user = users.find((user) => user.id === id);
  return user;
};

const getUsers = (room) => {
  room = room.trim().toLowerCase();
  const room_users = users.filter((user) => user.room === room);
  return room_users;
};

export { addUser, removeUser, getUser, getUsers };
