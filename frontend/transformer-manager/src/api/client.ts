import axios from 'axios';


const client = axios.create({
baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
});


client.interceptors.response.use(
(res) => res,
(err) => {
// Centralized error hook – you can expand for auth, etc.
console.error('[API ERROR]', err?.response || err);
return Promise.reject(err);
}
);


export default client;