// mongoDBConnectionManager.js
const { MongoClient } = require("mongodb");

class MongoDBConnectionManager {
  constructor() {
    this.connections = {}; // Almacena las conexiones por nombre de la base de datos
    this.client = null; // Cliente único para todas las bases de datos
  }

  async connect(uri) {
    if (!this.client) {
      this.client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      await this.client.connect();
      console.log("Conexión al servidor de MongoDB establecida.");
    }
  }

  isConnected() {
    // Verifica si el cliente existe y está conectado
    return (
      this.client && this.client.topology && this.client.topology.isConnected()
    );
  }

  async getDatabase(dbName) {
    if (!this.client) {
      throw new Error(
        "Debes conectar al servidor antes de obtener una base de datos."
      );
    }

    // Si ya existe una conexión para esta base de datos, la reutilizamos
    if (!this.connections[dbName]) {
      this.connections[dbName] = this.client.db(dbName);
      console.log(`Conexión creada para la base de datos: ${dbName}`);
    }

    return this.connections[dbName];
  }

  async closeAllConnections() {
    if (this.client) {
      await this.client.close();
      this.connections = {};
      this.client = null;
      console.log("Todas las conexiones a MongoDB han sido cerradas.");
    }
  }
}

// Exportamos una instancia única del administrador de conexiones
const mongoDBConnectionManager = new MongoDBConnectionManager();
module.exports = mongoDBConnectionManager;
