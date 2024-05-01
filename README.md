# e2ews
Sandbox project to simulate end-to-end encryption to wrap around [lucko/bytesocks](https://github.com/lucko/bytesocks). **!!This is not a battle-tested E2E flow!!**

## Flow
- Remote has a fixed (may rotating) public private keypair. Controller knows the public key beforehand.
- Remote connects to bytesocks server, creates endpoint key and goes into standby waiting for a controller to connect.
- Controller connects to bytesocks server on the same key that the remote was connected to and sends `HELLO`. It also generated a fresh public-private keypair.
- Remote sends a `CHALLENGE` and tells the client to encrypt it with the remote's known public key.
- Controller encrypts said challenge in the public key it knows and sends it as a `CHALLENGE_RES`
- Remote `SEND_CONPUB`, controller sends it's public key through `CONPUB`.
- Remote `ACK`'s, and connection is established.
- Messages will be encrypted, `FRAME_CON` is messages sent by the controller encrypted with remote's public key, and `FRAME_REM` is messages sent by the remote, encrypted with controller's public key. 

## Limitations
This implementation PURELY uses the RSA algorithm to encrypt the payload, so issues with lengthy payload may occur. An improved implementation would be using exchanged keys to cipher symmetric encryption like `aes-256-cbc`.

## Usage
This project was created using `bun init` in bun v1.1.6. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

```bash
bun install
```

In a terminal prompt, run
```sh
bun run ./src/cmd/remote.ts
```

In another terminal prompt, run
```sh
bun run ./src/cmd/controller.ts
```
