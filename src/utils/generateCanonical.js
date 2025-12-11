export const generateCanonical = (baseUrl, path) => {
  if (!path || path === "/") return baseUrl;
  return `${baseUrl}${path}`;
};
