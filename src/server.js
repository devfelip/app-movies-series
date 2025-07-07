const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Configuração do banco de dados
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Função para criar a tabela automaticamente se não existir
async function createTableIfNotExists() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS movies_series (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL,
            description TEXT,
            image TEXT
        );
    `;
    await pool.query(createTableQuery);
    console.log("Tabela 'movies_series' verificada/criada com sucesso.");
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Rotas
app.get('/api/movies-series', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM movies_series');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar filmes e séries');
    }
});

app.post('/cadastro', async (req, res) => {
    const { title, type, description, image } = req.body;
    try {
        await pool.query(
            'INSERT INTO movies_series (title, type, description, image) VALUES ($1, $2, $3, $4)', 
            [title, type, description, image]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao cadastrar filme/série');
    }
});

app.get('/cadastro', (req, res) => {
    res.sendFile(__dirname + '/public/cadastro.html');
});

app.delete('/api/movies-series/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await pool.query('DELETE FROM movies_series WHERE id = $1', [id]);
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao excluir o filme/série.');
    }
});

// Função para tentar conectar até conseguir
async function connectAndStart() {
    while (true) {
        try {
            console.log('Tentando conectar ao banco...');
            await pool.query('SELECT 1'); // teste de conexão simples
            console.log('Conexão com o banco estabelecida!');
            await createTableIfNotExists();
            app.listen(port, () => {
                console.log(`Servidor rodando na porta ${port}`);
            });
            break; // sai do loop após sucesso
        } catch (err) {
            console.error('Falha ao conectar ao banco, tentando novamente em 5 segundos...', err.message);
            await new Promise(res => setTimeout(res, 5000)); // espera 5 segundos
        }
    }
}

// Inicia tudo
connectAndStart();
