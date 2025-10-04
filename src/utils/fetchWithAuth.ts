export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    throw new Error("No authentication token found");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  // Only set Content-Type automatically when we actually send a body (POST/PUT/PATCH)
  const method = (options.method || 'GET').toUpperCase();
  const hasBody = !!options.body;
  const isFormData = options.body instanceof FormData;
  if (hasBody && !isFormData && !headers.has("Content-Type") && ['POST','PUT','PATCH','DELETE'].includes(method)) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Accept")) {
  headers.set("Accept", "application/json");
}

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/";
    throw new Error("Unauthorized - redirected to login");
  }

  return response;
}
