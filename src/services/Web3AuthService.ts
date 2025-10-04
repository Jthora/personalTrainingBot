export class Web3AuthService {
    private static instance: Web3AuthService;
    private walletAddress: string | null = null;

    static getInstance(): Web3AuthService {
        if (!Web3AuthService.instance) {
            Web3AuthService.instance = new Web3AuthService();
        }
        return Web3AuthService.instance;
    }

    private constructor() {}

    async getWalletAddress(): Promise<string | null> {
        return this.walletAddress;
    }

    async connect(): Promise<string> {
        if (!this.walletAddress) {
            this.walletAddress = Web3AuthService.generateMockAddress();
        }
        return this.walletAddress;
    }

    async disconnect(): Promise<void> {
        this.walletAddress = null;
    }

    private static generateMockAddress(): string {
        if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
            const bytes = new Uint8Array(20);
            crypto.getRandomValues(bytes);
            return `0x${Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('')}`;
        }

        const fallback = Array.from({ length: 20 }, () => Math.floor(Math.random() * 256));
        return `0x${fallback.map(byte => byte.toString(16).padStart(2, '0')).join('')}`;
    }
}

export default Web3AuthService;
