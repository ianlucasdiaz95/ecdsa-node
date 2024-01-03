const express = require("express");
const {secp256k1 : secp} = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const {toHex, utf8ToBytes} = require("ethereum-cryptography/utils")

const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "03d4158e4f3336b30f2651b0e154fcc55863e347cc98ff726d2ed85ebd79a45366": 100,
  "02c4c3f780a2135b0e167dc055cb80ca65899cfdaeefe7f1cfb562a4d621aad52a": 50,
  "027e1c8c4b3f22b96afd2e0978b1be02ff50024d1c18523d48f378fb2a80f5948b": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 'Address does not exist.';
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { data, signature, msgHash } = req.body;
  const { sender, recipient, amount } = data;
  const { r, s, recovery } = signature;

  if(!signature) {
    return res.status(401).send({ message: "Unauthorized." });
  }

    try {
      
      const isSigned = secp.verify({ r: BigInt(`0x${r}`), s: BigInt(`0x${s}`), recovery}, msgHash, sender);
      if (!isSigned) {
        return res.status(400).send({balance: balances[sender] ,message: "Invalid signature" });
      }

      setInitialBalance(sender);
      setInitialBalance(recipient);

      if (balances[sender] < amount) {
        return res.status(400).send({ message: "Not enough funds!" });
      } else {
        balances[sender] -= amount;
        balances[recipient] += amount;
        return res.send({ balance: balances[sender] });
      }
      
    } catch (error) {

      console.log(error);
      res.status(500).send({message: 'There was an error processing the request.'})
      
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
