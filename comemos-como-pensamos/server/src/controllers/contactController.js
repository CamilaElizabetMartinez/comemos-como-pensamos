import Contact from '../models/Contact.js';
import { sendContactNotificationEmail } from '../utils/emailSender.js';

// Create new contact message
export const createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const contact = await Contact.create({
      name,
      email,
      subject,
      message
    });

    // Send notification email to admin
    try {
      await sendContactNotificationEmail(contact);
    } catch (emailError) {
      console.error('Error sending contact notification email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Mensaje enviado correctamente',
      data: { contact }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al enviar el mensaje',
      error: error.message
    });
  }
};

// Get all contact messages (Admin only)
export const getContactMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Contact.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Contact.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes',
      error: error.message
    });
  }
};

// Get single contact message (Admin only)
export const getContactMessage = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    // Mark as read if pending
    if (contact.status === 'pending') {
      contact.status = 'read';
      await contact.save();
    }

    res.status(200).json({
      success: true,
      data: { contact }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensaje',
      error: error.message
    });
  }
};

// Update contact message status (Admin only)
export const updateContactStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    if (status) {
      contact.status = status;
      if (status === 'replied') {
        contact.repliedAt = new Date();
      }
    }
    
    if (adminNotes !== undefined) {
      contact.adminNotes = adminNotes;
    }

    await contact.save();

    res.status(200).json({
      success: true,
      message: 'Estado actualizado correctamente',
      data: { contact }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar estado',
      error: error.message
    });
  }
};

// Delete contact message (Admin only)
export const deleteContactMessage = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mensaje eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar mensaje',
      error: error.message
    });
  }
};




