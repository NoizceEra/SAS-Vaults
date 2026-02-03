import json
import base58

with open('target/deploy/auto_savings-keypair.json', 'r') as f:
    keypair_bytes = json.load(f)

# Get the public key (last 32 bytes)
public_key_bytes = bytes(keypair_bytes[32:64])
public_key = base58.b58encode(public_key_bytes).decode('utf-8')

print(public_key)
with open('program_id.txt', 'w') as f:
    f.write(public_key)
