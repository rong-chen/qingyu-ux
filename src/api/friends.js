import api from "@/utils/request.js";
import {id} from "element-plus/es/locale/index";

/**
 * 搜索好友
 */
export const FindFriends = (id) => {
    return api({
        method: 'GET',
        url: `/user/${id}`,
    })
}
/**
 *
 * 查询所有的好友
 *
 */
export const SearchAllFriends = () => {
    return api({
        method: 'GET',
        url: `/friendRelationship/list`,
    })
}
/**
 * 添加好友
 */
export const AddApplyFriend = data => {
    return api({
        method: 'POST',
        url: `/friendRelationship/apply`,
        data
    })
}
/**
 *
 * 新增好友分类
 */
export const CreateFriendClass = data => {
    return api({
        method: 'POST',
        url: `/classify/create`,
        data
    })
}
/**
 * 好友分类
 */
export const getClassifyList = () => {
    return api({
        method: "GET",
        url: `/classify/list`,
    })
}
