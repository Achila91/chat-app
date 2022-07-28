const app_id = "2e67b99a9d824e98b77bb2cb6081701a";
const channel = sessionStorage.getItem("room");
const token = sessionStorage.getItem("token");
let uid = Number(sessionStorage.getItem("uid"));
let name = sessionStorage.getItem("name");

// creating the client object
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

// to store video and audio tracks
let localTracks = [];
//to store remote users
let remoteUser = {};

//joinning the channel(local view)
let joinAndDisplayLoactStream = async () => {
  document.getElementById("room-name").innerText = channel;

  client.on("user-published", handleUserJoined); // to handler other users join
  client.on("user-left", handleUserLeft); // to handler other users leave

  try {
    await client.join(app_id, channel, token, uid);
  } catch (error) {
    console.log(error);
    window.open("/", "_self");
  }

  //creting the user
  let member = await createMember();

  //geting users video and audio tracks
  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  let player = `<div class="video-container" id="user-container-${uid}">
                <div class="user-name-container">
                    <span class="user-name">${member.name}</span>
                </div>
                <div class="video-player" id="user-${uid}"></div>
                </div>`;
  // <img src="" alt="logo" id="test" />;
  // adding the plalyer to the html template
  document
    .getElementById("video-streams")
    .insertAdjacentHTML("beforeend", player);

  //playing the video
  localTracks[1].play(`user-${uid}`);

  //pulishing the channenl with audio and video tracks
  await client.publish([localTracks[0], localTracks[1]]);
};

// if another user joined(to show others)
let handleUserJoined = async (user, mediaType) => {
  remoteUser[user.uid] = user;
  await client.subscribe(user, mediaType);

  if (mediaType == "video") {
    let player = document.getElementById(`user-container-${user.uid}`);
    if (player != null) {
      player.remove();
    }

    //to get the user
    let member = await getMember(user);

    player = `<div class="video-container" id="user-container-${user.uid}">
                <div class="user-name-container">
                    <span class="user-name">${member.name}</span>
                </div>
                <div class="video-player" id="user-${user.uid}">
                </div>
                </div>`;
    // adding the plalyer to the html template
    document
      .getElementById("video-streams")
      .insertAdjacentHTML("beforeend", player);

    //play the video
    user.videoTrack.play(`user-${user.uid}`);
  }

  if (mediaType == "audio") {
    //play the audio
    user.audioTrack.play();
  }
};

// to handler user leave
let handleUserLeft = async (user) => {
  delete remoteUser[user.uid];
  document.getElementById(`user-container-${user.uid}`).remove();
};

//to leave the meeting and remove user form the locl stream
let leaveAndReoveLoaclStream = async () => {
  for (let index = 0; index > localTracks.length; index++) {
    localTracks[i].stop();
    localTracks[i].close();
  }

  await client.leave();
  deleteMember();
  window.open("/", "_self");
};

// to toggle camera
let toggleCamera = async () => {
  if (localTracks[1].enabled) {
    await localTracks[1].setEnabled(false);
    document.getElementById("camera-button").src =
      "../static/images/video_on.svg";
    // document.getElementsByClassName("video-player")[0].style.display = "none";
  } else if (!localTracks[1].enabled) {
    await localTracks[1].setEnabled(true);
    document.getElementById("camera-button").src =
      "../static/images/video_off.svg";
    // document.getElementsByClassName("video-player")[0].style.display = "reset";
  }
};

// to toggle mic
let toggleMic = async () => {
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    document.getElementById("mic-button").src = "../static/images/mic_off.svg";
  } else {
    await localTracks[0].setMuted(true);
    document.getElementById("mic-button").src = "../static/images/mic_on.svg";
  }
};

// creating the user function
let createMember = async () => {
  let response = await fetch("/create-member/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: name, room_name: channel, uid: uid }),
  });
  let member = await response.json();
  console.log(member);
  return member;
};

//to get the member
let getMember = async (user) => {
  let response = await fetch(
    `/get-member/?uid=${user.uid}&room_name=${channel}`
  );
  let member = await response.json();
  return member;
};

//to delete the memeber
let deleteMember = async () => {
  let response = await fetch("/delete-member/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: name, room_name: channel, uid: uid }),
  });
  await response.json();
};

joinAndDisplayLoactStream();

//to leave button
document
  .getElementById("leve-button")
  .addEventListener("click", leaveAndReoveLoaclStream);

// to camera button
document
  .getElementById("camera-button")
  .addEventListener("click", toggleCamera);

// to mic button
document.getElementById("mic-button").addEventListener("click", toggleMic);

//if windwo cloase delete user
window.addEventListener("beforeunload", deleteMember);
