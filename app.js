
async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const walletAddress = accounts[0];
            document.getElementById('walletAddress').textContent = walletAddress;

            const chainId = await ethereum.request({ method: 'eth_chainId' });
            if (chainId === "0x89") {
                document.getElementById('networkStatus').textContent = "Polygon Mainnet";
                document.getElementById('networkStatus').classList.add('connected');
            } else {
                document.getElementById('networkStatus').textContent = "Wrong Network!";
                alert("Please switch to the Polygon network.");
            }
        } catch (error) {
            console.error("Wallet connection failed", error);
        }
    } else {
        alert("MetaMask is not installed. Please install it to use this feature.");
    }
}
