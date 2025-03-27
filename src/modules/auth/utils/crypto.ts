import crypto from 'node:crypto';
import fs from 'node:fs';
import { join } from 'node:path';

interface UserKeys {
  private_key: string;
  public_key: string;
}

export function readUserKeys(user_id: string): UserKeys {
  const private_key_path = join(
    __dirname,
    `../../../secure/${user_id}/private.key`,
  );

  const public_key_path = join(__dirname, `../../secure/${user_id}/public.key`);

  return {
    private_key: fs.readFileSync(private_key_path, 'utf-8'),
    public_key: fs.readFileSync(public_key_path, 'utf-8'),
  };
}

export function readOrCreateUserKey(user_id: string): UserKeys {
  const key_path = join(__dirname, `../secure/${user_id}`);
  // console.log(key_path)
  !fs.existsSync(key_path) && fs.mkdirSync(key_path, { recursive: true });

  const private_key_path = join(
    __dirname,
    `../secure/${user_id}/private.key`,
  );
  const public_key_path = join(__dirname, `../secure/${user_id}/public.key`);

  const private_key_exist = fs.existsSync(private_key_path);
  const public_key_exist = fs.existsSync(public_key_path);

  if (!private_key_exist || !public_key_exist) {
    console.log(`Generating new key pair...`);
    try {
      const { private_key, public_key } = generateKeyPairAsync();
      console.log(`Keys generated successfully`);

      fs.writeFileSync(private_key_path, private_key);
      console.log(`Private key written successfully`);

      fs.writeFileSync(public_key_path, public_key);
      console.log(`Public key written successfully`);
    } catch (error) {
      console.error(`Error during key generation or writing: ${error.message}`);
      throw error;
    }
  } else {
    console.log(`Using existing keys`);
  }

  return {
    private_key: fs.readFileSync(private_key_path, 'utf-8'),
    public_key: fs.readFileSync(public_key_path, 'utf-8'),
  };
}

export const generateKeyPairAsync = () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return { private_key: privateKey, public_key: publicKey };
};
