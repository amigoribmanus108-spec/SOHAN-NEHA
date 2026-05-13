const axios = require("axios");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

module.exports.config = {
  name: "install",
  version: "3.0.0",
  hasPermssion: 2,
  credits: "SOHAN AHMED",
  description: "Auto reply install system",
  commandCategory: "System",
  usages: "reply code with install filename.js",
  cooldowns: 0
};

const loadModule = (nameModule) => {
  try {

    const modulePath = __dirname + "/" + nameModule + ".js";

    delete require.cache[require.resolve(modulePath)];

    const command = require(modulePath);

    if (!command.config || !command.run)
      throw new Error("Invalid module");

    global.client.commands.delete(command.config.name);

    global.client.eventRegistered =
      global.client.eventRegistered.filter(
        item => item != command.config.name
      );

    global.client.commands.set(command.config.name, command);

    return true;

  } catch (e) {
    console.log(e);
    return false;
  }
};

const unloadModule = (nameModule) => {

  global.client.commands.delete(nameModule);

  global.client.eventRegistered =
    global.client.eventRegistered.filter(
      item => item !== nameModule
    );
};

module.exports.run = async function ({ api, event, args }) {

  const { threadID, messageID, type, messageReply } = event;

  // DELETE SYSTEM
  if (args[0] == "del") {

    const file = args[1];

    if (!file || !file.endsWith(".js")) {
      return api.sendMessage(
        "❌ Please enter valid file name",
        threadID,
        messageID
      );
    }

    const filePath = path.join(__dirname, file);

    if (!fs.existsSync(filePath)) {
      return api.sendMessage(
        "⚠️ File not found",
        threadID,
        messageID
      );
    }

    unloadModule(file.replace(".js", ""));

    fs.unlinkSync(filePath);

    return api.sendMessage(
`╔════❖ DELETE SUCCESS ❖════╗

🗑️ File Deleted Successfully

📁 File:
${file}

━━━━━━━━━━━━━━━━━━
👑 OWNER : SOHAN AHMED
╚════════════════╝`,
      threadID,
      messageID
    );
  }

  // INSTALL SYSTEM
  const fileName = args[0];

  if (!fileName || !fileName.endsWith(".js")) {
    return api.sendMessage(
      "⚠️ Example:\ninstall cmd.js",
      threadID,
      messageID
    );
  }

  if (type != "message_reply") {
    return api.sendMessage(
      "⚠️ Please reply to command code",
      threadID,
      messageID
    );
  }

  const filePath = path.join(__dirname, fileName);

  if (fs.existsSync(filePath)) {
    return api.sendMessage(
      "⚠️ File already exists",
      threadID,
      messageID
    );
  }

  let code = messageReply.body;

  // LINK SUPPORT
  if (/^(http|https):\/\//.test(code.trim())) {

    try {

      const response = await axios.get(code.trim());

      code = response.data;

    } catch {

      return api.sendMessage(
        "❌ Failed to download code",
        threadID,
        messageID
      );
    }
  }

  // CHECK SYNTAX
  try {

    new vm.Script(code);

  } catch (err) {

    return api.sendMessage(
`╔════❖ SYNTAX ERROR ❖════╗

❌ ${err.message}

━━━━━━━━━━━━━━━━━━
⚡ INSTALL FAILED
╚════════════════╝`,
      threadID,
      messageID
    );
  }

  // SAVE FILE
  fs.writeFileSync(filePath, code, "utf8");

  // LOAD MODULE
  const moduleName = fileName.replace(".js", "");

  const loaded = loadModule(moduleName);

  if (!loaded) {

    return api.sendMessage(
`╔════❖ INSTALL FAILED ❖════╗

⚠️ File Saved But Not Loaded

📁 ${fileName}

━━━━━━━━━━━━━━━━━━
👑 SOHAN AHMED
╚════════════════╝`,
      threadID,
      messageID
    );
  }

  return api.sendMessage(
`╔════❖ INSTALL SUCCESS ❖════╗

✅ Command Installed Successfully

📁 File:
${fileName}

⚡ Status:
Loaded Successfully

━━━━━━━━━━━━━━━━━━
👑 OWNER : SOHAN AHMED
╚════════════════╝`,
    threadID,
    messageID
  );
};
