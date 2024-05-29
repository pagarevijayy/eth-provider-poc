import type { EthereumProvider } from '../eip-eth-provider/ethereum-provider';

let didHandleWindowAccess = false;
let dappDetectionIsPossible = true;

type ForeignProvider = EthereumProvider & { isRabby?: boolean };

const state = {
    dappDetected: false,
    dappIsKometAware: false,
};

const listeners: Array<(value: typeof state) => void> = [];
const notify = () => listeners.forEach((l) => l(state));

export function onChange(listener: (value: typeof state) => void) {
    listeners.push(listener);
    if (state.dappDetected) {
        listener(state);
    }
}

function trackKometFlagAccess(ourProvider: EthereumProvider) {
    Object.defineProperty(ourProvider, 'isKomet', {
        get() {
            state.dappIsKometAware = true;
            notify();
            return ourProvider.isMetaMask ? undefined : true;
        },
    });
}

export async function initialize(ourProvider: EthereumProvider) {
    trackKometFlagAccess(ourProvider);
    const isDapp = await ourProvider.request({ method: 'wallet_isKnownDapp' });
    if (isDapp) {
        state.dappDetected = true;
        notify();
    }
}

export function handleForeignProvider(provider: ForeignProvider) {
    if (provider.isRabby) {
        // rabby tries to access window.ethereum as well as all its properties,
        // making dapp detection impossible
        dappDetectionIsPossible = false;
    }
}

export function onBeforeAssignToWindow(provider: ForeignProvider | undefined) {
    if (provider) {
        handleForeignProvider(provider);
    }
}

export function onAccessThroughWindow() {
    if (!didHandleWindowAccess) {
        didHandleWindowAccess = true;
        if (dappDetectionIsPossible) {
            state.dappDetected = true;
            notify();
        }
    }
}

let didRegisterEip6963Support = false;

export function registerEip6963SupportOnce(ourProvider: EthereumProvider) {
    if (didRegisterEip6963Support) {
        return;
    }
    ourProvider.request({
        method: 'wallet_registerEip6963Support',
        params: [{ origin: window.location.origin }],
    });
    didRegisterEip6963Support = true;
}