import server from "./server";

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
}) {

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function getBalance(evt) {
    const address = evt.target.value;

    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  async function getFunds() {
    if (!address) {
      alert("You must enter an address");
      return;
    }

    try {
      const {
        data: { balance },
      } = await server.post(`faucet`, { address });
      setBalance(balance);
    }
    catch (error) {
      alert(error);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <input
          placeholder="Type an address, for example: 0x1"
          value={address}
          onChange={getBalance}
        ></input>
        <button onClick={getFunds}>Get 100 credits</button>
      </label>
      <label>
        Private key
        <input
          placeholder="Type the private key of the address you want to send funds from"
          value={privateKey}
          onChange={setValue(setPrivateKey)}
        ></input>
      </label>
      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
