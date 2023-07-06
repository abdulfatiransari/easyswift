"use client";
import { getAuth, signOut } from "firebase/auth";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { BiMoney, BiTimer } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { FaLock, FaMoneyBillAlt } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import Web3 from "web3";
import Logo from "../public/images/logo.jpg";
import { Context, WEB3_Contract } from "./Context";

const inter = Inter({ subsets: ["latin"] });

export default function LandingPage() {
  const { user, setUser } = useContext(Context);
  const [contractBalance, setContractBalance] = useState();
  const [ownerFee, setOwnerFee] = useState();
  const [owner, setOwner] = useState();
  const [deadline, setDeadline] = useState({
    dead_line: "",
    deadline_Limit: "",
  });
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
  const [value2, setValue2] = useState({
    address: "",
    ownerfee: 0,
    _deadline: 0,
  });

  const { web3Obj, contractAddress } = useContext(WEB3_Contract);
  const [userDetails, setUserDetails] = useState([]);
  const [userWithdraw, setUserWithdraw] = useState([]);
  const [selected, setSelected] = useState();
  const [popup, setPopup] = useState(false);
  const [settting, setSetting] = useState(false);

  const getWallet = () => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((res) => {
          const wallet = res.length > 0 && String(res[0]);
          wallet && setWallet(wallet);
          withdrawData(wallet);
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
    try {
      const { web3 } = web3Obj;
      const balance = await web3.eth.getBalance(contractAddress);
      const newBalance = Web3.utils.fromWei(Number(balance), "ether");
      setContractBalance(newBalance);
    } catch (error) {
      console.log(error);
    }
  };

  const getOwner = async () => {
    try {
      const { contract } = web3Obj;
      const get_Owner = await contract.methods.owner().call();
      setOwner(get_Owner);
    } catch (error) {
      console.log(error);
    }
  };

  const ownerFees = async () => {
    try {
      const { web3, contract } = web3Obj;
      const owner_fees = await contract.methods.ownerFee().call();
      const strtonum = Number(owner_fees);
      const weitoeth = web3.utils.fromWei(strtonum, "ether");
      setOwnerFee(weitoeth);
    } catch (error) {
      console.log(error);
    }
  };

  const status = async () => {
    try {
      const { contract } = web3Obj;
      const status = await contract.methods.stopped().call();
      setContractStatus(status);
    } catch (error) {
      console.log(error);
    }
  };

  const createLockBox = async () => {
    try {
      const { web3, contract } = web3Obj;
      const stringtobyte = web3.utils.asciiToHex(value.pass1).padEnd(66, "0");
      const stringtobyte1 = web3.utils.asciiToHex(value.pass2).padEnd(66, "0");
      const Weitoeth = web3.utils.toWei(value.amount, "ether");
      const sendAmount = await contract.methods
        .createLockBox(value.reciever, stringtobyte, stringtobyte1)
        .send({ from: wallet, value: Weitoeth });
    } catch (error) {
      console.log(error);
    }
  };

  const claimFunds = async (index, receiver) => {
    try {
      const { web3, contract } = web3Obj;
      if (wallet.toLowerCase() === receiver.toLowerCase()) {
        const stringtobyte = web3.utils
          .asciiToHex(value1.pass1)
          .padEnd(66, "0");
        const stringtobyte1 = web3.utils
          .asciiToHex(value1.pass2)
          .padEnd(66, "0");
        const lockboxkey = await contract.methods
          .getLockBoxKeyAtIndex(Number(index))
          .call();
        const sendAmount = await contract.methods
          .claimFunds(stringtobyte, stringtobyte1, lockboxkey)
          .send({ from: wallet });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const reclaimFunds = async (index, creator) => {
    try {
      const { contract } = web3Obj;
      if (wallet.toLowerCase() === creator.toLowerCase()) {
        const lockboxkey = await contract.methods
          .getLockBoxKeyAtIndex(Number(index))
          .call();
        const reclaimAmount = await contract.methods
          .reclaimFunds(lockboxkey)
          .send({ from: wallet });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const userData = async () => {
    setInterval2(false);
    const { contract } = web3Obj;
    try {
      const lockboxkey = await contract.methods
        .getLockBoxKeyAtIndex(count)
        .call()
        .catch(() => {});
      const data = await contract.methods
        .getLockBox(lockboxkey)
        .call()
        .catch(() => {});
      let arr = [...userDetails, data].map((i) => ({
        ...i,
        creationDate: unixToDate(new Date(Number(i.creationTime)).getTime()),
      }));
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
    try {
      const { contract } = web3Obj;
      const checkBalance = await contract.methods.getBalance(wallet).call();
      const withdrawAmount = await contract.methods
        .withdraw(Number(checkBalance))
        .send({ from: wallet });
    } catch (error) {
      console.log(error);
    }
  };

  const withdrawData = async (wallet) => {
    try {
      const { contract } = web3Obj;
      const checkBalance = await contract.methods.getBalance(wallet).call();
      setUserWithdraw((pre) => [...pre, Number(checkBalance)]);
    } catch (error) {
      console.log(error);
    }
  };

  const withdrawfees = async () => {
    try {
      const { contract } = web3Obj;
      if (owner.toLowerCase()) {
        const totalBalance = await contract.methods
          .getCollectedFeeAmount()
          .call({ from: wallet });
        if (totalBalance > 0) {
          const withdraw = await contract.methods
            .withdrawFees()
            .send({ from: wallet });
        } else {
          return "Insufficent Funds";
        }
      } else {
        return "Only Admin can Access";
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggle = async () => {
    try {
      const { contract } = web3Obj;
      const owner = await contract.methods.owner().call();
      if (wallet.toLowerCase() === owner.toLowerCase()) {
        const toggle = await contract.methods
          .toggleContractActive()
          .send({ from: wallet });
      } else {
        return "Only owner access";
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deadline_ = async () => {
    try {
      const { contract } = web3Obj;
      const checkDeadline = await contract.methods.deadline().call();
      const checkDeadlineLimit = await contract.methods.deadlineLimit().call();
      setDeadline({
        dead_line: Number(checkDeadline),
        deadline_Limit: Number(checkDeadlineLimit),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const setNewOwner = async () => {
    try {
      const { contract } = web3Obj;
      const new_owner = await contract.methods
        .setOwner(value2.address)
        .send({ from: wallet });
      setOwner(new_owner);
    } catch (error) {
      console.log(error);
    }
  };

  const set_OwnerFee = async () => {
    try {
      const { web3, contract } = web3Obj;
      const weitoeth = web3.utils.toWei(value2.ownerfee, "wei");
      const _ownerfee = await contract.methods
        .setOwnerFee(weitoeth)
        .send({ from: wallet });
      setOwnerFee(weitoeth);
    } catch (error) {
      console.log(error);
    }
  };

  const set_deadline = async () => {
    try {
      const { contract } = web3Obj;
      const convert = value2._deadline * 86400;
      const set_dead_line = await contract.methods
        .setDeadline(convert)
        .send({ from: wallet });
      setDeadline({ dead_line: value2._deadline });
    } catch (error) {
      console.log(error);
    }
  };

  function unixToDate(date) {
    var time = new Date((date + deadline.dead_line) * 1000),
      month = time.getMonth() + 1,
      day = time.getDate(),
      year = time.getFullYear(),
      res = year + "/" + month + "/" + day;

    return res;
  }

  useEffect(() => {
    contract_Balance();
    ownerFees();
    status();
    getOwner();
    deadline_();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (interval && deadline.dead_line) {
      const newInterval = setInterval(() => {
        userData();
      }, 300);
      return () => {
        clearInterval(newInterval);
      };
    }
    //eslint-disable-next-line
  }, [interval, deadline]);

  const signout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setUser("");
        // Sign-out successful.
      })
      .catch((error) => {
        // An error happened.
      });
  };

  return (
    <>
      <div className="px-[20px]">
        {/* navbar */}
        <div className="flex items-center bg-[#222] border border-[#080808] rounded-[4px] mb-[20px] min-h-[50px] justify-between px-[15px] py-[10px]">
          <div className="flex items-center gap-x-[5px]">
            <Image src={Logo} width={20} height={20} alt="" />
            <p className="text-[#FFFFFF]">Easy Swift</p>
          </div>
          <div className="flex gap-x-1">
            {contractStatus === false ? (
              <button
                className="bg-[#d9534f] py-[6px] px-[12px] rounded-[4px] text-[#FFFFFF] text-[14px]"
                onClick={toggle}
              >
                Emergency Contract Stop
              </button>
            ) : (
              <button
                className="bg-[#5cb85c] py-[6px] px-[12px] rounded-[4px] text-[#FFFFFF] text-[14px]"
                onClick={toggle}
              >
                Reactivate Contract
              </button>
            )}
            <button
              className="bg-[#f0ad4e] py-[6px] px-[12px] rounded-[4px] text-[#FFFFFF] text-[14px]"
              onClick={withdrawfees}
            >
              Recover Funds
            </button>
          </div>
          <div className="flex items-center gap-x-2">
            <div><p className="text-white">{user.displayType || ""}</p></div>
            <div>
              {wallet === "" ? (
                <button className="text-[#FFFFFF]" onClick={getWallet}>
                  Connect Wallet
                </button>
              ) : (
                <p className="text-[#FFFFFF]">Connected</p>
              )}
            </div>
            <div
              className={`cursor-pointer 
              
                // !wallet.toLowerCase()
                //   ? "hidden"
                //   : wallet.toLowerCase() === owner.toLowerCase()
                //   ? "flex"
                //   : "hidden"
                // (wallet === "" && 'hidden') || (wallet.toLowerCase() === owner.toLowerCase() && 'flex')
              
            `}
              onClick={() => setSetting(true)}
            >
              <FiSettings color="#fff" />
            </div>
            <div>
              {user ? (
                <>
                  <div className="flex gap-x-2">
                    <p className="text-white">{user.displayName || ""}</p>{" "}
                    <button className="text-[#fff]" onClick={() => signout()}>
                      Signout
                    </button>
                  </div>
                </>
              ) : (
                <Link href={"SignIn"} className="text-[#fff]">
                  Login
                </Link>
              )}
            </div>
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
                {`${ownerFee}`} ETH
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
                className="w-full outline-none"
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
                className="w-full outline-none"
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
                className="w-full outline-none"
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
                className="w-full outline-none"
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
                className="w-full outline-none"
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
        <div className="w-full mt-5">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Creator</th>
                <th>Beneficiary</th>
                <th>
                  Amount <span className="unit">(ETH)</span>
                </th>
                <th>Claim Deadline</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {userDetails.map((item, idx) => (
                <tr key={idx} className="text-center">
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
                  <td>{Web3.utils.fromWei(item.amount, "ether")}</td>
                  <td>{item.creationDate}</td>
                  {/* {new Date(1687527539)} */}
                  <td>
                    {wallet.toLowerCase() === item.receiver.toLowerCase() && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(item);
                          setPopup(true);
                        }}
                      >
                        Claim
                      </button>
                    )}
                    {wallet.toLowerCase() === item.creator.toLowerCase() &&
                      item.amount && (
                        <button
                          onClick={() => reclaimFunds(item.index, item.creator)}
                        >
                          Sender reclaim
                        </button>
                      )}
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
                <RxCross2
                  onClick={() => {
                    setSelected(undefined);
                    setPopup(false);
                  }}
                />
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
                <button
                  onClick={() => {
                    claimFunds(selected.index, selected.receiver);
                    setPopup(false);
                  }}
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        )}

        {/* setting popup */}
        {settting && (
          <div className="flex w-screen justify-center absolute top-20">
            <div className="flex flex-col bg-[#ddd] rounded-[20px] gap-y-2 min-w-[400px] p-5 ">
              <div className="flex justify-between">
                <p>Setting</p>
                <RxCross2
                  className="cursor-pointer"
                  onClick={() => {
                    setSetting(false);
                  }}
                />
              </div>
              <div>
                <p>Set New Owner</p>
                <p>Current Owner: {wallet.toLowerCase()}</p>
                <div className="flex gap-x-2 items-center">
                  <CgProfile />
                  <input
                    placeholder="new owner"
                    // value={value2.address}
                    onChange={(event) =>
                      setValue2({ ...value2, address: event.target.value })
                    }
                  />
                  <button
                    onClick={() => {
                      setNewOwner();
                      setSetting(false);
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>
              <div>
                <p>Set Owner Fee</p>
                <p>Current Owner Fee: {ownerFee} (ETH)</p>
                <div className="flex gap-x-2 items-center">
                  <FaMoneyBillAlt />
                  <input
                    placeholder="owner fee"
                    // value={value2.ownerfee}
                    onChange={(event) =>
                      setValue2({ ...value2, ownerfee: event.target.value })
                    }
                  />
                  <button
                    onClick={() => {
                      set_OwnerFee();
                      setSetting(false);
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>
              <div>
                <p>Set New Deadline</p>
                <p>Current Deadline: {deadline.dead_line / 86400} Days</p>
                <div className="flex gap-x-2 items-center">
                  <BiTimer />
                  <input
                    placeholder="new deadline"
                    type="number"
                    // value={value2.deadline_}
                    onChange={(event) =>
                      setValue2({ ...value2, _deadline: event.target.value })
                    }
                  />
                  <button
                    onClick={() => {
                      set_deadline();
                      setSetting(false);
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* widthdraw table */}
        <div className="w-full mt-5 mb-5">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Address</th>
                <th>
                  Contract Balance <span>(ETH)</span>
                </th>
                <th>
                  Account Balance <span>(ETH)</span>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {userDetails.length &&
                userWithdraw?.map((item, idx) => (
                  <tr key={idx} className="text-center">
                    <td>
                      <h4>
                        {console.log(userDetails)}
                        {userDetails[idx].creator.slice(0, 8)}...
                        {String(userDetails[idx].creator).slice(-5)}
                      </h4>
                    </td>
                    <td>{`${contractBalance}`}</td>
                    <td>{`${item}`}</td>
                    <td>
                      <button type="button" onClick={withdraw}>
                        Withdraw
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
