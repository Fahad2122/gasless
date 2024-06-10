import React, { useEffect, useState } from 'react';
import { PaymasterMode, createBundler, createSmartAccountClient, getCustomChain } from "@biconomy/account";
import { ethers } from "ethers";
import { useAddress, useSigner } from '@thirdweb-dev/react';
import { parseEther } from 'ethers/lib/utils';

function PayMaster() {

    const [walletAddress, setWalletAddress] = useState('');
    const [smartWallet, setSmartWallet] = useState<any>(null);
    const [smartAccountBalance, setSmartAccountBalance] = useState('0');

    const config = {
        privateKey: "4b689fb34c161eba7c7b293aaee4c994ae3125c4558c568a7f088e0021c576ac",
        biconomyPaymasterApiKey: "your-biconomy-api-key",
        bundlerUrl: "", // <-- Read about this at https://docs.biconomy.io/dashboard#bundler-url
        rpcUrl: process.env.CORE_RPC_URL,
    };

    let provider = new ethers.providers.JsonRpcProvider("https://rpc.test.btcs.network");
    const injectedWallet = useAddress();

    let eth: any;
    if (typeof window !== 'undefined') {
        const { ethereum } = window;
        eth = ethereum;
    }

    const smartAccountClient = async () => {
        const provider2 = new ethers.providers.Web3Provider(eth);
        await provider2.send("eth_requestAccounts", []);
        const signer2 = provider2.getSigner();

        const chain = getCustomChain("coreBlockchainTestnet", 1115, "https://rpc.test.btcs.network", "https://scan.test.btcs.network/");

        const wallet = await createSmartAccountClient(
            {
                signer: signer2,
                chainId: 1115,
                customChain: chain,
                rpcUrl: "https://rpc.test.btcs.network",
                // bundler: address,
                // accountAddress: metaMaskWallet,
                // bundlerUrl:
                // "https://paymaster.biconomy.io/api/v1/1115/LbQ7GS5nG.9958967f-a325-4eaf-8588-30c471820479", // <-- Read about this here
                bundlerUrl: "https://bundler.biconomy.io/api/v2/1115/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
                biconomyPaymasterApiKey: "LbQ7GS5nG.9958967f-a325-4eaf-8588-30c471820479", // <-- Read about at https://docs.biconomy.io/dashboard/paymaster
            }
        );

        console.log("wallet: ", wallet);
        setSmartWallet(wallet);
        const saAddress = await wallet.getAccountAddress();
        setWalletAddress(saAddress);

        const [tokenBalanceFromSmartAccount, nativeTokenBalanceFromSmartAccount] = await wallet.getBalances();
        setSmartAccountBalance(String(Number(tokenBalanceFromSmartAccount?.amount) / 1e18).slice(0, 6));
    }

    const transferCore = async () => {
        //   const wait2 = await smartWallet.deploy();

        // try {
        //     const { wait } = await smartWallet.deploy({
        //         paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        //     });
        // } catch (error) {
        //     console.log('Account Deploy Error: ', error)
        // }
        const tx: any = {
            to: "0x790D6cd73ca1cB7D68525b587C6928aC2883E50c",
            value: ethers.utils.parseEther("0.01"),
            gasLimit: 21000,
            gasPrice: ethers.utils.parseUnits("10", "gwei")
        };
        const userOpResponse = await smartWallet.sendTransaction(tx, {
            paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        });
        console.log("UserOpResponse: ", userOpResponse);
        const { transactionHash } = await userOpResponse.waitForTxHash();
        console.log("Transaction Hash", transactionHash);
        const userOpReceipt = await userOpResponse.wait();
        if (userOpReceipt.success == 'true') {
            console.log("UserOp receipt", userOpReceipt)
            console.log("Transaction receipt", userOpReceipt.receipt)
        }
    }

    // const connectWalletHandler = async () => {

    // }

    useEffect(() => {
        smartAccountClient();

    }, [walletAddress, injectedWallet, smartAccountBalance]);
    return (
        <div>
            {/* <button  onClick={connectWalletHandler}>Connect Wallet</button> */}
            <p>Account Adddress: {walletAddress}</p>
            <p>Account Balance: {smartAccountBalance}</p>
            <button className='bg-white text-black' onClick={transferCore}>Transfer</button>
        </div>
    )
}

export default PayMaster