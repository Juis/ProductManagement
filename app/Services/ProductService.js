'use strict'

const Product = use('App/Models/Product')

class ProductService {
	async findAll({ params, response }) {
		try {
			let { page, perPage } = params

			if (!page) {
				return response.status(400).send("You must provide a page.")
			} else if (isNaN(page)) {
				return response.status(400).send("Page accepts integer only.")
			}

			if (!perPage) {
				return response.status(400).send("You must provide a perPage.")
			} else if (isNaN(perPage)) {
				return response.status(400).send("PerPage accepts integer only.")
			}

			const products = await Product.query().with('images').paginate(page, perPage)

			return response.ok(products)
		} catch (error) {
			return response.status(error.status).send(error)
		}
	}

	async findOne({ params, response }) {
		try {
			const { id } = params

			if (isNaN(id)) {
				return response.status(400).send("Id accepts integer only.")
			}

			const product = await Product.query().where('id', id).with('images').first()
			if (!product) {
				return response.status(400).send({ message: "No records found." })
			}

			return response.ok(product)
		} catch (error) {
			return response.status(error.status).send(error)
		}
	}

	async register({ request, response }) {
		try {
			const { name, description, price, published_at } = request.only(['name', 'description', 'price', 'published_at'])
			const product = new Product()

			product.name = name
			product.description = description
			product.price = price
			product.published_at = published_at

			await product.save()
			return response.ok(product)
		} catch (error) {
			return response.status(error.status).send(error)
		}
	}

	async delete({ params, response }) {
		try {
			const { id } = params

			if (isNaN(id)) {
				return response.status(400).send("Id accepts integer only.")
			}

			await Product
				.query()
				.where("id", id)
				.update({
					"active": 0
				})

			return response.ok({ message: "Successfully removed." })
		} catch (error) {
			return response.status(error.status).send(error)
		}
	}

	async update({ params, request, response }) {
		try {
			const { id } = params
			let { name, description, price, published_at } = request.only(['name', 'description', 'price', 'published_at'])

			if (isNaN(id)) {
				return response.status(400).send("Id accepts integer only.")
			}

			let product = await Product.query().where("id", id).first()
			if (!product) {
				return response.status(400).send({ message: "Product not found." })
			}

			await Product
				.query()
				.where("id", id)
				.update({
					"name": name,
					"description": description,
					"price": price,
					"published_at": published_at
				})

			product = await Product.query().where("id", id).first()
			return response.ok(product)
		} catch (error) {
			return response.status(error.status).send(error)
		}
	}
}

module.exports = ProductService
