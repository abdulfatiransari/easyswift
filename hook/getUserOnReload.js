import { auth } from "@/utils/firebase";

export default async function getUserOnReload(setWallet) {
    try {
        auth.onAuthStateChanged(async (user) => {
            if (user !== null) {
                setWallet(user)
            }
        })
    } catch (error) {
        return error.message;
    }
}