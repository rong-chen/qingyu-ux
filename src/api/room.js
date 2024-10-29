import api from "@/utils/request.js";

export const getCreateRoomList =(params)=>{
    return api({
        url: '/room/list',
        method: 'get',
        params
    })
}
export const getAllRoomList =(params)=>{
    return api({
        url:'/room/all-list',
        method: 'get',
        params
    })
}

export const createRoom =(data)=>{
    return api({
        url: '/room/list',
        method: 'post',
        data
    })
}

export const joinRoom = (data) => {
    return api({
        method: "POST",
        url: `/room/join`,
        data
    })
}

export const collectRoom = (data) => {
    return api({
        method: "POST",
        url: `/room/collect`,
        data
    })
}

export const getCollectRoomList = () => {
    return api({
        method: "GET",
        url: `/room/collect`,
    })
}
