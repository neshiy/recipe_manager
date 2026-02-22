import axios from "axios";
import { firebaseAuth } from "./firebaseClient";

export const API = axios.create({ baseURL: "http://localhost:5000/api" });

API.interceptors.request.use(async (config) => {
	if (!firebaseAuth) return config;
	const user = firebaseAuth.currentUser;
	if (!user) return config;

	const token = await user.getIdToken();
	config.headers = config.headers || {};
	config.headers.Authorization = `Bearer ${token}`;
	return config;
});