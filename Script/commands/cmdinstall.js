const axios = require("axios");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

module.exports.config = {
  name: "install",
  version: "4.0.0",
  hasPermssion: 2,
  credits: "SOHAN AHMED",
  description: "Auto Reload Command Installer",
  commandCategory: "System",
  usages: "[file.js code/link]",
  cooldowns: 0
};

const loadCommand = (moduleName) => {
  try {
    const modulePath = path.join(__dirname, moduleName + ".js");

    delete require.cache[require.resolve(modulePath)];

    const command = require(modulePath);

    if (!command.config || !command.run)
      throw new Error("Invalid command structure");

    global.client.commands.delete(command.config.name);

    global.client.eventRegistered =
      global.client.eventRegistered.filter(
        item => item !== command.config.name
      );

    global.client.commands.set(command.config.name, command);

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply } = event;

  if (!args[0]) {
    return api.sendMessage(
      "⚠️ Usage:\n/install cmd.js + reply code\n/install cmd.js code\n/install cmd.js link",
      threadID,
      messageID
    );
  }

  const fileName = args[0];

  if (!fileName.endsWith(".js")) {
    return api.sendMessage(
      "❌ Only .js file allowed!",
      threadID,
      messageID
    );
  }

  let code = "";

  // REPLY CODE
  if (messageReply && messageReply.body) {
    code = messageReply.body;
  }

  // ARG CODE / LINK
  else if (args.slice(1).join(" ")) {
    const input = args.slice(1).join(" ");

    // LINK
    if (/^(http|https):\/\//.test(input)) {
      try {
        const res = await axios.get(input);
        code = res.data;
      } catch {
        return api.sendMessage(
          "❌ Failed to fetch code!",
          threadID,
          messageID
        );
      }
    }

    // DIRECT CODE
    else {
      code = input;
    }
  }

  else {
    return api.sendMessage(
      "❌ No code found!",
      threadID,
      messageID
    );
  }

  // SYNTAX CHECK
  try {
    new vm.Script(code);
  } catch (err) {
    return api.sendMessage(
      "❌ Syntax Error:\n" + err.message,
      threadID,
      messageID
    );
  }

  const filePath = path.join(__dirname, fileName);

  // AUTO SAVE
  fs.writeFileSync(filePath, code, "utf8");

  // AUTO RELOAD
  const moduleName = fileName.replace(".js", "");

  const loaded = loadCommand(moduleName);

  if (!loaded) {
    return api.sendMessage(
      "⚠️ Saved but Reload Failed!",
      threadID,
      messageID
    );
  }

  return api.sendMessage(
    `✅ Auto Reload Complete:\n📂 ${fileName}`,
    threadID,
    messageID
  );
};
