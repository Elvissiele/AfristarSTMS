import prisma from '../config/prisma.js';

export const createTicket = async (req, res) => {
    try {
        const { title, description, priority, category } = req.body;
        const ticket = await prisma.ticket.create({
            data: {
                title,
                description,
                priority: priority || 'MEDIUM',
                category: category || 'OTHER',
                authorId: req.user.id,
            },
        });


        // Send Email to Admin (Mock Admin Email)
        import('../services/emailService.js').then(({ sendEmail }) => {
            sendEmail({
                to: 'admin@example.com',
                subject: `New Ticket: ${ticket.title} (#${ticket.id})`,
                text: `A new ticket has been created by a customer.\n\nDescription: ${ticket.description}`,
                html: `<p>A new ticket has been created.</p><p><b>Title:</b> ${ticket.title}</p><p><b>Description:</b> ${ticket.description}</p>`
            });
        });

        res.status(201).json({ status: 'success', data: ticket });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error creating ticket' });
    }
};

export const getTickets = async (req, res) => {
    try {
        const { role, id } = req.user;
        const { search, page = 1, limit = 10, status } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where = {};

        // Role-based filtering
        if (role === 'CUSTOMER') {
            where.authorId = id;
        }

        // Status filter
        if (status && status !== 'ALL') {
            where.status = status;
        }

        // Search filter (Title or Author Email)
        if (search) {
            where.OR = [
                { title: { contains: search } }, // Case-insensitive in Postgres, sensitive in SQLite/MySQL usually
                // { author: { email: { contains: search } } } // Requires relation filtering support
            ];
        }

        // Fetch Data
        const tickets = await prisma.ticket.findMany({
            where,
            include: {
                author: { select: { name: true, email: true } },
                assignedTo: { select: { name: true, email: true } }
            },
            skip,
            take,
            orderBy: { createdAt: 'desc' }
        });

        // Count Total for Pagination
        const total = await prisma.ticket.count({ where });

        res.json({
            status: 'success',
            data: tickets,
            meta: {
                total,
                page: parseInt(page),
                last_page: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error fetching tickets' });
    }
};

export const getTicketStats = async (req, res) => {
    try {
        const stats = await prisma.ticket.groupBy({
            by: ['status'],
            _count: { status: true },
        });

        // Format: { OPEN: 5, CLOSED: 2, ... }
        const formatted = stats.reduce((acc, curr) => {
            acc[curr.status] = curr._count.status;
            return acc;
        }, {});

        res.json({ status: 'success', data: formatted });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error fetching stats' });
    }
};

export const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assignedToId, priority, category, scheduledFor } = req.body;

        // Verify existence
        const ticket = await prisma.ticket.findUnique({ where: { id: parseInt(id) } });
        if (!ticket) return res.status(404).json({ status: 'error', message: 'Ticket not found' });

        // RBAC: Only Admin can schedule
        if (scheduledFor && req.user.role !== 'ADMIN') {
            return res.status(403).json({ status: 'error', message: 'Only Admins can schedule tickets' });
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id: parseInt(id) },
            data: {
                status,
                priority,
                category,
                scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
                assignedToId: assignedToId ? parseInt(assignedToId) : undefined,
            },
        });
        res.json({ status: 'success', data: updatedTicket });

        // Send Email to Customer if Status Changed
        if (status && status !== ticket.status) {
            import('../services/emailService.js').then(async ({ sendEmail }) => {
                // Fetch author email
                const fullTicket = await prisma.ticket.findUnique({
                    where: { id: parseInt(id) },
                    include: { author: { select: { email: true } } }
                });

                if (fullTicket && fullTicket.author.email) {
                    sendEmail({
                        to: fullTicket.author.email,
                        subject: `Ticket Update: ${fullTicket.title} (#${fullTicket.id})`,
                        text: `Your ticket status has been updated to: ${status}`,
                        html: `<p>Your ticket status has been updated to: <b>${status}</b></p>`
                    });
                }
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error updating ticket' });
    }
};

export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, isInternal } = req.body;

        const ticket = await prisma.ticket.findUnique({ where: { id: parseInt(id) } });
        if (!ticket) return res.status(404).json({ status: 'error', message: 'Ticket not found' });

        // RBAC Check
        if (req.user.role === 'CUSTOMER' && ticket.authorId !== req.user.id) {
            return res.status(403).json({ status: 'error', message: 'Forbidden' });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                isInternal: isInternal || false,
                ticketId: parseInt(id),
                authorId: req.user.id,
            },
        });
        res.status(201).json({ status: 'success', data: comment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error adding comment' });
    }
};

export const getTicketDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) },
            include: {
                comments: { include: { author: { select: { name: true } } } },
                author: { select: { name: true, email: true } },
                assignedTo: { select: { name: true } }
            }
        });

        if (!ticket) return res.status(404).json({ status: 'error', message: 'Ticket not found' });

        // Access control
        if (req.user.role === 'CUSTOMER') {
            if (ticket.authorId !== req.user.id) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            // Filter out internal comments for customers
            ticket.comments = ticket.comments.filter(comment => !comment.isInternal);
        }

        res.json({ status: 'success', data: ticket });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error fetching ticket details' });
    }
}

