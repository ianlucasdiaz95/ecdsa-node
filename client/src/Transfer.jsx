import { useState } from "react";
import server from "./server";

import { secp256k1 as secp } from 'ethereum-cryptography/secp256k1';
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";
import { sha256 } from "ethereum-cryptography/sha256.js";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const data = { sender: address, recipient, amount: parseInt(sendAmount)};
    const msgHash = toHex(sha256(utf8ToBytes(JSON.stringify(data))))
    const signature = secp.sign(msgHash, privateKey);

    try {
      const {
        data: { balance },
      } = await server.post(`send`, { signature: { r: signature.r.toString(16),s: signature.s.toString(16), recovery: signature.recovery},msgHash, data});
      setBalance(balance);
    } catch (error) {
      console.log(error);
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
