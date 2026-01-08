import apiData from "@/data/apiData.json";

const handler = (url) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(apiData[url]);
    }, 3000);
  });
};

const api = {
  get: handler,
  post: handler,
  put: handler,
  delete: handler,
};
export default api;
