import api from "@/utils/request.js";

export const getChatList =()=>{
    return api({
        url: '/chat/list',
        method: 'get'
    })
}