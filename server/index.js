const { secp256k1 } = require("ethereum-cryptography/secp256k1.js");
const BN = require('bn.js');

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());


app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/faucet", (req, res) => {
  const { address } = req.body;
  setInitialBalance(address);
  balances[address] += 100;
  res.send({ balance: balances[address] });
});

app.post("/send", (req, res) => {
  const { rHex, sHex, recovery, messageHash, publicKey, sender, recipient, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  const isSigned = verifySignature(rHex, sHex, recovery, messageHash, publicKey);

  if (!isSigned) {
    return res.status(400).send({ message: "Invalid signature!" });
  }

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function verifySignature(r, s, recovery, messageHash, publicKey) {

  function convertToUint8Array(object) {
    const values = Object.values(object);
    return Uint8Array.from(values);
  }

  function restoreSignature(rBytes, sBytes, recovery) {

    const rBN = new BN(rBytes, 16);
    const sBN = new BN(sBytes, 16);

    const r = BigInt(rBN.toString());
    const s = BigInt(sBN.toString());

    const restoredSignature = {
      r,
      s,
      recovery
    };

    return restoredSignature;
  }

  const restoredSignature = restoreSignature(r, s, recovery);
  const uint8ArrayMessage = convertToUint8Array(messageHash);
  const uint8ArrayPublicKey = convertToUint8Array(publicKey);

  return secp256k1.verify(restoredSignature, uint8ArrayMessage, uint8ArrayPublicKey)
}
