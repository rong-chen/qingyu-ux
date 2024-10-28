<template>
  <div class="voiceClass-container">
    <div class="friend-container">
      <div class="left-container">
        <div class="title ellipsis">用户id:{{ userEvent.userInfo.ID.slice(0, 8) }}<span>
           <el-button link style="margin-left: 10px" @click="copyUserId">
             <template #icon>
                <el-icon color="white"><CopyDocument/></el-icon>
             </template>
           </el-button>
        </span></div>
        <div class="classify infinite-list roomItem" style="overflow: auto;">
          <el-collapse v-model="currentRoomId">
            <el-collapse-item title="我的房间" name="1">
              <div class="item" style="color: white" v-for="item in classifyList"
                   @click="handleRoomCollapseChange(item)">
                {{ item.label }}
                <el-button link style="margin-left: 10px" @click.stop="copyRoomId(item.ID)">
                  <template #icon>
                    <el-icon color="white">
                      <CopyDocument/>
                    </el-icon>
                  </template>
                </el-button>
              </div>
            </el-collapse-item>
          </el-collapse>
          <el-collapse v-model="currentRoomId">
            <el-collapse-item title="我的收藏" name="2">
              <div class="item" style="color: white" v-for="item in collectList"
                   @click="handleRoomCollapseChange(item['roomInfo'])">
                {{ item['roomInfo']['label'] }}
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>

    <div style="width: calc(100% - 200px);" class="video-container">
      <ul class="infinite-list video-container-ul" style="overflow: auto;width: 100%;height: 100%">
        <li class="infinite-list-item" style="width: 48%;height: auto" v-for="item in Object.keys(peerConnectionList)"
            :key="item">
          <el-card style="width: 100%;height: 100%;padding: 0">
            <video :class="'video-container-player-'+item" style="width: 100%;height: 100%"></video>
          </el-card>
        </li>
      </ul>
    </div>
  </div>
</template>


<script setup>
import {nextTick, onBeforeUnmount, onMounted, reactive, ref} from "vue";
import {userStore} from "@/store/user.js";
import {ElMessage} from "element-plus";
import {getCollectRoomList, getCreateRoomList, joinRoom} from "@/api/room.js";
import {useSocketStore} from "@/store/websocketHandler/websocket.js";

let currentRoomId = ref("");
let lastRoomId = ref("");
let peerConnectionList = ref({});
let collectList = ref([])
const configuration = {
  iceServers: [
    {urls: 'stun:stun.l.google.com:19302'},
    {
      urls: 'turn:47.120.34.163:3478', // TURN 服务器地址
      username: 'chenrong', // TURN 用户名
      credential: '130561' // TURN 密码
    }
  ]
};
let screenStream = ref(null)
const resetEle = async () => {
  await nextTick(() => {
    Object.keys(peerConnectionList.value).forEach((item) => {
      const videoElement = document.querySelector(`.video-container-player-${item}`);
      if (videoElement) {
        videoElement.srcObject = peerConnectionList.value[item]["stream"];
        videoElement.onloadedmetadata = () => {
          videoElement.play();
        };
      } else {
        console.error('未找到对应的 <video> 元素');
      }
    })
  })
}

const handleRoomCollapseChange = async ({ID}) => {
  exitRoomFunc()
  let id = await initMediaSource();
  const res = await joinRoom({
    "id": userEvent.userInfo.ID,
    "roomId": ID,
    "mediaStreamId": id
  })
  if (res['code'] === 0) {
    ElMessage.success("加入房间成功")
    lastRoomId.value = ID
  }
}
const exitRoomFunc = () => {
  if (!lastRoomId.value) {
    return
  }
  screenStream.value = null
  let paramsMap = {
    type: "room_notify_exit",
    message: "",
    description: "用户退出",
    sender: userEvent.userInfo.ID,
    roomId: lastRoomId.value,
  }
  socketStore.sendAny(paramsMap);
}
const userEvent = userStore()
const classifyList = ref([])
onMounted(async () => {
  const {data, code} = await getCreateRoomList()
  if (code === 0) {
    data.forEach(item => {
      classifyList.value.push(item)
    })
  }
  const res = await getCollectRoomList()
  if (res['code'] === 0) {
    collectList.value = res.data
  }
  ListenSocketMessage()

  window.addEventListener('beforeunload', exitRoomFunc);
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', exitRoomFunc);
})

