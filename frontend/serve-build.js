const fs = require('fs')
const http = require('http')
const net = require('net')
const path = require('path')

const port = Number(process.env.PORT || 3000)
const backendHost = process.env.BACKEND_HOST || 'localhost'
const backendPort = Number(process.env.BACKEND_PORT || 8080)
const buildDir = path.join(__dirname, 'build')

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
}

function proxyRequest(req, res) {
  const options = {
    hostname: backendHost,
    port: backendPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `${backendHost}:${backendPort}` },
  }

  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers)
    proxyRes.pipe(res)
  })

  proxy.on('error', () => {
    res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Backend is unavailable')
  })

  req.pipe(proxy)
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, `http://localhost:${port}`).pathname)
  const requestedPath = path.normalize(path.join(buildDir, urlPath))
  const safePath = requestedPath.startsWith(buildDir) ? requestedPath : buildDir
  const filePath = fs.existsSync(safePath) && fs.statSync(safePath).isFile()
    ? safePath
    : path.join(buildDir, 'index.html')
  const ext = path.extname(filePath)

  res.writeHead(200, { 'content-type': contentTypes[ext] || 'application/octet-stream' })
  fs.createReadStream(filePath).pipe(res)
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/ws')) {
    proxyRequest(req, res)
    return
  }

  serveStatic(req, res)
})

server.on('upgrade', (req, socket, head) => {
  if (!req.url.startsWith('/ws')) {
    socket.destroy()
    return
  }

  const backend = net.connect(backendPort, backendHost, () => {
    backend.write(`${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`)
    for (const [name, value] of Object.entries(req.headers)) {
      backend.write(`${name}: ${value}\r\n`)
    }
    backend.write('\r\n')
    backend.write(head)
    backend.pipe(socket)
    socket.pipe(backend)
  })

  backend.on('error', () => socket.destroy())
})

server.listen(port, () => {
  console.log(`Serving React build at http://localhost:${port}`)
  console.log(`Proxying /api and /ws to http://${backendHost}:${backendPort}`)
})
