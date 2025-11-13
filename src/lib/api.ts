// lib/api.js
// Use relative URL since frontend and backend are on same domain through Nginx
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function getProducts() {
    try {
        const response = await fetch(`${API_URL}/products`, {
        cache: 'no-store', // Always fetch fresh data
        });
        
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

export async function getProduct(id) {
    try {
        const response = await fetch(`${API_URL}/products/${id}`);
        
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
  }
}