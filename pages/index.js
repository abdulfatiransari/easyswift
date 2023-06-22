"use client";
import { Inter } from "next/font/google";
import Image from "next/image";
import { BiMoney } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { FaLock } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import Logo from "../public/images/logo.jpg";
import ContractHelper from "../contract/ContractHelper";
import ContractABI from "../contract/ContractABI.json";
import { useEffect, useState } from "react";
import { getWeb3Instance } from "@/contract/Web3Instance";
import Web3, { providers, utils } from "web3";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [contractBalance, setContractBalance] = useState();
  const [ownerFee, setOwnerFee] = useState();
  const [contractStatus, setContractStatus] = useState();
  const [wallet, setWallet] = useState("");
  const [count, setCount] = useState(0);
  const [interval, setInterval2] = useState(true);
  const [value, setValue] = useState({
    amount: 0,
    reciever: "",
    pass1: "",
    pass2: "",
  });
  const [value1, setValue1] = useState({
    amount: 0,
    reciever: "",
    pass1: "",
    pass2: "",
  });
  const [userDetails, setUserDetails] = useState([]);
  const [userWithdraw, setUserWithdraw] = useState([]);
  const [selected, setSelected] = useState();
  const [popup, setPopup] = useState(false);

  const MAINNET_ID = 11155111;
  const contractAddress = "0x65F7b35338c6D7771EBB69a0009335751b32fd59";

  const initContract = async (
    contractAbi,
    contractAddress,
    networkId = MAINNET_ID
  ) => {
    try {
      const web3 = await getWeb3Instance(networkId);
      const contract = new web3.eth.Contract(contractAbi, contractAddress);
      return { web3, contract };
    } catch (error) {
      throw error;
    }
  };

  const getWallet = () => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((res) => {
          const wallet = res.length > 0 && String(res[0]);
          wallet && setWallet(wallet);
          // setContext({ ...context, wallet });
        })
        .catch((err) => {
          console.error(err.message);
          return "";
        });
    } else {
      alert("install metamask extension!!");
      return "";
    }
    // setIsModal(false);
  };

  const contract_Balance = async () => {
    const { web3, contract } = await initContract(ContractABI, contractAddress);
    const balance = await web3.eth.getBalance(contractAddress);
    const newBalance = Web3.utils.fromWei(Number(balance), "ether");
    setContractBalance(newBalance);
  };

  const ownerFees = async () => {
    const { web3, contract } = await initContract(ContractABI, contractAddress);
    const owner_fees = await contract.methods.ownerFee().call();
    setOwnerFee(owner_fees);
  };

  const status = async () => {
    const { web3, contract } = await initContract(ContractABI, contractAddress);
    const status = await contract.methods.stopped().call();
    setContractStatus(status);
  };

  const createLockBox = async () => {
    const { web3, contract } = await initContract(ContractABI, contractAddress);
    const stringtobyte = web3.utils.asciiToHex(value.pass1).padEnd(66, "0");
    const stringtobyte1 = web3.utils.asciiToHex(value.pass2).padEnd(66, "0");
    const sendAmount = await contract.methods
      .createLockBox(value.reciever, stringtobyte, stringtobyte1)
      .send({ from: wallet, value: value.amount });
    console.log(sendAmount);
  };

  const claimFunds = async (index, receiver) => {
    const { web3, contract } = await initContract(ContractABI, contractAddress);
    if (wallet.toLowerCase() === receiver.toLowerCase()) {
      const stringtobyte = web3.utils.asciiToHex(value1.pass1).padEnd(66, "0");
      const stringtobyte1 = web3.utils.asciiToHex(value1.pass2).padEnd(66, "0");
      const lockboxkey = await contract.methods
        .getLockBoxKeyAtIndex(Number(index))
        .call();
      const sendAmount = await contract.methods
        .claimFunds(stringtobyte, stringtobyte1, lockboxkey)
        .send({ from: wallet });
      console.log(sendAmount);
    }
  };

  const reclaimFunds = async (index, creator) => {
    const { web3, contract } = await initContract(ContractABI, contractAddress);
    if (wallet.toLowerCase() === creator.toLowerCase()) {
      const lockboxkey = await contract.methods
        .getLockBoxKeyAtIndex(Number(index))
        .call();
      console.log(lockboxkey);
      const reclaimAmount = await contract.methods
        .reclaimFunds(lockboxkey)
        .send({ from: wallet });
      console.log(reclaimAmount);
    }
  };

  const userData = async () => {
    setInterval2(false);
    const { web3, contract } = await initContract(ContractABI, contractAddress);
    try {
      const lockboxkey = await contract.methods
        .getLockBoxKeyAtIndex(count)
        .call()
        .catch(() => {});
      const data = await contract.methods
        .getLockBox(lockboxkey)
        .call()
        .catch(() => {});
      let arr = [...userDetails, data];
      setUserDetails(
        arr.filter((obj, index) => {
          return (
            index === arr.findIndex((o) => obj.creationTime === o.creationTime)
          );
        })
      );
      setCount((pre) => pre + 1);
      setInterval2(true);
    } catch (error) {
      setCount(0);
    }
  };

  const withdraw = async () => {
    const { web3, contract } = await initContract(ContractABI, contractAddress);
    const checkBalance = await contract.methods.getBalance(wallet).call();
    const withdrawAmount = await contract.methods
      .withdraw(Number(checkBalance))
      .send({ from: wallet, value:10 });
    console.log(withdrawAmount);
  };

  const toggle = async () => {
    const { web3, contract } = await initContract(ContractABI, contractAddress);
    const owner = await contract.methods.owner().call();
    if (wallet.toLowerCase() === owner.toLowerCase()) {
      const toggle = await contract.methods
        .toggleContractActive()
        .send({ from: wallet });
      console.log("success");
    } else {
      return "Only owner access";
    }
  };

  useEffect(() => {
    contract_Balance();
    ownerFees();
    status();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (interval) {
      const newInterval = setInterval(() => {
        userData();
      }, 300);
      return () => {
        clearInterval(newInterval);
      };
    }
    //eslint-disable-next-line
  }, [interval]);

  return (
    <>
      <div className="px-[20px]">
        {/* navbar */}
        <div className="flex items-center bg-[#222] border border-[#080808] rounded-[4px] mb-[20px] min-h-[50px] justify-between px-[15px] py-[10px]">
          <div className="flex items-center gap-x-[5px]">
            <Image src={Logo} width={20} height={20} alt="" />
            <p className="text-[#FFFFFF]">Remittance</p>
          </div>
          <div className="flex gap-x-1">
            <button
              className="bg-[#d9534f] py-[6px] px-[12px] rounded-[4px] text-[#FFFFFF] text-[14px]"
              onClick={toggle}
            >
              Emergency Contract Stop
            </button>
            <button
              className="bg-[#5cb85c] py-[6px] px-[12px] rounded-[4px] text-[#FFFFFF] text-[14px]"
              onClick={toggle}
            >
              Reactivate Contract
            </button>
            <button className="bg-[#f0ad4e] py-[6px] px-[12px] rounded-[4px] text-[#FFFFFF] text-[14px]">
              Recover Funds
            </button>
          </div>
          <div>
            {wallet === "" ? (
              <button className="text-[#FFFFFF]" onClick={getWallet}>
                Connect Wallet
              </button>
            ) : (
              <p className="text-[#FFFFFF]">Connected</p>
            )}
          </div>
        </div>

        {/* contract details */}
        <div className="flex justify-between">
          <div className="flex p-[15px] border border-[#ddd] min-w-[218px] rounded-[4px]">
            <div className="flex flex-col">
              <p className="text-[14px] my-[10px]">Contract Balance</p>
              <p className="text-[36px] mt-[20px] mb-[10px]">
                {`${contractBalance}` || "0"} ETH
              </p>
            </div>
          </div>
          <div className="flex p-[15px] border border-[#ddd] min-w-[218px] rounded-[4px]">
            <div className="flex flex-col">
              <p className="text-[14px] my-[10px]">OwnerFees</p>
              <p className="text-[36px] mt-[20px] mb-[10px]">
                {`${ownerFee}`} Wei
              </p>
            </div>
          </div>
          <div className="flex p-[15px] border border-[#ddd] min-w-[218px] rounded-[4px]">
            <div className="flex flex-col">
              <p className="text-[14px] my-[10px]">Contract Status</p>
              <p className="text-[36px] mt-[20px] mb-[10px]">{`${
                !contractStatus ? "Active" : "Nonactive"
              }`}</p>
            </div>
          </div>
        </div>

        {/* create lock box */}
        <div className="flex flex-col gap-y-2 mt-[20px]">
          <div className="flex items-center rounded-[4px]">
            <div className="bg-[#eee] px-[16px] py-[10px] h-full border border-[#ccc] rounded-[4px]">
              <BiMoney size={14} color="#555" />
            </div>
            <div className="flex border border-[#ccc] px-[16px] py-[10px] w-full">
              <input
                placeholder="Lockbox amount"
                value={value.amount}
                onChange={(event) =>
                  setValue({ ...value, amount: event.target.value })
                }
              />
            </div>
          </div>
          <div className="flex items-center rounded-[4px]">
            <div className="bg-[#eee] px-[16px] py-[10px] h-full border border-[#ccc] rounded-[4px]">
              <CgProfile size={14} color="#555" />
            </div>
            <div className="flex border border-[#ccc] px-[16px] py-[10px] w-full">
              <input
                placeholder="Sender Address"
                className="w-full"
                disabled
                value={`${wallet}`}
              />
            </div>
          </div>
          <div className="flex items-center rounded-[4px]">
            <div className="bg-[#eee] px-[16px] py-[10px] h-full border border-[#ccc] rounded-[4px]">
              <CgProfile size={14} color="#555" />
            </div>
            <div className="flex border border-[#ccc] px-[16px] py-[10px] w-full">
              <input
                placeholder="0x"
                value={value.reciever}
                onChange={(event) =>
                  setValue({ ...value, reciever: event.target.value })
                }
              />
            </div>
          </div>
          <div className="flex items-center rounded-[4px]">
            <div className="bg-[#eee] px-[16px] py-[10px] h-full border border-[#ccc] rounded-[4px]">
              <FaLock size={14} color="#555" />
            </div>
            <div className="flex border border-[#ccc] px-[16px] py-[10px] w-full">
              <input
                placeholder="Password1"
                type="password"
                value={value.pass1}
                onChange={(event) =>
                  setValue({ ...value, pass1: event.target.value })
                }
              />
            </div>
          </div>
          <div className="flex items-center rounded-[4px]">
            <div className="bg-[#eee] px-[16px] py-[10px] h-full border border-[#ccc] rounded-[4px]">
              <FaLock size={14} color="#555" />
            </div>
            <div className="flex border border-[#ccc] px-[16px] py-[10px] w-full">
              <input
                placeholder="Password2"
                type="password"
                value={value.pass2}
                onChange={(event) =>
                  setValue({ ...value, pass2: event.target.value })
                }
              />
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={createLockBox}
              className="px-[16px] py-[10px] bg-[#ddd] rounded-[6px] text-[18px]"
            >
              Create
            </button>
          </div>
        </div>

        {/* creater table */}
        <div>
          <table className="table">
            <thead>
              <tr>
                <th>Creator</th>
                <th>Beneficiary</th>
                <th>
                  Amount <span className="unit">(Wei)</span>
                </th>
                <th>Claim Deadline</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {userDetails.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <h4>
                      {`${item.creator.slice(0, 8)}...${String(
                        item.creator
                      ).slice(-5)}`}
                      <span></span>
                    </h4>
                  </td>
                  <td>
                    <h4>
                      {`${item.receiver.slice(0, 8)}...${String(
                        item.receiver
                      ).slice(-5)}`}
                      <span></span>
                    </h4>
                  </td>
                  <td>{Number(item.amount)}</td>
                  <td>{`${item.active}`}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(item);
                        setPopup(true);
                      }}
                    >
                      Claim
                    </button>
                    <button
                      onClick={() => reclaimFunds(item.index, item.creator)}
                    >
                      Sender reclaim
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
          {/* popup */}
          {popup && (
            <div className="flex w-screen justify-center absolute top-20">
              <div className="flex flex-col bg-[#ddd] rounded-[20px] gap-y-2 min-w-[400px] p-5 ">
                <div className="flex justify-between">
                  <p>Claim Lockbox Funds</p>
                  <RxCross2 onClick={() => {setSelected(undefined); setPopup(false)}} />
                </div>
                <div className="flex gap-x-2 items-center">
                  <p>ETH</p>
                  <p>{selected ? Number(selected.amount) : "0"}</p>
                </div>
                <div className="flex gap-x-2 items-center">
                  <CgProfile />
                  <p>Sender</p>
                  <p>{selected ? selected.creator : "Sender Address"}</p>
                </div>
                <div className="flex gap-x-2 items-center">
                  <CgProfile />
                  <p>Receiver</p>
                  <p>{selected ? selected.receiver : "Receiver Address"}</p>
                </div>
                <div className="flex gap-x-2 items-center">
                  <FaLock />
                  <input
                    placeholder="Password 1"
                    type="password"
                    value={value1.pass1}
                    onChange={(event) =>
                      setValue1({ ...value1, pass1: event.target.value })
                    }
                  />
                </div>
                <div className="flex gap-x-2 items-center">
                  <FaLock />
                  <input
                    placeholder="Password 2"
                    type="password"
                    value={value1.pass2}
                    onChange={(event) =>
                      setValue1({ ...value1, pass2: event.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <button onClick={() => {claimFunds(selected.index, selected.receiver); setPopup(false)}}>Go</button>
                </div>
              </div>
            </div>
          )}

        {/* widthdraw table */}
        <div className="row">
          <table className="table table-condensed table-hover">
            <thead>
              <tr>
                <th>Address</th>
                <th>
                  Contract Balance <span>(Wei)</span>
                </th>
                <th>
                  Account Balance <span>(ETH)</span>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <h4>
                    <span></span>
                  </h4>
                </td>
                <td></td>
                <td></td>
                <td>
                  <button type="button">Withdraw</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
