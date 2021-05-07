const express = require('express')
const bodyParser = require('body-parser')
const { body, validationResult } = require('express-validator')

const connection = require('./database/dbConnection')

const Clients = require('./src/models/clients')

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.set('views', './src/views')
app.set('view engine', 'ejs')

app.use(express.static('./src/public'))

// Rotas
// rota para cadastrar clientes
app.get('/', (req, res) => {
  nameErro = []
  emailErro = []

  res.render('index', {nameErro, emailErro})
})

// rota para listar clientes
app.get('/clientes', (req, res) => {
  Clients.findAll({ raw: true, order: [
    ['id', 'ASC']
  ]})
  .then(clients => {
    res.render('clients', {clients})
  })
})

// rota do cliente
app.get('/cliente/:id', (req, res) => {
  Clients.findOne({
    where: {id: req.params.id}
  })
  .then(client => {
    res.render('client', { client })
  })
  .catch(error => {
    console.log("Cliente não encontrado.")
    res.redirect('/clientes')
  })
})

// rota para salvar clientes
app.post('/save', [
  body("name")
    .isLength({ min:3, max: 30 })
    .withMessage("Esse campo é obrigatório."),
  body("email")
    .isEmail()
    .withMessage("Digite um e-mail válido.")
], (req, res) => {
  const resultErros = validationResult(req)

  nameErro = []
  emailErro = []

  if(!resultErros.isEmpty()) {
    const erros = resultErros.errors

    erros.map(erro => {
      if(erro.param == 'name') {
        nameErro.push(erro.msg)
      }
      if (erro.param == 'email') {
        emailErro.push(erro.msg)
      }
    })

    console.log(nameErro)
    console.log(req.body.name)
    res.render('index', { nameErro, emailErro })
  } else {
    const name = req.body.name
    const email = req.body.email
    const cpf = req.body.cpf
    const phone = req.body.phone
    const cep = req.body.cep
    const street = req.body.street
    const number = req.body.number
    const district = req.body.name
    const city = req.body.city
    const state = req.body.state

    Clients.create({
      name,
      email,
      cpf,
      phone,
      cep,
      street,
      number,
      district,
      city,
      state
    })
    .then(() => res.redirect('/clientes'))
    .catch(error => res.redirect('/'))
    }
})

// rota para editar clientes
app.get('/cliente/edit/:id', (req, res) => {
  Clients.findOne({
    where: {id: req.params.id}
  })
  .then(client => {
    res.render('editClient', { client })
  })
  .catch(error => {
    console.log("Cliente não encontrado.")
    res.redirect('/clientes')
  })
})

// rota para salvar edição
app.post('/clientes/update', (req, res) => {
    const {
      id, name, email, cpf, phone,
      cep, street, number,
      district, city, state
    } = req.body

    Clients.update({
      name, email, cpf, phone,
      cep, street, number,
      district, city, state
    }, {
      where: {
        id
      }
    }).then(() => {
      console.log("Cliente editado")
      res.redirect('/clientes')
    })
})

// rota para deletar cliente
app.get('/delete/:id', (req, res) => {
  Clients.destroy({
    where: {
      id: req.params.id
    }
  }).then(() => {
    console.log("Deletado com sucesso!")
    res.redirect('/clientes')
  }).catch(error => {
    console.log("Erro ao deletar!")
    res.redirect('/clientes')
  })
})

// Conexão banco de dados
connection
  .authenticate()
    .then(() => console.log('Conectado ao banco de dados.'))
    .catch(error => console.log('Erro ao tentar conectar no banco de dados', error))

app.listen(3000, () => console.log("Servidor rodando na porta 3000"))