const socketStore = useSocketStore()
const ListenSocketMessage = () => {
  socketStore.addWebSocketCallBack(socketMessage)
}

let pendingCandidates = ref([])

const resetConnect = (userId) => {
  let paramsMap = {
    type: "resetConnect",
    message: "重连",
    description: "重连",
    sender: userEvent.userInfo.ID,
    receiver: userId,
  }
  socketStore.sendAny(paramsMap);
}

let isInit = ref(false)
const socketMessage = async (data) => {
  if (data['type'] === 'room_notify') {
    if (data.description === '新用户加入') {
      let userIdList = data['roomInfo']['onlineUser']
      if (userIdList && userIdList.length > 0) {
        for (const item of userIdList) {
          if (getPeer(item['userId'])) {
            updatePeer(item['userId'], item['streamId'])
          }


          if (userEvent.userInfo.ID === item['userId']) {
            updatePeer(item['userId'], '', '', screenStream.value)
          }

          if (!getPeer(item['userId']) && item['userId'] !== userEvent.userInfo.ID) {
            let peer = createPeer()
            setPeer(item['userId'], {
              peer: peer,
              stream: null,
              streamId: item['streamId']
            })

            screenStream.value?.getTracks().forEach((track) => {
              getPeer(item['userId']).addTrack(track, screenStream.value)
            })

            peer.onicecandidate = (e) => {
              onicecandidate(e, item['userId'])
            }
            peer.oniceconnectionstatechange = oniceconnectionstatechange(peer, item['userId'])
            peer.onsignalingstatechange = onsignalingstatechange(peer)
            peer.ontrack = ontrack
          }
        }
        if (!isInit.value) {
          await firstJoinSendOffer()
        }
        isInit.value = true
      }
    } else if (data.description === '用户离开') {
      let userIdList = data['roomInfo']['onlineUser']
      if (userIdList && userIdList.length) {
        let maps = {}
        // 还剩下的好友列表
        let idList = userIdList.map((item) => item['userId'])
        Object.keys(peerConnectionList.value).forEach((el) => {
          if (idList.includes(el)) {
            maps[el] = peerConnectionList.value[el]
          } else {
            getPeer(el).close();
          }
        })
        peerConnectionList.value = maps;
      } else {
        peerConnectionList.value = {};
      }
    } else if (data.description === '重连') {
      let peer = getPeer(data['receiver'])
      let offer = await peer.createOffer({iceRestart: true})
      await peer.setLocalDescription({
        type: 'offer',
        sdp: offer.sdp
      })

      let paramsMap = {
        type: "offer",
        message: offer.sdp,
        description: "offer",
        sender: userEvent.userInfo.ID,
        receiver: data['sender'],
      }
      socketStore.sendAny(paramsMap);
    }
  } else if (data['type'] === 'resetConnect') {
    await initializePeer(data['receiver'], data['sender'], userEvent.userInfo.ID)
  }
  if (['offer', 'answer', 'candidate'].includes(data['type'])) {
    let peer;
    switch (data['type']) {
      case 'offer':
        if (data['description'] === 'reconnect') {
          await receiverOfferHandler(data['sender'], {
            type: "offer",
            sdp: data['message']
          })
          return
        } else {
          peer = getPeer(data['sender'])
          await setRemoteOfferAndSendAnswer(data['sender'], {
            type: "offer",
            sdp: data['message']
          }).then(() => {
            pendingCandidates.value = pendingCandidates.value.filter((item) => {
              if (item['id'] === data['sender']) {
                peer.addIceCandidate(item['candidate'])
                    .catch(error => console.error("添加 ICE 候选者时出错:", error));
                return false
              }
              return true
            })
          })
        }
        break
      case 'answer':
        peer = getPeer(data['sender'])
        if (peer.signalingState === "have-local-offer") {
          await peer.setRemoteDescription(new RTCSessionDescription({
            type: 'answer',
            sdp: data['message']
          })).then(() => {
            pendingCandidates.value = pendingCandidates.value.filter(async (item) => {
              if (item['id'] === data['sender']) {
                await peer.addIceCandidate(item['candidate'])
                    .catch(error => console.error("添加 ICE 候选者时出错:", error));
                return false
              }
              return true
            })
          })
        }
        break
      case "candidate":
        // 对方发送的 ICE 候选者
        if (data['message']) {
          peer = getPeer(data['sender'])
          const jsonObject = JSON.parse(data['message']);
          if (peer.remoteDescription && peer.remoteDescription.type) {
            // 添加 ICE 候选者
            await peer.addIceCandidate(new RTCIceCandidate(jsonObject))
                .catch(error => console.error("添加 ICE 候选者时出错:", error));
          } else {
            pendingCandidates.value.push({id: data['sender'], candidateId: new RTCIceCandidate(jsonObject)});
          }
        }
        break
    }
  }
}

