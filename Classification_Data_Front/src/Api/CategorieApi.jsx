import axiosInstance from "../Axios/AxioConfig"; // your axios instance (with baseURL etc.)
import Cookies from "js-cookie";

const getToken = () => Cookies.get("token");

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
});

// Add a new category
export const AjoutCategorie = async (data) => {
  try {
    const response = await axiosInstance.post("/addCategorie/", data, authHeader());
    return response;
  } catch (error) {
    console.error("Error adding category:", error.response?.data);
    throw error;
  }
};

// Get all categories
export const GetCategories = async () => {
  try {
    const response = await axiosInstance.get("/listCategories/", authHeader());
    console.log(response)
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error.response?.data);
    throw error;
  }
};

// Delete a category
export const DeleteCategorie = async (categorie_id) => {
  try {
    const response = await axiosInstance.delete(`/SupprimerCategorie/${categorie_id}`, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error.response?.data);
    throw error;
  }
};

// Edit a category
export const EditCategorie = async (categorie_id, updatedData) => {
  try {
    const response = await axiosInstance.put(`/categorie/${categorie_id}`, updatedData, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error.response?.data);
    throw error;
  }
};

// Search categories (by name or keyword maybe)
export const SearchCategories = async (searchQuery) => {
  try {
    const response = await axiosInstance.get(`/Categorie/search?query=${searchQuery}`, authHeader());
    return response.data;
  } catch (error) {
    console.error("Error searching categories:", error.response?.data);
    throw error;
  }
};

// Get statistics about categories
export const statistique_categorie = async () => {
  try {
    const response = await axiosInstance.get("/Categorie/statistique", authHeader());
    console.log(response)
    return response.data;
  } catch (error) {
    console.error("Error fetching category statistics:", error.response?.data);
    throw error;
  }
};
export const Classification = async (document_id) => {
  try {
    const response = await axiosInstance.post(`/Classification/${document_id}`,
      {},
      authHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error adding category:", error.response?.data);
    throw error;
  }
};