import Web3 from "web3";

const getUserWalletAddresses = async () => {
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  } catch (accountError) {
  }
};

export const getWeb3Instance = async (networkId) => {
  let web3Provider;

  if (window.ethereum) {
    web3Provider = window.ethereum;
  } else if (window.web3) {
    web3Provider = window.web3.currentProvider;
  } else {
    const publicEndpoint = "https://sepolia.infura.io/v3/";
    web3Provider = new Web3.providers.HttpProvider(publicEndpoint);
  }

  const web3 = new Web3(web3Provider);
  const currentNetworkId = await web3.eth.net.getId();

  if (currentNetworkId !== networkId && web3Provider === window.ethereum) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${networkId.toString(16)}` }],
      });
    } catch (switchError) {

    }
  }

  if (web3Provider === window.ethereum) {
    await getUserWalletAddresses();
  }

  return new Web3(web3Provider);
};
