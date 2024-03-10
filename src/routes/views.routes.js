// Importación de módulos y dependencias necesarios
import { Router } from "express";
import { Product } from "../services/dao/mongo/models/product.model.js";
import { Cart } from "../services/dao/mongo/models/cart.model.js";
import { passportCall, authorization } from "../dirname.js";
import * as CartController from "../controllers/CartController.js";
import * as ProductController from "../controllers/ProductController.js";
import { ticketRepository } from "../services/service.js";


// Creación de una instancia de Router
const router = Router();

// Rutas públicas

// Ruta raíz ("/")
router.get("/", (req, res) => {
    res.render("home.hbs");
});

// Ruta para visualizar productos en tiempo real ("/realtimeproducts")
router.get('/realtimeproducts', passportCall('jwt'), authorization(['ADMIN']), async (req, res) => {
    try {
        await ProductController.getProducts(req, res);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).send('Error interno del servidor');
    }
});
router.get('/tickets', passportCall('jwt'), authorization(['ADMIN', 'USUARIO']), async (req, res) => {
    const userId = req.user._id;

    try {
        const tickets = await ticketRepository.getAll(userId);
        console.log(userId);

        // Renderiza la vista y pasa los datos de los tickets como un objeto
        res.render("tickets.hbs", { tickets });
    } catch (error) {
        console.error('Error al obtener los tickets:', error);
        res.status(500).send('Error interno del servidor');
    }
});




// Ruta para visualizar productos para uso del usuario
router.get("/products", passportCall('jwt'), authorization(['ADMIN', 'USUARIO']), async (req, res) => {
    try {
        await ProductController.getProductsUser(req, res);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Ruta para acceder al chat ("/chat")
router.get("/chat", (req, res) => {
    res.render("chat.hbs");
});

// Ruta para visualizar productos en el carrito ("/cart")

router.get("/cart", passportCall('jwt'), authorization(['ADMIN', 'USUARIO']), async (req, res) => {
    try {
        await CartController.getProductsInCartController(req, res);
        
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).send('Error interno del servidor');
    }
});
// Ruta para manejar sesiones ("/session")
router.get('/session', (req, res) => {
    if (req.session.counter) {
        req.session.counter++;
        res.send(`Se ha visitado este sitio: ${req.session.counter} veces.`);
    } else {
        req.session.counter = 1;
        res.send('Bienvenido!!');
    }
});

// Ruta para cerrar sesión ("/logout")
router.get('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) {
            res.json({ error: "Error logout", msg: "Error al cerrar la sesión" });
        }
        res.send('Sesión cerrada correctamente!');
    });
});

// Exportación del router para su uso en otros archivos
export default router;
