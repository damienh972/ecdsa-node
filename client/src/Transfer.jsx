import { useState } from "react";
import { BN } from 'bn.js';
import server from "./server";
import { signMessage } from "./signMessage";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    if (!privateKey) {
      alert("You must enter your private key");
      return;
    }

    try {
      const { signature, messageHash, publicAddress, publicKey } =
        await signMessage(privateKey);

      if (publicAddress !== address.toLowerCase()) {
        alert("Your private key does not match the wallet address you entered");
        return;
      }

      const rBN = new BN(signature.r.toString());
      const sBN = new BN(signature.s.toString());

      const rHex = rBN.toString(16);
      const sHex = sBN.toString(16);


      const {
        data: { balance },
      } = await server.post(`send`, {
        rHex,
        sHex,
        recovery: signature.recovery,
        messageHash,
        publicKey,
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
      });
      setBalance(balance);
    } catch (error) {
      alert(error.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
