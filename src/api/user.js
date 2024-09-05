import api from "@/utils/request.js";

export const Login = (data) => {
    return api({
        method: "POST",
        url: "/users/login",
        data
    })
}
