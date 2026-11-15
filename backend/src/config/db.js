import mysql from "mysql2/promise";

export let db = null;

export async function conectarDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_DATABASE,
      dateStrings: true,
    });
    console.log("Conectado a la base de datos");
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

const TABLAS = ['usuarios', 'vehiculos', 'conductores', 'viajes'];

export async function reiniciarAutoIncremento(tabla) {
  if (!TABLAS.includes(tabla)) {
    throw new Error(`Tabla no permitida: ${tabla}`);
  }
  await db.query(`ALTER TABLE \`${tabla}\` AUTO_INCREMENT = 1`);
}
