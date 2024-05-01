# e2ews
Sandbox project to simulate end-to-end encryption to wrap around [lucko/bytesocks](https://github.com/lucko/bytesocks). **!!This is not a battle-tested E2E flow!!**

## Flow
> Remote can be described as the server, and controller can be described as the client. Remote/Controller terminology was used as this project is a PoC for another project using such terminology.
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

### Example
Remote terminal prompt
```sh
$ bun run ./src/cmd/remote.ts
{
  key: "J56gu33FezFo0DO",
}
connected
recv -> {"id":"go1jM5D46Q9H9NCD4CBU3","msgType":"HELLO","data":null,"timestamp":1714540361006}
recv -> {"id":"8tvhr1TNiiH-ZUh85iry8","msgType":"CHALLENGE_RES","data":"ZvPXUjmXMgansj9/NrxbaCWQYtWFxRTg5Bg2IL7QJfpPidyiCPlR6Iw/hnOz6Wq3N9AMd+Yie6ViMXl3jcS0UzwJf9C1lAd717sVhFRPXN7cTLCB7puFDhQaeANIojE3RMWHYvIsmZlSf211uZo4duJ8vYjo12Kr6iMrP+JygQ6Ap9/omr4hWsPuq1bb4rvR7Nat5ck/SK+6moM/pqqio9WDbWKRU7Xrg/100sgfOvU+bmQDpe+8L4vmP/KehvTLeIUIhuHi0M7gxp75Tv9YkN+sPs3yMNY1sLFd6j0Qixp3sqmjq32NlitLnnaqpH8BwGUQ3mAIVrLZUnMPiL/3kkYonB+hXjnbucQElar4d/4o6ZSCd2uPjxm1sG86OwawwWBVL48qLJYP1swjrcKvce7KrWVfbxi3ccl9lKSt/oVCFiLPuTgbKiaoT8dRNmQP4Hg7gfe8j6jQbmekcJ+ErOVd19RXMkVH2yJ85jGEDdtVMjwBrsmwe4H93H9jfwC5AK/WsmtAcMvx2nmZMYkc/aGIZK9k7knawmQpHUtEnbNCI7w8YRzBVjnOFBauZCKFlX3qf6sHn8+4lObf6HhTz5XuPZaPk7qwHmIUAL6NOnwFAZ+xJZcuQEi0LGmTyJzysOXrUf0Gv2+5o0KTCNA1MFH+THzfZAx0T8StzdVR7g==","timestamp":1714540361034}
decrypted -> xrV5IFdrmDIqB5KMCad5Rvo6O162RLct9z2bYPR5ZLkiVghrCy7EViYGOCVxNfvG
recv -> {"id":"NwHMDtz1HkXKxmkJC-730","msgType":"SEND_CONPUB","data":"-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAkpRqCijpq5zCfTgrMnjk\nij4m6nFCEMpOKg7M2hz3fKEnI+Zsx4QXNDuWxv0BUKO4Bo6kwTEWQuIdHulyq1Lr\nbYcKiHCDQhNeXyBbK/BS90aLFievIB7ZsacTykBQXfc/3V7vK5grY4gC/h2UBYe+\ns5ezeqIgeHfKawLvva8pedtnFIp/22owAZMSSTGvRkHkpDf+w4NyfieRgbL+qr4d\n9TzzrdWD75JkU1dlhhuJWdN8Di7h/zcRu0mREpcddEUTQx8BeU4hZJyuUkQ+Edmm\nm/Uhf7nelgs3Xw4Q4gffU5/TQ4L9+oKpqnUTPqk2pwTmxDU7zFPifxB4cRhucsUA\nGlyZvz8tFi6QwOFtoiYMEovpVyrIHl32WU7VLdVMtr6aTVw2Za5sosPHs6b15JsN\nxjzKHWE1sTVDspb6Vm2Y/RYsD0L3IpJ3xIn6QUiliR4E6ovtDPKS7/8nZUoh9ZlX\nu2k7GH+oaWA35dhHg7VlTEj7PNU+cqlmxvqa03kt8ic85ucahnx5CAy63lm1e9SM\nKz5F+Kee3KrW63lBfbJcm00oqT4Pvwr2q35ECvs2M1G88yDxNw1vH3RxGbuieko5\nr2mrBNFDkEgRcJ/0SBaC5KxfSgzyD1DG7kIGkkNb3kpcb85MfC7+XXh7tIKrnARA\nH0yn46OECyoBwq2nu6rjDAcCAwEAAQ==\n-----END PUBLIC KEY-----\n","timestamp":1714540361565}

? enter msg hello from remote
? enter msg recv -> {"id":"s2KC8FEyBCPve0qvzrd4x","msgType":"FRAME_CON","data":"FcKhbqZ3oATTxecvXnDHAKXNXtRMf0Phd2tmijTcmAxx1kOt24qrUdj8fZIYTr7gPmBFR2+YJfDScS3T/zgC7EiAd3niD5OVb/8jx9wsGhbtVFyjtAeZIUeunuVlXFJsaPS3KlhGRleGEl2suzSp7FE9NE2HNEbPgz95Flt4uosmH9BmP7zytNR/1wnWN6kRskUrRRCTd6AVkjX8pBCb5S8e3ii18NwLx8YxLS5tOA2CG5CRfHFiu9z5II0DjvMFT1QRX7UDTVNagjcCdtCXxceOvlOe4UZCcF2f/HofFvrssED4EzFDw9Hiad6N0EPLB3TsYOSJleiIDJHW58z9yaKJ+Dq4lijSm8DytWuipsdmPZ/PG6/vGI04dTQlKLLCGoPCm+sBTHeQrtlwjUvHGp/Gri3tg8N76Fl3SxZE+vkfXzWESHqPRQk6/fCPuC4WfOhMsgo8DYEf7CHGlSbY/miZOp/wUz84LvDbRakSLNEzKaIEMkh9VWQNAf0rzmPQM+hwNX5CXBI1J51jzRoZq9yXAuGVhkaheORkcBmx90pyoFYfP/1w5JepsyhkRZUtkf2AesCYXo8FTaXx0sglsAfa0CnHas/1+qmPDStUe+lMacwD7SRSj1jE8alcDd03cHDk5IRysdeIymvNSR10rpfETQqw2Yotnf2KNQXcLmA=","timestamp":1714540415719}
decrypted -> hello from controller
```

Controller terminal prompt
```sh
$ bun run ./src/cmd/controller.ts
? enter key J56gu33FezFo0DO
http://localhost:3000/J56gu33FezFo0DO
recv -> {"id":"pTWAwu5_Gt4zuVFlRXEv0","msgType":"CHALLENGE","data":"xrV5IFdrmDIqB5KMCad5Rvo6O162RLct9z2bYPR5ZLkiVghrCy7EViYGOCVxNfvG","timestamp":1714540361009}
recv -> {"id":"CA_01ubVutKe9Kr0Cf8vm","msgType":"SEND_CONPUB","data":null,"timestamp":1714540361562}
recv -> {"id":"J86iYIsRxXdXLpUgUazFu","msgType":"ACK","data":null,"timestamp":1714540361567}
ack
? enter msg recv -> {"id":"K8CdODSDSDP_eDKlu1xpO","msgType":"FRAME_REM","data":"fultewdS6SLKDHdDMbzOeK0Aj+8ji/EQOLSCCUfobiLIYBdrBeioExdtiNbjekyCSFWiLuGoYSg5UWShDd/GW09k6AOKa7RgvVm2n5+vechYbSYz6Wj+oximt4/yrHZaI/oVpGWsVITn3F5QqIX98rT803L9dcx0/Pp6xyRmmAfIucbHGm1BUggNwmG0VQ9lGajzOy5WhOKKKzit32rgWlVkPpJuG5HfrlZTt8uR66lea4gyCB9EaeXLtSIHPF85LQ9YMW6FCNd5O98NxHY/4C9IOCBvC4E0CpfMUA7j/Sci625wkXIMvTQxK5/WxsDFAWAQ9ybyy3YGAg5QUgKlnLXZeM5OcjLd5SBbWwRbELhhAeZ8qr1Cdxyw/FunaD+rspdgjuTYFJIyAMPfxeG7Lf6L6rUNhO8+aUUtnfv94D9Nwd0Sc1cE/8bYbHI9JtFuvuS4rnHps9g+NpYqm7oXtJzuU912oi4yKKE41HqaCCYbhD3eLFn02nAdx0U9+i5o+euSzWpJM9YbJAdzxYuNGAqCBdB4klNOKw+qySrEUEDufAg/HGfNQUb3jAgO9aoLnj0g8N5avevN+7whBxqtcXGwzRVkQ4rs/S42xWV0pnS18faoIxqmpBLLGW5ryxVsds8fhsB6P80iBWrz0ln+mEKz2iljNzIR/alToEiWRAA=","timestamp":1714540408629}
decrypted -> hello from remote
? enter msg hello from controller
? enter msg
```
