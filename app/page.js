"use client"
import { useEffect, useState } from "react";
import Header from "./components/Header";
import { ethers } from "ethers";
import contractabi from "./abi/abi.json"
const axios = require('axios')
const FormData = require('form-data')



export default function Home() {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(0);
  const [contract, setContract] = useState(null);
  const [name, setName] = useState("");
  const [description,setDescription] = useState("");
  const [image, setImage] = useState(null);  
  useEffect(()=>{
    async function initialize(){
      if(typeof window.ethereum !== "undefined"){
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        setAddress(address);
        // setBalance(ethers.utils.parseEther(balance));
        const mycontractaddress="0xfCc49c65a1CC2094B250c75139b0B3d0F2658F3e";
        const contract = new ethers.Contract(mycontractaddress,contractabi,signer)
        setContract(contract)
      }
    }
    initialize();
  },[])

  function onChangeFile(e){
    const file = e.target.files[0];
    setImage(file);
    console.log(file)
  }

 async function onSubmit(event){
    if(!name && !description && !image){
      alert("Fill the required details")
      return;
    } 
    const JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjZTQ5NTk1YS1hMmU4LTRiNjUtOTE1My1lODMyMmU0ODgzZjUiLCJlbWFpbCI6ImFiaGlzaGVrLmRhczAwMjNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjMyMWM5YjJlOTZjMWJmZWRhZDQ2Iiwic2NvcGVkS2V5U2VjcmV0IjoiZmNhMWJmNzU3Yzk5MmQ2OWFjNThjODIwMDM1ZTFkOWFlMzRkY2I5NzI2ZmJhNGM2ZjM2YjE2MTNkNTEwZDU2ZiIsImlhdCI6MTY5NDI0NDMzM30.J67GJijrmvcuN_kaIgP7lwYobEtqybaoNhoKNW_QehA";
    event.preventDefault();

    const formData = new FormData();
    formData.append('file', image);

    const pinataMetadata = JSON.stringify({
      name: 'File name',
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', pinataOptions);

    try{
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: "Bearer " + JWT,
        }
      });
      console.log(res.data);
      const ipfshash=res.data.IpfsHash;
      console.log(ipfshash);
      const jsondic={
        name,
        description,
         "image":`ipfs/${ipfshash}`
      }

        const resjson = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", jsondic, {
          
          headers: {
            'Content-Type': 'application/json',
            Authorization: "Bearer " + JWT,
          }
        });
        const jsonHash = resjson.data.IpfHash;
        const tokenURI = `https://ipfs.io/ipfs/${jsonHash}`;
        const conc = contract?.mint(address, tokenURI )
        console.log("mytokenID",conc)
        console.log("My json hash", resjson.data)
    } catch (error) {
      console.error(error);
    }


  }
  return (
    <>
    <div>
   <Header/>
   <div className="text-center">
   <p className="text-md text-blue-400 lg:text-3xl">Hi, {address?.slice(0,10)}...{address?.slice(-10)} </p>
   <div className="flex bg-yellow-400 px-10 mt-5 flex-col space-y-4 py-10 rounded-xl md:mx-[200px] lg:mx-[800px]">
   <p>NFT MarketPlace</p>
   <input type="text" placeholder="Enter your name" value={name} onChange={(e)=>{setName(e.target.value)}} className="border border-black px-2 " />
   <input type="text" placeholder="Enter your description" value={description} onChange={(e)=>{setDescription(e.target.value)}} className="border border-black px-2 " />
   <div>
   <label>Upload Image</label>
   <input type="file" className="mt-2" accept="image/*"  onChange={onChangeFile} />
   <button className="bg-blue-400 px-4 py-2 rounded-lg mt-4" onClick={onSubmit} >Submit</button>
   </div>
   </div>
  </div>
    </div>
    </>
  )
}