import server from "./server";
import { secp256k1 as secp } from 'ethereum-cryptography/secp256k1';
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex } from "ethereum-cryptography/utils";
import { useState } from "react";

function Wallet({ address, setAddress, privateKey, setPrivateKey, balance, setBalance }) {
  const [ error, setError ] = useState('');

  async function onChange(evt) {
    try {

      if(!evt.target.value){
        setPrivateKey('');
        setError('');
        return;
      }

      const privateKey = evt.target.value;
      setPrivateKey(privateKey);

      const publicKey = secp.getPublicKey(privateKey);
      const addressFromPublicKey = toHex(publicKey);

      if(!addressFromPublicKey){
        setBalance(0);
        setError('');

        return;
      }

      const { data: { balance } } = await server.get(`balance/${addressFromPublicKey}`);

      setAddress(addressFromPublicKey);
      setBalance(balance);
      
    } catch (error) {
      console.error(error);
      setError('Please enter a valid private key.')
      setAddress('');
      setBalance(0);
    }
    
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      {/* <label>
        Wallet Address
        <input placeholder="Type an address, for example: 0x1" value={address} onChange={onChange}></input>
      </label> */}
      <label>
        Private Key
        <input placeholder="Type your private key" value={privateKey} onChange={onChange}></input>
        <span style={{color: 'red', marginTop: '5px'}}>{error}</span>
      </label>

      <p><strong>Address: </strong>{address}</p>
      { 
        address == '' 
          ? null 
          : <div className="balance">Balance: {balance}</div> 
      }
      
    </div>
  );
}

export default Wallet;
