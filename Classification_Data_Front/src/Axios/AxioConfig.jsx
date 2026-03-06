import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://lvttam.mg/api/",
});

export default axiosInstance;
