import { Cart } from "./models/cart.model.js";
import { Product } from "./models/product.model.js";
import ProductManager from "./Product.service.js";
import mongoose from "mongoose";
const { Types } = mongoose;
const Pmanager = new ProductManager();

class CartManager {
    constructor(){}
    async getProductsInCart(userId) {
        try {
            const cart = await Cart.findOne({ user: userId });

            if (!cart) {
                console.log('No se encontró un carrito para el usuario.' +userId );
                return [];
            }

            return cart.products;
        } catch (error) {
            console.error('Error al obtener productos del carrito:', error);
            return null;
        }
    }

    async addProductToCart(userId, _id) {
        console.log("id llegando" +_id);
        try {
            const productToAdd = await Pmanager.getProductBy_id(_id);
            if (!productToAdd) {
                throw generateErrorInfo(EErrors.INVALID_TYPE_ERROR, 'El producto no existe', { productId: _id });
            }

            let cart = await Cart.findOne({ user: userId });

            if (!cart) {
                const newCart = new Cart({
                    user: userId,
                    products: [{
                        productId: _id,
                        quantity: 1,
                        name: productToAdd.title,
                        price: productToAdd.price,
                    }],
                });

                await newCart.save();
                console.log('Nuevo carrito creado exitosamente con un producto.');
                return newCart;
            }

            const existingProduct = cart.products.find(item => {
                const itemProductId = String(item.productId);
                const inputId = String(_id);

                console.log('itemProductId:', itemProductId);
                console.log('inputId:', inputId);

                return itemProductId === inputId;
            });

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.products.push({
                    productId: _id,
                    quantity: 1,
                    name: productToAdd.title,
                    price: productToAdd.price,
                });
            }

            await cart.save();
            console.log(`Producto ${productToAdd.title} agregado al carrito exitosamente.`);

            return cart;
        } catch (error) {
            if (error instanceof CustomError) {
                console.error(`Error personalizado (${error.name}):`, error.details);
                return { success: false, message: error.message };
            } else {
                console.error('Error al agregar producto al carrito:', error);
                return { success: false, message: 'Error interno del servidor' };
            }
        }
    }
      
      async removeFromCart(userId, _id) {
        try {
            const cart = await Cart.findOne({ user: userId });
    
           
    
            if (!cart) {
                return { success: false, message: 'No se encontró un carrito para el usuario' };
            }
    
            const productIndex = cart.products.findIndex(product => String(product.productId) === String(_id));
    
            if (productIndex === -1) {
                return { success: false, message: 'El producto no está en el carrito' };
            }
    
            cart.products.splice(productIndex, 1);
            await cart.save();
    
            console.log(`Producto ${_id} eliminado del carrito exitosamente.`);
            return { success: true, message: `Producto ${_id} eliminado del carrito` };
        } catch (error) {
            console.error('Error al eliminar producto del carrito:', error);
            return { success: false, message: 'Error interno del servidor' };
        }
    }
    

    async removeAllProductsFromCart(userId) {
        try {
            const cart = await Cart.findOne({ user: userId });

            if (!cart) {
                return { success: false, message: 'No se encontró un carrito para el usuario' };
            }

            cart.products = [];
            await cart.save();

            console.log('Todos los productos eliminados del carrito exitosamente.');
            return { success: true, message: 'Todos los productos eliminados del carrito' };
        } catch (error) {
            console.error('Error al eliminar todos los productos del carrito:', error);
            return { success: false, message: 'Error interno del servidor' };
        }
    }

    async updateProductQuantity(userId, _id, quantity) {
        try {
            const cart = await Cart.findOne({ user: userId });

            if (!cart) {
                return { success: false, message: 'No se encontró un carrito para el usuario' };
            }

            const productToUpdate = cart.products.find(product => String(product._id) === String(_id));

            if (!productToUpdate) {
                return { success: false, message: 'El producto no está en el carrito' };
            }

            productToUpdate.quantity = quantity;
            await cart.save();

            console.log(`Cantidad del producto ${_id} actualizada en el carrito exitosamente.`);
            return { success: true };
        } catch (error) {
            console.error('Error al actualizar cantidad del producto en el carrito:', error);
            return { success: false, message: 'Error interno del servidor' };
        }
    }

    async getProductsInCartWithDetails(userId, page, limit) {
        try {
            const options = {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                populate: {
                    path: 'products.productId',
                    model: 'Product',
                }
            };

            const result = await Cart.paginate({ user: userId }, options);

            if (!result) {
                return {
                    status: 'error',
                    payload: [],
                    totalPages: 0,
                    prevPage: null,
                    nextPage: null,
                    page: 0,
                    hasPrevPage: false,
                    hasNextPage: false,
                    prevLink: null,
                    nextLink: null
                };
            }

            const modifiedDocs = result.docs.map(doc => ({
                ...doc.toObject(),
                products: doc.products.map(product => ({
                    _id: product._id,
                    quantity: product.quantity
                }))
            }));

            const { totalPages, prevPage, nextPage, page: _page, hasPrevPage, hasNextPage } = result;

            const prevLink = hasPrevPage ? `/cart/${userId}?page=${prevPage}` : null;
            const nextLink = hasNextPage ? `/cart/${userId}?page=${nextPage}` : null;

            return {
                status: 'success',
                payload: modifiedDocs,
                totalPages,
                prevPage,
                nextPage,
                page: _page,
                hasPrevPage,
                hasNextPage,
                prevLink,
                nextLink
            };
        } catch (error) {
            console.error('Error al obtener productos del carrito:', error);
            return {
                status: 'error',
                payload: [],
                totalPages: 0,
                prevPage: null,
                nextPage: null,
                page: 0,
                hasPrevPage: false,
                hasNextPage: false,
                prevLink: null,
                nextLink: null
            };
        }
    }

    
      
}

export default CartManager;
