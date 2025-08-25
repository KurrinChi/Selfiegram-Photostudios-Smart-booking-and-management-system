export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  // No token at all
  if (!token) {
    window.location.href = "/login"; // force redirect
    throw new Error("No authentication token found");
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If token expired or user not logged in
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login"; // force redirect
    throw new Error("Unauthorized - redirected to login");
  }

  return response;
}
