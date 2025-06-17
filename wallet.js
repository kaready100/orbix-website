import Web3Modal from "https://unpkg.com/web3modal";

const providerOptions = {};
const web3Modal = new Web3Modal.default({
  cacheProvider: false,
  providerOptions
});

let web3;
let selectedAccount;

const ORX_TOKEN_ADDRESS = "0xF4EDC72777e2AD20a02caA72b7BF51B7281BdAdE";
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
];

async function connectWallet() {
  try {
    const provider = await web3Modal.connect();
    web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    selectedAccount = accounts[0];

    document.getElementById("connectWallet").innerText =
      selectedAccount.slice(0, 6) + "..." + selectedAccount.slice(-4);

    const contract = new web3.eth.Contract(ERC20_ABI, ORX_TOKEN_ADDRESS);
    const balance = await contract.methods.balanceOf(selectedAccount).call();
    const decimals = await contract.methods.decimals().call();
    const formatted = (balance / 10 ** decimals).toFixed(6); // دقت بالا

    document.getElementById("balance").innerText = `${formatted} ORX`;
  } catch (error) {
    console.error("Wallet connect failed", error);
  }
}

document.getElementById("connectWallet").addEventListener("click", connectWallet);
