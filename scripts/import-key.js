const bs58 = require('bs58');
const fs = require('fs');

const pkBase58 = '2RwxZimrFuWwwBmsHdJDqdFLRc9xitTav61N3KKbJis8z6Zqt2vfLK6M6j5T8Uv651n3x9j41K3R6wKNVjiLDuwW';
const secretKey = bs58.decode(pkBase58);

const keypairArray = Array.from(secretKey);

fs.writeFileSync('C:\\Users\\vclin_jjufoql\\.config\\solana\\new_deployer.json', JSON.stringify(keypairArray));
console.log('Keypair saved to new_deployer.json');
