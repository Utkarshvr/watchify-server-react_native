function generateUniqueChannelID() {
  const prefix = "UC";
  const random1 = generateRandomString(5); // You can adjust the length as needed
  const separator1 = "-";
  const random2 = generateRandomString(8); // You can adjust the length as needed
  const separator2 = "__";
  const random3 = generateRandomString(10); // You can adjust the length as needed

  const channelID = `${prefix}${random1}${separator1}${random2}${separator2}${random3}`;

  return channelID;
}

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

module.exports = generateUniqueChannelID;
