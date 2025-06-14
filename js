let web3Modal;
let provider;

async function init() {
  const providerOptions = {
    walletconnect: {
      package: window.WalletConnectProvider.default,
      options: {
        rpc: {
          137: "https://polygon-rpc.com"
        }
      }
    }
  };

  web3Modal = new window.Web3Modal.default({
    cacheProvider: false,
    providerOptions,
    theme: "light"
  });
}

async function connectWallet() {
  try {
    provider = await web3Modal.connect();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const address = await signer.getAddress();
    document.getElementById("walletAddress").innerText = "Connected Wallet: " + address;
  } catch (e) {
    console.error("Wallet connection failed", e);
    document.getElementById("walletAddress").innerText = "Connection failed.";
  }
}

document.getElementById("connectWallet").addEventListener("click", connectWallet);

window.addEventListener('load', async () => {
  await init();
});
