import { Context, WEB3_Contract } from "@/components/Context";
import { getWeb3Instance } from "@/contract/Web3Instance";
import getUserOnReload from "@/hook/getUserOnReload";
import "@/styles/globals.css";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ContractABI from "../contract/ContractABI.json";

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState("");
  const [users, setUsers] = useState([]);
  const [authorized, setAuthorized] = useState(false);
  const [web3, setWeb3] = useState('');
  const router = useRouter();

  const MAINNET_ID = 80001;
  const contractAddress = "0x6E19Ddbf2fc2fAafD702BdF727E56DfaC1658d9b";

  const initContract = async (
    networkId = MAINNET_ID
  ) => {
    try {
      const web3 = await getWeb3Instance(networkId);
      const contract = new web3.eth.Contract(ContractABI, contractAddress);
      setWeb3({ web3, contract });
    } catch (error) {
      console.log(error);
    }
  };

  const getAllUsers = async () => {
    await fetch("/api/getUsers")
      .then((response) => response.json())
      .then(setUsers);
  };

  useEffect(() => {
    initContract();
    getUserOnReload(setUser);
    getAllUsers();
  }, []);

  useEffect(() => {
    console.log(user)
    if (!user) {
      setAuthorized(false);
      router.push("/SignIn");
    } else {
      setAuthorized(true);
      router.push("/");
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
if(!web3) return;
  return (
    <Context.Provider value={{ user, setUser, setUsers }}>
      <WEB3_Contract.Provider value={{ web3Obj:web3,contractAddress }}>
        <Component {...pageProps} />
      </WEB3_Contract.Provider>
    </Context.Provider>
  );
}
