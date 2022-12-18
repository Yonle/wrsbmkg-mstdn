require("dotenv").config();
const { login } = require("masto");
const WRSBMKG = require("wrs-bmkg");
const get = require("miniget");

let masto = null;
let wrs = WRSBMKG();

let posts = 0;

async function post(t, etc = {}, eStr = "") {
  //if (!(posts >= 3)) return posts++;
  return await masto.statuses.create({
    status: t + "\n#wrsbmkg #gempabot " + eStr,
    visibility: process.env.VISIBILITY || "unlisted",
    ...etc
  });
}

async function makeAttachment(s, d) {
  return await masto.mediaAttachments.create({
    file: s,
    description: d
  });
}

function getShakemap(n) {
  return new Promise(async (res, rej) => {
    let stream = get(
      "https://bmkg-content-inatews.storage.googleapis.com/" + n
    );
    stream.on("error", async (e) => {
      stream.destroy();
      setTimeout(async (_) =>
        res(await getShakemap(n))
      , 3000);
    });

    stream.on("response", (_) => res(stream));
  });
}

async function postWarning(t, etc) {}

wrs.on("error", (e) => {
  console.error(e);
  wrs.stopPolling();
  wrs.startPolling();
});

wrs.on("Gempabumi", async (msg) => {
  await post(msg.headline);
  let text = [msg.subject, msg.description, msg.area, msg.potential, msg.instruction];
  try {
    let { id } = await makeAttachment(await getShakemap(msg.shakemap), "ShakeMap di Koordinat " + msg.point.coordinates);
    await post(text.join("\n\n"), {
      mediaIds: [id]
    });
  } catch (e) {
    text.push("Shakemap: https://data.bmkg.go.id/DataMKG/TEWS/" + msg.shakemap);
    await post(text.join("\n\n"));
  }
});

wrs.on("realtime", (msg) => {
  msg.geometry.coordinates.pop();
  let text = [
    msg.properties.place,
    "Tanggal   : " + new Date(msg.properties.time).toLocaleDateString("id"),
    "Waktu     : " +
      `${new Date(msg.properties.time).toLocaleTimeString("us", {
        timeZone: "Asia/Jakarta",
      })} (WIB)`,
    "Magnitudo : " + Number(msg.properties.mag).toFixed(1),
    "Koordinat : " + msg.geometry.coordinates.reverse().join(", "),
  ];

  if (Number(msg.properties.mag) >= 7)
    text.unshift("Peringatan: Gempa berskala M >= 7");
  else if (Number(msg.properties.mag) >= 6)
    text.unshift("Peringatan: Gempa berskala M >= 6");
  else if (Number(msg.properties.mag) >= 5)
    text.push("\nPeringatan: Gempa berskala M >= 5");

  post(text.join("\n"), {}, "#gempaM" + Math.floor(msg.properties.mag));
});

async function Login() {
  masto = await login({
    url: process.env.SERVER_URL,
    accessToken: process.env.ACCESS_TOKEN,
  });

  wrs.stopPolling();
  wrs.startPolling();
}

Login().catch(console.error);
