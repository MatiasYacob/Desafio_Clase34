import { ticketRepository } from '../services/service.js';

export const createTicket = async (req, res) => {
    const userId = req.user._id;  // Ajusta según cómo estás manejando el ID del usuario
    try {
        const ticket = await ticketRepository.create(userId);
        res.status(201).json(ticket);
    } catch (error) {
        console.error('Error al crear el ticket:', error.message);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
};
