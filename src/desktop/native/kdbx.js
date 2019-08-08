const argon2 = require("argon2");
const kdbxweb = require("kdbxweb");

/**
 * Bind kdbxweb and argon2
 */
kdbxweb.CryptoEngine.argon2 = (
  password,
  salt,
  memory,
  iterations,
  length,
  parallelism,
  type,
  version
) => {
  return argon2.hash(password, {
    hashLength: length,
    timeCost: iterations,
    memoryCost: memory,
    parallelism,
    type,
    version,
    salt: Buffer.from(salt),
    raw: true
  });
};

/**
 * Encrypt seed to KDBX database format
 * @param {array} Seeds - Array of txByte array seeds an their titles
 * @param {string} Password - Plain text password for encryption
 * @returns {arrayBuffer} Encrypted KDBX binary content
 */
const exportVault = async (seeds, password) => {
  const credentials = new kdbxweb.Credentials(
    kdbxweb.ProtectedValue.fromString(password)
  );
  const db = kdbxweb.Kdbx.create(credentials, "Helix");

  db.upgrade();

  for (let i = 0; i < seeds.length; i++) {
    const entry = db.createEntry(db.getDefaultGroup());
    entry.fields.Title = seeds[i].title || `HELIX Seed #${i + 1}`;
    entry.fields.Seed = kdbxweb.ProtectedValue.fromString(
      seeds[i].seed
        .map(txByte => "abcdef0123456789".charAt(txByte % 16))
        .join("")
    );
  }

  const chunk = await db.save();

  return chunk;
};

/**
 * Get seed from encrypt KDBX database
 * @param {arrayBuffer} Db - Encrypted binary KDBX database
 * @param {string} Password - Plain text password for decryption
 * @returns {array} Array of decrypted txByte array seeds
 */
const importVault = async (buffer, password) => {
  const credentials = new kdbxweb.Credentials(
    kdbxweb.ProtectedValue.fromString(password)
  );

  const db = await kdbxweb.Kdbx.load(buffer, credentials);
  const entries = db.getDefaultGroup().entries;
  const seeds = [];

  for (let i = 0; i < entries.length; i++) {
    if (entries[i].fields.Seed) {
      seeds.push({
        title: entries[i].fields.Title || `Seed #${i + 1}`,
        seed: entries[i].fields.Seed.getText()
          .split("")
          .map(char => "abcdef0123456789".indexOf(char.toLowerCase()))
          .filter(txByte => txByte > -1)
      });
    }
  }

  return seeds;
};

const kdbx = {
  exportVault,
  importVault
};

module.exports = kdbx;
