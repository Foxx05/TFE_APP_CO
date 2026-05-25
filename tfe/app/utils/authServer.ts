const API_URL = "https://theocolpaert.be/projets/tfe_app/backend";

export async function loginUser(username: string, password: string) {
  const response = await fetch(`${API_URL}/login.php`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  return response.json();
}

export async function registerUser(
  username: string,
  email: string,
  password: string
) {
  const response = await fetch(`${API_URL}/register.php`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });

  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/me.php`, {
    credentials: "include",
  });

  return response.json();
}

export async function logoutUser() {
  const response = await fetch(`${API_URL}/logout.php`, {
    credentials: "include",
  });

  return response.json();
}

export async function forgotPassword(email: string) {
  const response = await fetch(`${API_URL}/forgot_password.php`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  return response.json();
}

export async function resetPassword(token: string, password: string) {
  const response = await fetch(`${API_URL}/reset_password.php`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, password }),
  });

  return response.json();
}

export async function getUserGreenhouses() {
  const response = await fetch(
    `${import.meta.env.BASE_URL}backend/get_greenhouses.php`,
    {
      method: "GET",
      credentials: "include"
    }
  );

  return await response.json();
}