const firstJoinSendOffer = async () => {
  for (const item of Object.keys(peerConnectionList.value)) {
    if (userEvent.userInfo.ID !== item) {
      await createOfferToSend(userEvent.userInfo.ID, item)
    }
  }
}

// 创建peer
const createPeer = () => {
  return new RTCPeerConnection(configuration)
}

// 获取peer
const getPeer = (userId) => {
  try {
    return peerConnectionList.value[userId]['peer']
  } catch (error) {
    return null
  }
}

const ontrack = async (event) => {
  await nextTick(() => {
    Object.keys(peerConnectionList.value).forEach((el) => {
      if (peerConnectionList.value[el]['streamId'] === event.streams[0].id) {
        peerConnectionList.value[el]['stream'] = event.streams[0]
        const videoElement = document.querySelector(`.video-container-player-${el}`);
        if (videoElement) {
          videoElement.srcObject = peerConnectionList.value[el]["stream"];
          videoElement.onloadedmetadata = () => {
            videoElement.play();
          };
        } else {
          console.error('未找到对应的 <video> 元素');
        }
      }
    })
  })
}

const oniceconnectionstatechange = (peer, userId) => {
  console.log("ICE 状态:", peer.iceConnectionState);
  if (peer.iceConnectionState === "failed" || peer.iceConnectionState === 'disconnected') {
    console.warn("ICE 连接失败，可能需要重新尝试连接");
    resetConnect(userId)
  }
}

const onsignalingstatechange = (peerConnection) => {
  console.log('onsignalingstatechange')
  if (peerConnection.signalingState === "stable") {
    resetEle()
  }
}

const onicecandidate = (event, userId) => {
  if (event.candidate) {
    let params = {
      candidate: event.candidate.candidate,
      sdpMid: event.candidate.sdpMid,
      sdpMLineIndex: event.candidate.sdpMLineIndex,
    }
    let paramsMap = {
      type: "candidate",
      message: JSON.stringify(params),
      description: "candidate",
      sender: userEvent.userInfo.ID,
      receiver: userId
    }
    socketStore.sendAny(paramsMap);
  }
}

// 重连发起之后，初始化peer（销毁重建）
const initializePeer = async (userId, receiverId, currentUserId) => {
  //重建sender 的peer
  let peer = createPeer()
  // 赋值给sender 的map中
  getPeer(receiverId).close()
  updatePeer(receiverId, "", peer, '')
  let offer = await peer.createOffer()
  await peer.setLocalDescription({
    type: 'offer',
    sdp: offer.sdp
  })

  screenStream.value?.getTracks().forEach((track) => {
    peer.addTrack(track, screenStream.value)
  })

  if (userEvent.userInfo.ID === userId) {
    updatePeer(userId, '', '', screenStream.value)
  }

  peer.onicecandidate = (e) => {
    onicecandidate(e, userId)
  }

  peer.ontrack = ontrack
  peer.oniceconnectionstatechange = oniceconnectionstatechange(peer, userId)
  peer.onsignalingstatechange = onsignalingstatechange(peer)
  let paramsMap = {
    type: "offer",
    message: offer.sdp,
    description: "reconnect",
    sender: currentUserId,
    receiver: receiverId,
  }
  socketStore.sendAny(paramsMap);
}


// 接收到description为reconnect的字段
const receiverOfferHandler = async (userId, offer) => {
  getPeer(userId).close()
  //重建sender 的peer
  let peer = createPeer()
  updatePeer(userId, "", peer, '')
  await setRemoteOfferAndSendAnswer(userId, offer).then(() => {
    pendingCandidates.value = pendingCandidates.value.filter((item) => {
      if (item['id'] === userId) {
        peer.addIceCandidate(item['candidate'])
            .catch(error => console.error("添加 ICE 候选者时出错:", error));
        return false
      }
      return true
    })
  })
}


