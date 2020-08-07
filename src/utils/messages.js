const generateMessage = (text, username) => {
  if (!username) username = "Server";
  return {
    text,
    createdAt: new Date().getTime(),
    username,
  };
};

const generateLocationMessage = (location, username) => ({
  location,
  createdAt: new Date().getTime(),
  username,
});

export { generateMessage, generateLocationMessage };
