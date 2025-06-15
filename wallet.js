import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.6.2/+esm";
import Web3Modal from "https://cdn.jsdelivr.net/npm/web3modal@2.8.7/+esm";

const ORX_TOKEN_ADDRESS = "0xF4EDC72777e2AD20a02caA72b7BF51B7281BdAdE";

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

let provider;
let signer;
let contract;
let web3Modal;

const connectBtn = document.getElementById("connectBtn");
const walletDetails = document.getElementById("walletDetails");
const addressSpan = document.getElementById("address");
const balanceSpan = document.getElementById("balance");

async function init() {
  web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions: {
      walletconnect: {
        package: (await import("@walletconnect/web3-provider")).default,
        options: {
          infuraId: "", // میتونی اینو بگذاری یا نگذاری
        },
      },
    },
  });

  connectBtn.addEventListener("click", connectWallet);
}

async function connectWallet() {
  try {
    const instance = await web3Modal.connect();

    provider = new ethers.BrowserProvider(instance);
    signer = await provider.getSigner();

    const userAddress = await signer.getAddress();
    addressSpan.textContent = userAddress;

    contract = new ethers.Contract(ORX_TOKEN_ADDRESS, ERC20_ABI, provider);

    const rawBalance = await contract.balanceOf(userAddress);
    const decimals = await contract.decimals();
    const formattedBalance = ethers.formatUnits(rawBalance, decimals);

    balanceSpan.textContent = Number(formattedBalance).toLocaleString();

    walletDetails.classList.remove("hidden");
    connectBtn.textContent = "Wallet Connected";
    connectBtn.disabled = true;
  } catch (error) {
    console.error(error);
    alert("Failed to connect wallet. Please ensure you have MetaMask or another wallet installed.");
  }
}

init();
