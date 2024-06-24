import { EmpleadosModel } from "../../Register/models/empleados.js"
import { validateEmpleado } from "../../Register/schemas/empleados.js"
import jwt from 'jsonwebtoken'
import bycrypt from 'bcrypt'
import 'dotenv/config'

export class LoginController {
  home = async (req, res) => {
    const {user} = req.session
    if (!user) return res.redirect('/login')
    res.render('Login/home', user)
  }

  show = async (req, res) => {
    const {user} = req.session
    if (user) return res.redirect('/login/home')
    res.render('Login/login')
  }

  login = async (req, res) => {
    var {user} = req.session
    if (user) return res.redirect('/login/home')
    
    const result = await validateEmpleado(req.body, false)
    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    var user = await EmpleadosModel.find({ user: result.data.user })
    const isValid = await bycrypt.compare(result.data.password, user.password)
    if (!isValid){
      return res.status(400).json({ message: 'Invalid password' })
    }
    user = {
      user: user.user
    }
    const token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: '1h'
    })
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 180
    }).send("<a href='login/home'>Home</a>")
  }

  logout = async (req, res) => {
    res.clearCookie('access_token').redirect('/login')
  }

  GetStyle = async (req, res) => {
    res.sendFile(process.cwd() + '/views/Login/assets/style.css')
  }
}
