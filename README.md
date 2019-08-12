# Helix Wallet
```
WALLET IS IN ACTIVE DEVELOPMENT. CODE IS NOT OPTIMIZED FOR PRODUCTION.
```

## Prerequisites

- Node.js (10.16.0)
- Electron (npm install electron -g)
- Yarn >= v1.16.0
- Python 2.7


On **Windows** platforms you'll need to install build tools to compile native modules:

```
# Install Visual C++ Build Tools and Python 2.7
npm install --global --production windows-build-tools --vs2015

# Install OpenSSL VC++ Static 64bit Library
git clone https://github.com/Microsoft/vcpkg C:\src\vcpkg
cd C:\src\vcpkg
.\bootstrap-vcpkg.bat
.\vcpkg install openssl:x64-windows-static
```
Additionally on **Windows 7** install [.NET Framework 4.5.1](https://www.microsoft.com/en-us/download/details.aspx?id=40773)

On **Linux** platforms you'll need to install additional packages to compile native modules:

```
sudo apt install build-essential libudev-dev libusb-1.0-0 libusb-1.0-0-dev
sudo apt install gcc-4.8 g++-4.8 && export CXX=g++-4.8

```
## Instructions

1. Clone this repo
```
git clone https://github.com/netobjex/wallet.git
```

2. Go to the wallet directory
```
cd wallet
```

3. Install the shared dependencies
```
yarn run deps:shared
```

4. Install the desktop dependencies
```
yarn run deps:desktop
```

5. Run desktop application
```
yarn run start:desktop
```

6. Package app for Windows

```
yarn run package:win
```
7. Package app for Linux

```
yarn run package:linux
```
