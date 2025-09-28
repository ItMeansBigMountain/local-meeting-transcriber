import api from "./api";
import { Storage } from "../utils/storage";

export async function login(email: string, password: string) {
    const { data } = await api.post("/api/auth/login", { email, password });
    await Storage.setItem("jwt", data.token);
}

export async function register(email: string, password: string) {
    await api.post("/api/auth/register", { email, password });
}
export async function logout() { await Storage.deleteItemAsync("jwt"); }
