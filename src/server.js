const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Configuração do banco de dados (substitua com as variáveis de ambiente se preferir)
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
    try {
        await pool.query(createTableQuery);
        console.log("Tabela 'movies_series' verificada/criada com sucesso.");
    } catch (err) {
        console.error('Erro ao verificar/criar a tabela:', err);
    }
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public')); // Serve arquivos estáticos da pasta public

// Rota para obter filmes e séries
app.get('/api/movies-series', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM movies_series');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar filmes e séries');
    }
});

// Rota para o cadastro
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

// Rota para a página de cadastro
app.get('/cadastro', (req, res) => {
    res.sendFile(__dirname + '/public/cadastro.html');
});

// Rota para excluir filmes e séries
app.delete('/api/movies-series/:id', (req, res) => {
    const id = req.params.id;
    pool.query('DELETE FROM movies_series WHERE id = $1', [id])
        .then(() => res.sendStatus(204)) // No Content
        .catch(err => res.status(500).send('Erro ao excluir o filme/série.'));
});

// Inicializar servidor e criar tabela
app.listen(port, async () => {
    console.log(`Servidor rodando na porta ${port}`);
    await createTableIfNotExists(); // Verifica ou cria a tabela ao iniciar
});