// 添加peer
const setPeer = (userId, data) => {
  peerConnectionList.value[userId] = data
}
// 更新peer
const updatePeer = (userId, streamId, peer, stream) => {
  let m = {}
  if (streamId) {
    m['streamId'] = streamId
  }
  if (peer) {
    m['peer'] = peer
  }
  if (stream) {
    m['stream'] = stream
  }
  peerConnectionList.value[userId] = {
    ...peerConnectionList.value[userId],
    ...m
  }
}

// 添加远端offer
const setRemoteOfferAndSendAnswer = async (userId, offer) => {
  return new Promise(async (resolve) => {
    let peer = getPeer(userId)
    await peer.setRemoteDescription(offer)
    let answer = await peer.createAnswer()
    await peer.setLocalDescription(answer)
    let params = {
      type: "answer",
      message: answer.sdp,
      description: "answer",
      sender: userEvent.userInfo.ID,
      receiver: userId
    }
    socketStore.sendAny(params)
    resolve()
  })
}

// 生成offer 发送远端
const createOfferToSend = async (userId, toId) => {
  let peer = getPeer(toId)
  let offer = await peer.createOffer()
  await peer.setLocalDescription({
    type: 'offer',
    sdp: offer.sdp
  })
  console.log("success setLocalDescription")
  let params = {
    type: "offer",
    message: offer.sdp,
    description: "offer",
    sender: userId,
    receiver: toId,
  }

  socketStore.sendAny(params);
}


const initMediaSource = async () => {
  if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
    // 支持屏幕共享
    try {
      // 使用 getDisplayMedia 获取桌面流
      screenStream.value = await navigator.mediaDevices.getDisplayMedia({
        video: true, // 获取视频流，如果只需要音频可以设置为 false
        audio: false  // 获取音频流，如果不需要可以设置为 false
      });
      console.log("current mediaDevicesId:", screenStream.value.id)
      return screenStream.value.id
    } catch (error) {
      console.error('Error accessing display media:', error);
    }
  } else {
    console.error('浏览器不支持屏幕共享');
  }


}

const copyUserId = () => {
  navigator.clipboard.writeText(userEvent.userInfo.ID)
  ElMessage.success("复制成功")
}

const copyRoomId = (data) => {
  navigator.clipboard.writeText(data)
  ElMessage.success("复制成功")
}
</script>

<style scoped lang="scss">
.voiceClass-container {
  width: 100%;
  height: 100%;
  display: flex;
  box-sizing: border-box;

  .friend-container {
    width: 200px;
    height: 100%;
  }

  .left-container {
    box-sizing: border-box;
    border-right: 1px solid white;
    height: 100%;

    .classify {
      height: calc(100% - 56px);
      width: 100%;
    }

    .title {
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid white;
      border-top-left-radius: 20px;
      color: white;
      box-sizing: border-box;
    }
  }

  .video-container {
    display: flex;
    padding: 15px;
    box-sizing: border-box;
    flex-wrap: wrap;
    justify-content: space-around;

    ul {
      display: flex;
      flex-wrap: wrap;
    }
  }
}

.roomItem {
  .item {
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    border-radius: 3px;
    padding-left: 20px;
    box-sizing: border-box;
  }

  .item:hover {
    background: #525253;
  }
}
</style>

<style>
.voiceClass-container {
  .el-tree {
    background: transparent !important;
    color: white !important;
  }

  .el-tree-node__content:hover {
    background: transparent !important;
  }


  .el-collapse-item__content {
    padding-bottom: 10px !important;
  }

  .el-tree-node:focus > .el-tree-node__content {
    background: transparent !important;
  }

  .el-card {
    background-color: rgb(37, 39, 42);
    border-color: rgb(53, 53, 53);
  }

  .el-collapse {
    background: transparent;
    color: white;
    border-top: none;
    --el-collapse-border-color: none;

    .el-collapse-item {
      box-sizing: border-box;
      width: 80%;
      margin: 0 auto;

      .el-collapse-item__wrap {
        background-color: transparent;
        color: white;
        border-bottom: none;
      }

      .el-collapse-item__header {
        background-color: transparent !important;
        color: white;
        border-bottom: none;
      }

      .el-collapse-item__content {
        background-color: transparent !important;
        color: white;
        border-bottom: none;
        padding-bottom: 0;
      }
    }
  }
}

</style>

