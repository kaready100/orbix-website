"use strict";

const ORX_TOKEN_ADDRESS = "0xF4EDC72777e2AD20a02caA72b7BF51B7281BdAdE";
const ORX_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

let provider;
let web3Modal;
let signer;
let contract;

const providerOptions = {
  walletconnect: {
    package: window.WalletConnectProvider.default,
    options: {
      rpc: {
        137: "https://polygon-rpc.com"
      },
      chainId: 137
    }
  }
};

const btnConnect = document.getElementById("btnConnect");
const btnDisconnect = document.getElementById("btnDisconnect");
const walletDetails = document.getElementById("walletDetails");
const walletAddressSpan = document.getElementById("walletAddress");
const tokenBalanceSpan = document.getElementById("tokenBalance");
const networkNameSpan = document.getElementById("networkName");

function shortenAddress(address) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

async function connectWallet() {
  try {
    web3Modal = new window.Web3Modal.default({
      cacheProvider: true,
      providerOptions
    });

    provider = await web3Modal.connect();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    signer = ethersProvider.getSigner();

    const network = await ethersProvider.getNetwork();
    networkNameSpan.textContent = network.name === "matic" ? "Polygon Mainnet" : network.name;

    const userAddress = await signer.getAddress();
    walletAddressSpan.textContent = shortenAddress(userAddress);

    contract = new ethers.Contract(ORX_TOKEN_ADDRESS, ORX_ABI, ethersProvider);
    const rawBalance = await contract.balanceOf(userAddress);
    const decimals = await contract.decimals();
    const formattedBalance = ethers.utils.formatUnits(rawBalance, decimals);
    tokenBalanceSpan.textContent = Number(formattedBalance).toLocaleString();

    walletDetails.style.display = "block";
    btnConnect.style.display = "none";
    btnDisconnect.style.display = "inline-block";

    provider.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        walletAddressSpan.textContent = shortenAddress(accounts[0]);
        updateBalance(accounts[0]);
      }
    });

    provider.on("chainChanged", () => {
      window.location.reload();
    });

  } catch (e) {
    alert("Connection failed or cancelled.");
    console.error(e);
  }
}

async function updateBalance(address) {
  try {
    const rawBalance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    tokenBalanceSpan.textContent = Number(ethers.utils.formatUnits(rawBalance, decimals)).toLocaleString();
  } catch (e) {
    console.error("Failed to update balance", e);
  }
}

async function disconnectWallet() {
  if (provider && provider.disconnect && typeof provider.disconnect === "function") {
    await provider.disconnect();
  }
  if (web3Modal) {
    await web3Modal.clearCachedProvider();
  }
  walletDetails.style.display = "none";
  btnConnect.style.display = "inline-block";
  btnDisconnect.style.display = "none";
  walletAddressSpan.textContent = "";
  tokenBalanceSpan.textContent = "";
  networkNameSpan.textContent = "";
}

btnConnect.addEventListener("click", connectWallet);
btnDisconnect.addEventListener("click", disconnectWallet);

// If cached provider exists, connect automatically
window.addEventListener("load", () => {
  web3Modal = new window.Web3Modal.default({
    cacheProvider: true,
    providerOptions
  });
  if (web3Modal.cachedProvider) {
    connectWallet();
  }
});
