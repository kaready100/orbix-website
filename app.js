
const providerOptions = {
  walletconnect: {
    package: window.WalletConnectProvider.default,
    options: {
      rpc: {
        137: "https://polygon-rpc.com"
      },
    }
  },
  injected: {
    display: {
      name: "MetaMask",
      description: "Connect using MetaMask"
    },
    package: null
  }
};

const web3Modal = new window.Web3Modal.default({
  cacheProvider: false,
  providerOptions,
  theme: "dark"
});

const ORX_TOKEN_ADDRESS = "0xF4EDC72777e2AD20a02caA72b7BF51B7281BdAdE";
const ORX_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

document.getElementById("connectWallet").onclick = async () => {
  try {
    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    document.getElementById("userAddress").innerText = address;
    document.getElementById("networkName").innerText = network.name;

    const token = new ethers.Contract(ORX_TOKEN_ADDRESS, ORX_TOKEN_ABI, provider);
    const balanceRaw = await token.balanceOf(address);
    const decimals = await token.decimals();
    const balance = ethers.utils.formatUnits(balanceRaw, decimals);
    document.getElementById("tokenBalance").innerText = balance;
    document.getElementById("walletInfo").classList.remove("hidden");
  } catch (err) {
    console.error("Wallet connection failed:", err);
  }
};
