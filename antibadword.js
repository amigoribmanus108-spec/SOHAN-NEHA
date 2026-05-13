module.exports.config = {
  name: "antibadword",
  eventType: ["message"],
  version: "1.0.0",
  author: "SOHAN AHMED",
  description: "Auto kick bad language user"
};

const warnings = {};

module.exports.run = async function () {};

module.exports.handleEvent = async function ({
  api,
  event,
  usersData
}) {

  if (!event.body) return;

  const msg = event.body.toLowerCase();
  const uid = event.senderID;
  const threadID = event.threadID;

  const badWords = [
    "fuck","bitch","sex","mc","bc",
    "madarchod","chutiya","bokachoda",
    "bal","khanki","magi","randi",
    "motherfucker","slut","gandu",
    "lund","tor ma","tor bon"
  ];

  if (!warnings[threadID])
    warnings[threadID] = {};

  if (!warnings[threadID][uid])
    warnings[threadID][uid] = 0;

  const found = badWords.some(word =>
    msg.includes(word)
  );

  if (found) {

    warnings[threadID][uid]++;

    const count = warnings[threadID][uid];

    const userName = await usersData.getName(uid);

    if (count >= 3) {

      api.sendMessage({
        body:
`🚨 ব্যবহারকারী ${userName} (UID: ${uid}) আপনি ৩ বার অশালীন শব্দ ব্যবহার করার কারণে আপনাকে গ্রুপ থেকে রিমুভ করা হবে 🤬🔪

⏳ ৩০ সেকেন্ড পরে Kick দেওয়া হবে...`,
        mentions: [{
          tag: userName,
          id: uid
        }]
      }, threadID);

      setTimeout(() => {
        api.removeUserFromGroup(uid, threadID);
      }, 30000);

    } else {

      api.sendMessage({
        body:
`⚠️ ${userName} খারাপ ভাষা ব্যবহার করবেন না!

📝 Warning: ${count}/3`,
        mentions: [{
          tag: userName,
          id: uid
        }]
      }, threadID);
    }
  }
};
