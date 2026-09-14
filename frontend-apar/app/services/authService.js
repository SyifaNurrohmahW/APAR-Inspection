import API_BASE_URL, { parseApiResponse } from './api';

export const loginUser = async (data) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  return parseApiResponse(response, 'Login gagal');
};

export const registerUser = async (data) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  return parseApiResponse(response, 'Registrasi gagal');
};

