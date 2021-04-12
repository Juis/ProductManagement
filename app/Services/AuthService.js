'use strict'

const User = use('App/Models/User')
const Encryption = use('Encryption')
const Token = use('App/Models/Token')
const Mail = use('Mail')
const Decode = require('jwt-decode')

class AuthService {
	async login({ request, response, auth }) {
		try {
			const { email, password } = request.only(['email', 'password'])
			const data = await auth.withRefreshToken().attempt(email, password)
			return response.ok(data)
		} catch (error) {
			return response.status(error.status).send(error)
		}
	}

	async register({ request, response, auth }) {
		try {
			const { name, email, password } = request.only(['name', 'email', 'password'])

			const user = new User()

			user.name = name
			user.email = email
			user.password = password

			await user.save()

			const { token } = await auth.generate(user)

			user.token = token

			await Mail.send('emails.confirm', user.toJSON(), (message) => {
				message.to(user.email)
					.from('lucas@gmail.com')
					.subject('Email confirmation')
			}).catch((error) => {
				return response.status(error.status).send(error)
			})

			return response.ok({ message: "Successfully registered." })
		} catch (error) {
			return response.status(error.status).send(error)
		}
	}

	async logout({ request, response, auth }) {
		try {
			const { refreshToken } = request.only(['refreshToken'])

			const decrypted = Encryption.decrypt(refreshToken)

			if (decrypted != null) {
				const isToken = await Token.findBy("token", decrypted)

				isToken.delete()
				return response.ok({ message: "Logged off successfully." })
			} else {
				return response.status(500).send({ message: "Invalid token." })
			}
		} catch (error) {
			return response.status(error.status).send(error)
		}
	}

	async confirmRegister({ params, request, response, auth }) {
		try {
			const { token } = params
			const { uid } = Decode(token)

			await User
				.query()
				.where('id', uid)
				.update({ active: 1 })

			return response.ok({ message: "Email confirmed successfully." })
		} catch (error) {
			return response.status(error.status).send(error)
		}
	}

}

module.exports = AuthService
