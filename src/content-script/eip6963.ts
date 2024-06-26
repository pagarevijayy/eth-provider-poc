import type { EthereumProvider } from '../eip-eth-provider/ethereum-provider';
import kometLogoDataUrl from 'data-url:src/assets/komet-logo.png';

interface EIP6963ProviderInfo {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
}

const info = {
    uuid: crypto.randomUUID(),
    name: 'komet',
    icon: kometLogoDataUrl,
    rdns: 'me.komet.app',
} satisfies EIP6963ProviderInfo;

type Options = {
    onRequestProvider?: () => void;
    onAccessProvider?: () => void;
};

export function initializeEIP6963(
    provider: EthereumProvider,
    options?: Options
) {
    const providerDetail = { info, provider };
    Object.defineProperty(providerDetail, 'provider', {
        get() {
            // We add this getter to be able to detect that a dapp supports EIP-6963
            // We can't rely solely on 'eip6963:requestProvider', because technically dapp
            // can listen to our initial 'eip6963:announceProvider' event
            // and never dispatch the request event.
            options?.onAccessProvider?.();
            return provider;
        },
    });
    const announceEvent = new CustomEvent('eip6963:announceProvider', {
        detail: Object.freeze(providerDetail),
    });
    window.dispatchEvent(announceEvent);

    window.addEventListener('eip6963:requestProvider', () => {
        window.dispatchEvent(announceEvent);
        options?.onRequestProvider?.();
    });
}