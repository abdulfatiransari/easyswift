import { db } from "@/utils/firebase";
import { collection, getDocs } from "firebase/firestore"; 

const querySnapshot = await getDocs(collection(db, "userDetails"));
export default function handler(req, res) {
    res.status(200).json(querySnapshot.docs.map(i => ({...i.data(),id:i.id})))
  }