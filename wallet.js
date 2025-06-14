let web3Modal;
let provider;
let signer;

const providerOptions = {
  walletconnect: {
    package: window.WalletConnectProvider,
    options: {
      rpc: {
        137: "https://polygon-rpc.com"
      },
      chainId: 137,
    }
  }
};

async function initWallet() {
  web3Modal = new window.Web3Modal.default({
    cacheProvider: true,
    providerOptions
  });

  if (web3Modal.cachedProvider) {
    await connectWallet();
  }
}

async function connectWallet() {
  try {
    provider = await web3Modal.connect();
    const ethersProvider = new ethers.providers.Web3Provider(provider);

    const network = await ethersProvider.getNetwork();
    if (network.chainId !== 137) {
      alert("Please switch your wallet network to Polygon Mainnet.");
    }

    signer = ethersProvider.getSigner();
    const address = await signer.getAddress();
    updateUI(address);

    provider.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        resetUI();
      } else {
        updateUI(accounts[0]);
      }
    });

    provider.on("chainChanged", (chainId) => {
      if (parseInt(chainId, 16) !== 137) {
        alert("Please switch your wallet network to Polygon Mainnet.");
      }
    });

    provider.on("disconnect", () => {
      resetUI();
    });
  } catch (err) {
    console.error("Wallet connection error:", err);
    alert("Failed to connect wallet.");
  }
}

function updateUI(address) {
  document.getElementById("walletInfo").textContent = `Connected: ${address}`;
  document.getElementById("walletBtn").textContent = "Disconnect Wallet";
}

function resetUI() {
  document.getElementById("walletInfo").textContent = "Wallet not connected.";
  document.getElementById("walletBtn").textContent = "Connect Wallet";
  provider = null;
}

document.getElementById("walletBtn").addEventListener("click", async () => {
  if (provider) {
    if (web3Modal) await web3Modal.clearCachedProvider();
    if (provider.disconnect) await provider.disconnect();
    resetUI();
  } else {
    await connectWallet();
  }
});

initWallet();
