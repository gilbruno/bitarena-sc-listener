export type DecodedEventLogGameData = {
    args: {
        game?: string;
        platform?: string;
    },
    eventName: 'GameAdded' | 'PlatformAdded';
}
