import axios from 'axios';

const API_BASE_URL = process.env.VITE_API_URL || '/api';

export const normeAPI = {
  getNormeById: async (id: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/normes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching norme:', error);
      throw error;
    }
  },
  
  // Add other norme-related API calls here as needed
  getAllNormes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/normes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching normes:', error);
      throw error;
    }
  },
  
  createNorme: async (normeData: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/normes`, normeData);
      return response.data;
    } catch (error) {
      console.error('Error creating norme:', error);
      throw error;
    }
  },
  
  updateNorme: async (id: string, normeData: any) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/normes/${id}`, normeData);
      return response.data;
    } catch (error) {
      console.error('Error updating norme:', error);
      throw error;
    }
  },
  
  deleteNorme: async (id: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/normes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting norme:', error);
      throw error;
    }
  }
};

export default normeAPI;
