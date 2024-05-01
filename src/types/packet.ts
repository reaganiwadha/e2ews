export interface Packet {
    id: string;
    msgType: 'HELLO';
    data: any;
    timestamp: number;
}