import { Contract, Web3, WebSocketProvider } from 'web3';
import logger from './logger/log';
import dotenv from 'dotenv';
import { BlockchainConfig } from './type';
import USDC_SEPOLIA_ABI from './abi/0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9.json';

dotenv.config();

// Types
interface EventSubscription {
  contractAddress: string;
  eventName: string;
  subscription: any;
}

// Classe principale pour gérer les événements blockchain
class BlockchainEventListener {
  private web3!: Web3;
  private provider?: WebSocketProvider;
  private subscriptions: EventSubscription[] = [];
  private readonly config: BlockchainConfig;

  constructor(config: BlockchainConfig) {
    this.config = config;
    this.initializeProvider();
  }

  private initializeProvider(): void {
    this.provider = new WebSocketProvider(
      this.config.wsUrl,
      {},
      {
        delay: 5000,
        autoReconnect: true,
        maxAttempts: 5
      }
    );

    this.web3 = new Web3(this.provider);
    
  }

  private handleEvent(contractAddress: string, eventName: string, event: any): void {
    logger.info(`New ${eventName} event from ${contractAddress}:`, {
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
      returnValues: event.returnValues
    });
  }

  public subscribeToEvent(contractAddress: string, abi: any, eventName: string): void {
    try {
      const contract: Contract<typeof abi> = new this.web3.eth.Contract(abi, contractAddress);
      
      // subscribe to the smart contract Transfer event
    const subscription = contract.events.Transfer();

    // new value every time the event is emitted
    subscription.on('data', (d: any) => {
      console.log((
        `\nAmount: ${d.returnValues.tokens.toString()}\nFrom: ${
          d.returnValues.from
        }\nTo: ${d.returnValues.to}\n`)
    )});
    
    } catch (error) {
      logger.error(`Failed to subscribe to ${eventName}:`, error);
    }
  }

  public async start(): Promise<void> {
    try {
      logger.info('Starting blockchain event listener...');
      logger.info(' ==> RPC URL : '+this.config.wsUrl);
      this.config.contracts.forEach(contract => {
        console.log(`Listen ${contract.address} & events ${contract.events}`)
        contract.events.forEach(eventName => {
          this.subscribeToEvent(contract.address, contract.abi, eventName);
        });
      });

      logger.info('Blockchain event listener started successfully');
    } catch (error) {
      logger.error('Failed to start blockchain event listener:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      // Unsubscribe from all events
      for (const sub of this.subscriptions) {
        await sub.subscription.unsubscribe();
        logger.info(`Unsubscribed from ${sub.eventName} on ${sub.contractAddress}`);
      }
      this.subscriptions = [];
      
      // Close provider connection
      if (this.provider) {
        this.provider.disconnect();
      }
      
      logger.info('Blockchain event listener stopped successfully');
    } catch (error) {
      logger.error('Error stopping blockchain event listener:', error);
      throw error;
    }
  }
}

const config: BlockchainConfig = {
  wsUrl: process.env.WS_URL || '',
  contracts: [
    {
      address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      abi: USDC_SEPOLIA_ABI,
      events: ['Transfer'],
    },
  ],
};

// Initialisation et démarrage
const listener = new BlockchainEventListener(config);

// Gestion de l'arrêt propre
process.on('SIGINT', async () => {
  logger.info('Shutting down...');
  await listener.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down...');
  await listener.stop();
  process.exit(0);
});

// Démarrage
listener.start()
  .catch(error => {
    logger.error('Failed to start:', error);
    process.exit(1);
  });