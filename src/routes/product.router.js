import { Router } from "express";
import * as  productController from "../controllers/ProductController.js";
import { passportCall, authorization } from "../dirname.js";
const router = Router();

// Rutas
// Ruta para eliminar un producto del carrito ("/cart/:productId")
router.delete('/:productId', passportCall('jwt'), authorization(['ADMIN']), productController.deleteProduct);


// Ruta para agregar un nuevo producto
router.post('/', passportCall('jwt'), authorization(['ADMIN']), productController.addProduct);



// Ruta para obtener todos los productos con filtros y paginación
router.get('/', productController.getProducts);



// 🚧 ¡Atención! Estas rutas están en construcción y son propensas a cambios. 🚧


// Ruta para obtener un producto por su _id
router.get('/:_id', productController.getProductById);

// Ruta para actualizar un producto por su ID
router.put('/:id', productController.updateProductById);
// Exportar el router
export default router;
