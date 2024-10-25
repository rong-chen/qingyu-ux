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
import {exitRoom, getCollectRoomList, getCreateRoomList, joinRoom} from "@/api/room.js";
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
  if (lastRoomId.value) {
    await exitRoom(
        {
          "id": userEvent.userInfo.ID,
          "roomId": lastRoomId.value
        }
    )
  }
  await initMediaSource();
  const res = await joinRoom({
    "id": userEvent.userInfo.ID,
    "roomId": ID,
    "mediaStreamId": screenStream.value.id
  })
  if (res['code'] === 0) {
    ElMessage.success("加入房间成功")
    lastRoomId.value = ID
  }
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

  const exitRoomFunc = () => {
    let paramsMap = {
      type: "room_notify_exit",
      message: "",
      description: "用户退出",
      sender: userEvent.userInfo.ID,
      roomId: lastRoomId.value,
    }
    socketStore.sendAny(paramsMap);
  }

  window.addEventListener('beforeunload', () => {
    if (lastRoomId.value) {
      exitRoomFunc()
    }
  });
})

//
// onBeforeUnmount(() => {
//   if (lastRoomId.value) {
//     exitRoom(
//         {
//           "id": userEvent.userInfo.ID,
//           "roomId": lastRoomId.value
//         }
//     )
//   }
// })

const socketStore = useSocketStore()
const ListenSocketMessage = () => {
  socketStore.addWebSocketCallBack(socketMessage)
}

let isInit = ref(false)
const socketMessage = async (data) => {
  if (data['type'] === 'room_notify') {
    if (data.description === '新用户加入') {
      let userIdList = data['roomInfo']['onlineUser']
      if (userIdList && userIdList.length > 0) {
        for (const item of userIdList) {
          if (!peerConnectionList.value[item['userId']]) {
            let peer = new RTCPeerConnection(configuration)
            peerConnectionList.value[item['userId']] = {
              peer: peer,
              stream: null,
              streamId: item['streamId']
            }
            screenStream.value.getTracks().forEach((track) => {
              peerConnectionList.value[item['userId']]['peer'].addTrack(track, screenStream.value)
            })
            if (userEvent.userInfo.ID === item['userId']) {
              peerConnectionList.value[item['userId']]['stream'] = screenStream.value
            }

            peer.onicecandidate = (event) => {
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
                  roomId: data['roomId'],
                }
                socketStore.sendAny(paramsMap);
              }
            }

            peer.oniceconnectionstatechange = () => {
              console.log('ICE 状态:', peer.iceConnectionState);
            };
            peer.ontrack = (event) => {
              // 接收到流之后处理

              Object.keys(peerConnectionList.value).forEach((el) => {
                if (peerConnectionList.value[el]['streamId'] === event.streams[0].id) {
                  console.log('流id' + event.streams[0].id)
                  console.log('用户id' + el)
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
            }
          }
        }

        if (!isInit.value) {
          for (const item of Object.keys(peerConnectionList.value)) {
            if (userEvent.userInfo.ID !== item) {
              let peer = peerConnectionList.value[userEvent.userInfo.ID]['peer'];
              let offer = await peer.createOffer()
              await peer.setLocalDescription({
                type: 'offer',
                sdp: offer.sdp
              })
              let paramsMap = {
                type: "offer",
                message: offer.sdp,
                description: "offer",
                sender: userEvent.userInfo.ID,
                receiver: item,
              }
              socketStore.sendAny(paramsMap);
            }
          }
        }
        isInit.value = true
      }
    } else if (data.description === '用户离开') {
      let userIdList = data['roomInfo']['onlineUser']
      if (userIdList && userIdList.length) {
        let maps = {}
        userIdList.forEach(item => {
          maps[item['userId']] = peerConnectionList.value[item['userId']]
        })
        peerConnectionList.value = maps;
        console.log(peerConnectionList.value)
      } else {
        peerConnectionList.value = {};
      }
      await resetEle()
    }
  }
  if (['offer', 'answer', 'candidate'].includes(data['type'])) {
    switch (data['type']) {
      case 'offer':
        await peerConnectionList.value[data['sender']]['peer']?.setRemoteDescription({
          type: "offer",
          sdp: data['message']
        })
        let answer = await peerConnectionList.value[data['sender']]['peer']?.createAnswer()
        await peerConnectionList.value[data['sender']]['peer']?.setLocalDescription(answer)
        let params = {
          type: "answer",
          message: answer.sdp,
          description: "answer",
          sender: data['receiver'],
          receiver: data['sender']
        }
        socketStore.sendAny(params)
        break
      case 'answer':
        await peerConnectionList.value[data['receiver']]['peer']?.setRemoteDescription(new RTCSessionDescription({
          type: 'answer',
          sdp: data['message']
        }));
        break
      case "candidate":
        // 对方发送的 ICE 候选者
        if (data['message']) {
          let peerConnection = peerConnectionList.value[data['sender']]['peer']
          if (peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
            const jsonObject = JSON.parse(data['message']);
            // 添加 ICE 候选者
            peerConnection.addIceCandidate(new RTCIceCandidate(jsonObject))
                .catch(error => console.error("添加 ICE 候选者时出错:", error));
          } else {
            console.warn("还没有设置远端描述，无法添加候选者");
          }
        }
        break
    }
  }
  await resetEle()
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

