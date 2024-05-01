export interface Packet {
    id: string;
    msgType: 'HELLO' | 'CHALLENGE' | 'CHALLENGE_RES' | 'SEND_CONPUB' | 'ACK' | 'FRAME_CON' | 'FRAME_REM';
    data: any;
    timestamp: number;
}

