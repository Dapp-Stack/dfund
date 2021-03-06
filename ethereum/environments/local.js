const secrets = require("@dapp-stack/secrets");
const ethers = require("ethers");

// const decryptedSecrets = JSON.parse(secrets.decrypt());

async function deployToken(tkn, deployer) {
  const token = await deployer.deploy(`${tkn}Token`);
  const address = await deployer.signer.getAddress()
  await deployer.deploy(`${tkn}Crowdsale`, 1, address, token.address);
}

async function deployENSProtocol(deployer) {
  await deployer.ens.bootstrapWith('petition', 'eth');
}

async function deployController(deployer) {
  const controller = await deployer.deploy('Controller');
}

module.exports = {
  compile: {
    // List of contracts to compile
    solidity: {
      "0.5.0": [
        'Identity/Identity.sol',
        'Aapl/AaplToken.sol',
        'Snt/SntToken.sol',
        'Das/DasToken.sol',
        'Aapl/AaplCrowdsale.sol',
        'Snt/SntCrowdsale.sol',
        'Das/DasCrowdsale.sol',
        'Fund/Fund.sol',
        'Fund/Democracy.sol',
        'Fund/Controller.sol',
      ]
    },

    // List of vyper contracts to compile
    // vyper: [
    // ]

    // Optimize solidity compilation, you can learn more about it here:
    // https://solidity.readthedocs.io/en/v0.4.24/using-the-compiler.html
    optimizer: {
      enabled: true,
      runs: 200
    },
  },

  // Ethererum configuration, it can be false if not needed
  ethereum: {
    // The name of the network you want to start/connect
    // Default value is dev
    // Possible values are: homestead, rinkeby, ropsten, kovan, dev and external
    // In case of external, the expected url will be http://localhost:8545
    // network: 'dev',

    // If the network is public (homestead, rinkeby, ropsten or kovan)
    // you can set your infura API key with this setting.
    // apiKey: decryptedSecrets.rinkeby.infuraApiKey,

    // If the network is public (homestead, rinkeby, ropsten or kovan)
    // the mnemonic is required in order to deploy the contracts.
    // Make sure it is funded.
    // mnemonic: decryptedSecrets.rinkeby.mnemonic,

    // Function executed by DApp Stack to deploy the contracts.
    migrate: async (deployer) => {
      await deployENSProtocol(deployer);
      await deployToken('Aapl', deployer);
      await deployToken('Snt', deployer);
      await deployToken('Das', deployer);
      await deployController(deployer);
    }
  },

  // IPFS configuration, if can be true or false
  // In case if true, an IPFS daemon will be started at http://localhost:5001
  // Default value is false
  ipfs: true,

  // Web configuration
  web: {
    // The web framework you are using.
    // Default value is react
    // Possible values are: create-react-app, angular, vue, test, next and false
    framework: false,

    // How to deploy the assets,
    // Default value is ipfs
    // Possible values are: ipfs and false
    deploy: 'ipfs',
  },
};
