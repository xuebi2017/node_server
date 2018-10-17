var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if(!port){
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function(request, response){
  var parsedUrl = url.parse(request.url, true)
  console.log('request.url',request.url)
  var path = request.url 
  var query = ''
  if(path.indexOf('?') >= 0){ query = path.substring(path.indexOf('?')) }
  var pathNoQuery = parsedUrl.pathname
  var queryObject = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/
  console.log('方方说：得到 HTTP 路径\n' + path)
  console.log('方方说：查询字符串为\n' + query)
  console.log('方方说：不含查询字符串的路径为\n' + pathNoQuery)
  console.log('path',path)
  if(path === '/signup', method === 'GET') {
    console.log(11111111111)
    let string = fs.readFileSync('./signup.html', 'utf8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  }else if(path === '/signup', method === 'POST') {
    console.log(222222222)
    readBody(request).then((body) => {
      let strings = body.split('&')
      let hash = {}
      for(string of strings) {
        let part = string.split('=')
        let key = part[0]
        let value = part[1]
        hash[key] = decodeURIComponent(value)
      }
      console.log('hash', hash)
      let {email, password, password_confirmation} = hash
      if(email.indexOf('@') === -1) {
        console.log('email', email)
        response.statusCode = 400
        response.setHeader('Content-Type', 'application/json;charset=utf-8')
        console.log(response.statusCode)
        response.write(`{
          "errors": {
            "email": "invalid"
          }
        }`)
        response.end()
      }else if(password !== password_confirmation) {
        response.statusCode = 400
        response.write('password not match')
        response.end()
      }else {
        let users = fs.readFileSync('./db/users.json', 'utf8')
        console.log('users111', users)
        try {
          users = JSON.parse(users)
          console.log('users222',users)
        }catch(e) {
          users = []
        }
        let inUse = false
        for(user of users) {
          if(user.email === email) {
             inUse = true
             break
          }
        }
        if(inUse) {
          response.statusCode = 400
          response.setHeader('Content-Type', 'application/json;charset=utf-8')
          response.write(`{
            "errors": {
              "email": "in use"
            }
          }`)
          response.end()
        }else {
          users.push({email: email, password: password})
          var usersString = JSON.stringify(users)
          fs.writeFileSync('./db/users.json', usersString)
          console.log('email11',email)
          response.statusCode = 200
          response.end()
        }
      }
    }, (res) => {
      console.log(2222222222222222)
    })
  }else if(path === '/signin') {
    let string = fs.readFileSync('./signin.html', 'utf8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  }

  function readBody(request) {
    return new Promise((resolve, reject) => {
      let body = []
      request.on('data', (chunk) => {
        body.push(chunk)
      }).on('end', () => {
        body = Buffer.concat(body).toString()
        console.log('body',body)
        resolve(body)
      })
    })
  }






  /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)

