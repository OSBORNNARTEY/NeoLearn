require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const url = require('url');
const connectToDatabase = require('./db');
let db;

connectToDatabase().then(connection => {
  db = connection.db;
  console.log('Connected to MongoDB');
});


const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404); res.end('File not found');
    } else {
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      res.end(data);
    }
  });
}

http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'GET') {
    if (req.url === '/') {
      serveFile(res, './public/login.html');
    } else if (req.url.startsWith('/public/')) {
      serveFile(res, '.' + req.url);
    } else if (req.url === '/signup') {
      serveFile(res, './public/signup.html');
    } else if (req.url === '/login') {
      serveFile(res, './public/login.html');
    } else if (req.url === '/dashboard') {
      serveFile(res, './public/dashboard.html');
    }
  }

  if (req.method === 'POST') {
    if (req.url === '/signup') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        const data = new URLSearchParams(body);
        const username = data.get('username');
        const password = await bcrypt.hash(data.get('password'), 10);
        await db.collection('users').insertOne({ username, password });
        res.writeHead(302, { Location: '/login' });
        res.end();
      });
    }

    if (req.url === '/login') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        const data = new URLSearchParams(body);
        const user = await db.collection('users').findOne({ username: data.get('username') });
        if (user && await bcrypt.compare(data.get('password'), user.password)) {
          res.writeHead(302, { Location: '/dashboard' });
          res.end();
        } else {
          res.writeHead(401); res.end('Login failed');
        }
      });
    }
  }
}).listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
