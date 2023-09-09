"use client"
import '@rainbow-me/rainbowkit/styles.css';
import {
    ConnectButton,
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
    polygonMumbai
} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

export default function Header(){
    const { chains, publicClient } = configureChains(
        [polygonMumbai],
        [
          //alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
          publicProvider()
        ]
      );
      
      const { connectors } = getDefaultWallets({
        appName: 'My RainbowKit App',
        projectId: 'YOUR_PROJECT_ID',
        chains
      });
      
      const wagmiConfig = createConfig({
        autoConnect: true,
        connectors,
        publicClient
      })
    return(
        <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
        <div className="flex justify-between bg-black text-white px-5 lg:px-20 text-md lg:text-2xl py-5">
            <p className='pt-3'>
                NFT Market
            </p>
            <ConnectButton label='Sign in'/>
        </div>
        </RainbowKitProvider>
    </WagmiConfig>
    )
}