import {defineStore} from "pinia";
import {useSocketStore} from "@/store/websocket.js";
import {userStore} from "@/store/user.js";
import {ref} from "vue";
import {useAudioStore} from "@/store/audio.js";

export const useWebRTCStore = defineStore("useWebRTCStore", () => {
    // 初始化peerConnection
    const socketStore = useSocketStore()
    const user = userStore()
    let peerConnection = ref()

    let fId = ref("")
    const configuration = {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]};
    // 创建peerConnection
    const CreatePeerConnection = (fid) => {
        fId.value = fid;
        return new Promise(async (resolve, reject) => {
            peerConnection.value = new RTCPeerConnection(configuration)
            peerConnection.value.onicecandidate = (evt) => {
                if (evt.candidate) {
                    socketStore.send({
                        type: "video",
                        message: JSON.stringify(evt.candidate),
                        description: "candidate",
                        sender: user.userInfo.ID,
                        receiver: fId.value
                    })
                }
            }
            // 远端 设置显示video
            peerConnection.value.ontrack = event => {
                let ele2 = document.querySelector(".videoMedia2")
                ele2.srcObject = event.streams[0];
                ele2.play()
            };
            resolve()
        })
    }
    // 发送请求
    const Call = async () => {
        return new Promise(async (resolve, reject) => {
            let localStream = await navigator.mediaDevices.getUserMedia({audio: true})
            let ele = document.querySelector(".videoMedia")
            ele.srcObject = localStream
            ele.play()
            localStream.getTracks().forEach(track => {
                peerConnection.value.addTrack(track, localStream);
            });
            resolve()
        })
    }

    const CreateOffer = () => {
        peerConnection.value.createOffer().then(async offer => {
            await peerConnection.value.setLocalDescription(offer)
            socketStore.send({
                type: "video",
                message: JSON.stringify(offer),
                description: "offer",
                sender: user.userInfo.ID,
                receiver: fId.value
            })
        })
    }
    const onMessageFromServer = async (data) => {
        if (data.description === "同意") {
            CreateOffer()
            return
        }
        let message = JSON.parse(data.message)
        switch (data.description) {
            case 'offer':
                peerConnection.value.setRemoteDescription(new RTCSessionDescription(message))
                    .then(() => peerConnection.value.createAnswer().then(async answer => {
                            await peerConnection.value.setLocalDescription(answer)
                            socketStore.send({
                                type: "video",
                                message: JSON.stringify(answer),
                                description: "answer",
                                sender: user.userInfo.ID,
                                receiver: fId.value
                            })
                        }
                    ))
                break;
            case 'answer':
                await peerConnection.value.setRemoteDescription(new RTCSessionDescription(message));
                break;
            case 'candidate':
                await peerConnection.value.addIceCandidate(new RTCIceCandidate(message));
                break;

        }
    }

    return {
        CreatePeerConnection, onMessageFromServer, Call
    }

})
