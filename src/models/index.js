// src/models/index.js
import prisma from '../config/prisma.js';

// Exporting the prisma client as the main DB access point
// In larger apps, we might wrap these in Repository classes
const models = {
    User: prisma.user,
    Ticket: prisma.ticket,
    Comment: prisma.comment,
    raw: prisma // Access to raw client if needed
};

export default models;
