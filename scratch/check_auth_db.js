const { DataSource } = require('typeorm');
const path = require('path');

// Entity definition (simplified for script)
class User {
  constructor(id, email, fullName) {
    this.id = id;
    this.email = email;
    this.fullName = fullName;
  }
}

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '123',
  database: 'auth_db',
  synchronize: false,
  entities: [], // We'll use raw query
});

async function main() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
    
    const users = await AppDataSource.query('SELECT id, email, "fullName" FROM users');
    console.log('Users in auth_db:', JSON.stringify(users, null, 2));
    
  } catch (err) {
    console.error('Error during Data Source initialization', err);
    
    // Try with default password 'postgres' if '123' fails
    try {
        console.log('Retrying with default password...');
        const ds2 = new DataSource({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'postgres',
            database: 'auth_db',
            synchronize: false,
        });
        await ds2.initialize();
        const users = await ds2.query('SELECT id, email, "fullName" FROM users');
        console.log('Users in auth_db (retry):', JSON.stringify(users, null, 2));
        await ds2.destroy();
    } catch (err2) {
        console.error('Retry failed:', err2.message);
    }
  } finally {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
  }
}

main();
