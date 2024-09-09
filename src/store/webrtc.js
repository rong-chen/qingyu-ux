import {defineStore} from "pinia";
import {useSocketStore} from "@/store/websocket.js";
import {userStore} from "@/store/user.js";
import {ref} from "vue";

export const useWebRTCStore = defineStore("useWebRTCStore", () => {
    // 初始化peerConnection
    const socketStore = useSocketStore()
    const user = userStore()
    let peerConnection = ref()
    let fId = ref("")
    const Init = (fid) => {
        fId.value = fid;
        console.log(fid);
        peerConnection.value = new RTCPeerConnection({
            iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
        });

        // 处理 ICE 候选者的回调函数
        peerConnection.value.onicecandidate = event => {
            if (event.candidate) {
                // 通过信令服务器将 ICE 候选者发送给远端
                let params = {
                    "type": "video",
                    "message": JSON.stringify(event.candidate),
                    "description": "candidate",
                    "sender": user.userInfo.ID,
                    "receiver": fId.value
                }
                socketStore.send(params)
            }
        };

        // 当远端流添加时，显示远端视频流
        peerConnection.value.ontrack = event => {
            let ele = document.querySelector(".videoMedia2");
            ele.srcObject = event.streams[0];
            ele.play()
        };
    }

    // 处理接收到的 answer
    async function handleAnswer(answer) {
        try {
            await peerConnection.value.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
            console.error('处理 answer 失败:', error);
        }
    }

    // 处理接收到的 ICE 候选者
    async function handleNewICECandidate(candidate) {
        try {
            await peerConnection.value.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            console.error('处理 ICE 候选者失败:', error);
        }
    }

    // 处理接收到的 offer
    async function handleOffer(offer) {
        try {
            await peerConnection.value.setRemoteDescription(new RTCSessionDescription(offer))
            const answer = await peerConnection.value.createAnswer()
            await peerConnection.value.setLocalDescription(answer)
            let params = {
                "type": "video",
                "message": JSON.stringify(answer),
                "description": "answer",
                "sender": user.userInfo.ID,
                "receiver": fId.value
            }
            socketStore.send(params)

        } catch (error) {
            console.error('处理 offer 失败:', error);
        }
    }

    // 模拟从信令服务器接收数据
    async function onMessageFromServer(data) {
        let message = JSON.parse(data.message)
        if (data.description === 'offer') {
            await handleOffer(message);
        } else if (data.description === 'answer') {
            await handleAnswer(message);
        } else if (data.description === 'candidate') {
            await handleNewICECandidate(message);
        }
    }

    // ''''''''''''''''''''''''''''''''''''''''

    // 获取本地视频流并显示在本地视频元素中
    async function startVideo() {
        try {
            let ele = document.querySelector(".videoMedia")
            const stream = await navigator.mediaDevices.getDisplayMedia({video: true})
            ele.srcObject = stream;
            ele.play();
            stream.getTracks().forEach(track => {
                peerConnection.value.addTrack(track, stream)
            })
        } catch (error) {
            console.error('获取媒体流失败:', error)
        }
    }

    async function startCall() {
        // 发起通话
        await startVideo()
        const offer = await peerConnection.value.createOffer()
        await peerConnection.value.setLocalDescription(offer)
        let params = {
            "type": "video",
            "message": JSON.stringify(offer),
            "description": "offer",
            "sender": user.userInfo.ID,
            "receiver": fId.value
        }
        socketStore.send(params)
    }

    const answerCall = async () => {
        const offer = await peerConnection.value.createOffer()
        await peerConnection.value.setLocalDescription(offer)
        let params = {
            "type": "video",
            "message": JSON.stringify(offer),
            "description": "offer",
            "sender": user.userInfo.ID,
            "receiver": fId.value
        }
        socketStore.send(params)
    }
    return {
        onMessageFromServer, startCall, answerCall, Init
    }

})
