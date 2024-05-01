export interface Packet {
    id: string;
    msgType: 'HELLO' | 'CHALLENGE';
    data: any;
    timestamp: number;
}

