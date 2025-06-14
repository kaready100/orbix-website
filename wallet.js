import { ethers } from "https://cdn.ethers.io/lib/ethers-5.6.esm.min.js";
import Web3Modal from "https://cdn.jsdelivr.net/npm/web3modal@1.9.12/dist/index.js";

const connectButton = document.getElementById("connectWallet");
const userAddress = document.getElementById("userAddress");
const orxBalance = document.getElementById("orxBalance");

const ORX_TOKEN_ADDRESS = "0xF4EDC72777e2AD20a02caA72b7BF51B7281BdAdE";
const ORX_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

let web3Modal;
let provider;
let signer;

async function init() {
  web3Modal = new Web3Modal.default({
    cacheProvider: false,
    providerOptions: {}
  });
}

async function connectWallet() {
  try {
    const instance = await web3Modal.connect();
    provider = new ethers.providers.Web3Provider(instance);
    signer = provider.getSigner();
    const address = await signer.getAddress();
    userAddress.innerText = `Wallet: ${address}`;

    const orxContract = new ethers.Contract(ORX_TOKEN_ADDRESS, ORX_ABI, provider);
    const balance = await orxContract.balanceOf(address);
    const decimals = await orxContract.decimals();
    const formatted = ethers.utils.formatUnits(balance, decimals);

    orxBalance.innerText = `ORX Balance: ${formatted}`;
  } catch (err) {
    console.error("Connection failed:", err);
    orxBalance.innerText = "Connection failed.";
  }
}

connectButton.addEventListener("click", connectWallet);
window.addEventListener("load", init);
