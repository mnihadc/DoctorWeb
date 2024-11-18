const socket = io();

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

const peerConnectionConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    // Add TURN server config here if needed
  ],
};

let localStream;
let peerConnection;

const startCall = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    localStream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = (event) => {
      remoteVideo.srcObject = event.streams[0];
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("new-ice-candidate", event.candidate);
      }
    };

    // If this is the initiator, create an offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("video-offer", offer);
  } catch (error) {
    console.error("Error starting the call: ", error);
  }
};

window.onload = () => {
  startCall();

  // Handling video offer received from the other peer (user or admin)
  socket.on("video-offer", async (offer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("video-answer", answer);
  });

  // Handling video answer received from the other peer (user or admin)
  socket.on("video-answer", (answer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  });

  // Handling ICE candidates
  socket.on("new-ice-candidate", (candidate) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  });
};
