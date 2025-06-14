import { ethers } from "https://cdn.ethers.io/lib/ethers-5.6.esm.min.js";
import Web3Modal from "https://cdn.jsdelivr.net/npm/web3modal@1.9.12/dist/index.js";

const connectWalletBtn = document.getElementById("connectWalletBtn");
const addressDiv = document.getElementById("address");
const balanceDiv = document.getElementById("balance");
const walletSection = document.getElementById("walletSection");

const ORX_TOKEN_ADDRESS = "0xF4EDC72777e2AD20a02caA72b7BF51B7281BdAdE";
const ORX_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

let provider;
let signer;

async function connectWallet() {
  try {
    const web3Modal = new Web3Modal.default({ cacheProvider: false });
    const instance = await web3Modal.connect();
    provider = new ethers.providers.Web3Provider(instance);
    signer = provider.getSigner();

    const userAddress = await signer.getAddress();
    addressDiv.textContent = `Wallet: ${userAddress}`;

    const token = new ethers.Contract(ORX_TOKEN_ADDRESS, ORX_ABI, provider);
    const balanceRaw = await token.balanceOf(userAddress);
    const decimals = await token.decimals();
    const formatted = ethers.utils.formatUnits(balanceRaw, decimals);
    balanceDiv.textContent = `ORX Balance: ${formatted}`;

    walletSection.classList.remove("hidden");
  } catch (error) {
    console.error("Wallet connection error:", error);
    alert("Failed to connect wallet.");
  }
}

connectWalletBtn.addEventListener("click", connectWallet);
