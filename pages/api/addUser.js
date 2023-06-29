import { db } from "@/utils/firebase";
import { collection, addDoc } from "firebase/firestore";


export default async function handler(req, res) {
    try {
      const docRef = await addDoc(collection(db, "userDetails"),JSON.parse(req.body));
      console.log("Document written with ID:", docRef.id);
      res.status(200).send("done");
    } catch (e) {
      console.error("Error adding document:", e);
    }
    
  }