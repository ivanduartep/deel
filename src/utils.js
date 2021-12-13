module.exports = {
  isValidDate: (d) => d instanceof Date && !isNaN(d),
  uniqueValues: (value, index, self) => self.indexOf(value) === index,
};
