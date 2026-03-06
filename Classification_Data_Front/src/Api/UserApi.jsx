import axiosInstance from "../Axios/AxioConfig";
export const login = async (formData) => {
  const response = await axiosInstance.post("login/", formData, {
    "content-type": "application/json",
  });

  return response;
};
export const inscription = async (formData) => {

    const response = await axiosInstance.post("createUser/", formData);
    return response;

};
