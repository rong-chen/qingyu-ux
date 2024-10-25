import api from "@/utils/request.js";

export const getCreateRoomList =()=>{
    return api({
        url: '/room/list',
        method: 'get'
    })
}

export const joinRoom = (data) => {
    return api({
        method: "POST",
        url: `/room/join`,
        data
    })
}

export const exitRoom = (data) => {
    return api({
        method: "POST",
        url: `/room/exit`,
        data
    })
}

export const getCollectRoomList = () => {
    return api({
        method: "GET",
        url: `/room/collect`,
    })
}
