import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// Tạo một instance Axios
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8081/', // Đổi URL backend của bạn
    headers: {
        'Content-Type': 'application/json',
    },
});

// Hàm POST để gửi request
export const post = async (url: string, data: any, config: AxiosRequestConfig = {}): Promise<AxiosResponse> => {
    const response = await axiosInstance.post(url, data, config);
    return response; // Trả về dữ liệu từ server
};
