import mysql from 'mysql2/promise';
import { randomUUID, randomBytes, scryptSync } from 'node:crypto';

const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Konfigurasi ${key} belum diisi pada .env.local.`);
    process.exit(1);
  }
}
const password = process.env.ADMIN_PASSWORD;
if (password.length < 12 || /^(CHANGE_ME|GANTI|MASUKKAN|EXAMPLE|ISI_)/i.test(password)) {
  console.error('Ganti ADMIN_PASSWORD dengan password pribadi minimal 12 karakter; jangan gunakan nilai contoh.');
  process.exit(1);
}
const salt = randomBytes(16).toString('hex');
const passwordHash = `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`;
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
});
try {
  const id = randomUUID();
  await connection.execute(
    `INSERT INTO profiles (id, full_name, email, phone, password_hash, role)
     VALUES (?, ?, ?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), phone=VALUES(phone), password_hash=VALUES(password_hash), role='admin'`,
    [id, process.env.ADMIN_NAME || 'Administrator SS.Coffee', process.env.ADMIN_EMAIL.toLowerCase(), process.env.ADMIN_PHONE || null, passwordHash],
  );
  console.log(`Akun admin siap: ${process.env.ADMIN_EMAIL.toLowerCase()}`);
} finally {
  await connection.end();
}
