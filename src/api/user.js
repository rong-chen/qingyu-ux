import api from "@/utils/request.js";

/**
 * {
 *   "username":"rong.chen2",
 *   "password":"rong.chen2"
 * }
 * @param data
 * @returns {*}
 * @constructor
 */
export const Login = (data) => {
    return api({
        method: "POST",
        url: "/user/login",
        data
    })
}
/**
 * @returns {*}
 * @constructor
 */
export const GetUserInfo = async () => {
    return api({
        method: "GET",
        url: `/user/info`,
    })
}
