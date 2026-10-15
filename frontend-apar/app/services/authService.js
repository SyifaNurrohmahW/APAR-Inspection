import API_BASE_URL, { parseApiResponse } from './api';

export const loginUser = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    return await parseApiResponse(response, 'Login gagal');
  } catch (error) {
    if (error?.message === 'Failed to fetch' || error?.name === 'TypeError') {
      throw new Error(`Gagal terhubung ke backend (${API_BASE_URL}). Pastikan backend online dan NEXT_PUBLIC_API_URL diatur ke URL publik Railway.`);
    }
    throw error;
  }
};

export const registerUser = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    return await parseApiResponse(response, 'Registrasi gagal');
  } catch (error) {
    if (error?.message === 'Failed to fetch' || error?.name === 'TypeError') {
      throw new Error(`Gagal terhubung ke backend (${API_BASE_URL}). Pastikan backend online dan NEXT_PUBLIC_API_URL diatur ke URL publik Railway.`);
    }
    throw error;
  }
};

