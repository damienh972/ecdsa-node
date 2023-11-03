import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes, bytesToHex as toHex } from "ethereum-cryptography/utils";

export async function signMessage(privateKey) {
  const randomMessage = Math.random().toString(36).substring(7);
  const messageHash = hasMessage(randomMessage);
  const publicKey = secp256k1.getPublicKey(privateKey, false);
  const publicAddress = await getAddress(publicKey);
  const signature = secp256k1.sign(messageHash, privateKey);
  const isSigned = secp256k1.verify(signature, messageHash, publicKey);

  if (isSigned) {
    return {
      signature, messageHash, publicAddress, publicKey
    };
  } else {
    throw new Error("Message was not signed");
  }
};

function hasMessage(message) {
  return keccak256(utf8ToBytes(message))
}

function getAddress(publicKey) {

  const sliceKey = publicKey.slice(1);
  const hashKey = keccak256(sliceKey);
  return `0x${toHex(hashKey.slice(-20))}`;
}