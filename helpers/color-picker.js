const getRandom = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

const getColor = (min, max) => {
  const resString = [];
  for (let i = 0; i < 3; i++) {
    const random = getRandom(min, max);
    resString.push(random);
  }
  return resString.map((item) => item.toString(16)).join("");
};

module.exports = { getColor };
