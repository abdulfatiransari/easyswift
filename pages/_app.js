import { Context } from "@/components/Context";
import getUserOnReload from "@/hook/getUserOnReload";
import "@/styles/globals.css";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState("");
  const [users, setUsers] = useState([]);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  const getAllUsers = async () => {
    await fetch("/api/getUsers")
      .then((response) => response.json())
      .then(setUsers);
  };

  useEffect(() => {
    getUserOnReload(setUser);
    getAllUsers();
  }, []);

  useEffect(() => {
    if (!user) {
      setAuthorized(false);
      router.replace("/SignIn");
    } else {
      setAuthorized(true);
    }
    //eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    if (authorized && users.length) {
      setUser(
        users.filter((i) => {
          return i.uid === user.uid;
        })[0]
      );
    }
    //eslint-disable-next-line
  }, [authorized, users]);

  return (
    <Context.Provider value={{ user, setUser }}>
      <Component {...pageProps} />
    </Context.Provider>
  );
}
