import Web3 from "web3";

const getUserWalletAddresses = async () => {
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  } catch (accountError) {}
};

export const getWeb3Instance = async (networkId) => {
  let web3Provider;

  if (window.ethereum) {
    web3Provider = window.ethereum;
  } else if (window.web3) {
    web3Provider = window.web3.currentProvider;
  } else {
    const publicEndpoint = "https://rpc-mumbai.maticvigil.com/";
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
      {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${networkId.toString(16)}`,
                  chainName: "Mumbai",
                  nativeCurrency:{
                    name:'Mumbai',
                    symbol:'MATIC',
                    decimals:18
                  },
                  rpcUrls: ["https://rpc-mumbai.maticvigil.com/"] /* ... */,
                },
              ],
            });
          } catch (addError) {
            // handle "add" error
          }
        }
        // handle other "switch" errors
      }
    }
  }

  if (web3Provider === window.ethereum) {
    await getUserWalletAddresses();
  }

  return new Web3(web3Provider);
};
