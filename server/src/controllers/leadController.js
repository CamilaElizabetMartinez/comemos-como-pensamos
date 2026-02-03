import ProducerLead from '../models/ProducerLead.js';

// @desc    Get all leads with filters
// @route   GET /api/leads
// @access  Private (Admin only)
export const getLeads = async (req, res) => {
  try {
    const { 
      status, 
      source, 
      city, 
      priority,
      hasFollowUp,
      page = 1, 
      limit = 50,
      sort = '-createdAt'
    } = req.query;

    const filters = {};
    
    if (status) {
      if (status.includes(',')) {
        filters.status = { $in: status.split(',') };
      } else {
        filters.status = status;
      }
    }
    if (source) filters.source = source;
    if (city) filters['location.city'] = new RegExp(city, 'i');
    if (priority) filters.priority = priority;
    
    if (hasFollowUp === 'overdue') {
      filters.nextFollowUp = { $lt: new Date() };
      filters.status = { $nin: ['registered', 'lost'] };
    } else if (hasFollowUp === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filters.nextFollowUp = { $gte: today, $lt: tomorrow };
    } else if (hasFollowUp === 'week') {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      filters.nextFollowUp = { $gte: today, $lte: nextWeek };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const leads = await ProducerLead.find(filters)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ProducerLead.countDocuments(filters);

    const stats = await ProducerLead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = stats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const overdueCount = await ProducerLead.countDocuments({
      nextFollowUp: { $lt: new Date() },
      status: { $nin: ['registered', 'lost'] }
    });

    res.status(200).json({
      success: true,
      count: leads.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      statusCounts,
      overdueCount,
      data: { leads }
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener leads',
      error: error.message
    });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private (Admin only)
export const getLeadById = async (req, res) => {
  try {
    const lead = await ProducerLead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: { lead }
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener lead',
      error: error.message
    });
  }
};

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private (Admin only)
export const createLead = async (req, res) => {
  try {
    const {
      name,
      businessName,
      phone,
      email,
      location,
      categories,
      source,
      notes,
      nextFollowUp,
      priority,
      estimatedVolume
    } = req.body;

    const leadData = {
      name,
      businessName,
      phone,
      email,
      location,
      categories,
      source,
      priority,
      estimatedVolume,
      status: 'new'
    };

    if (nextFollowUp) {
      leadData.nextFollowUp = new Date(nextFollowUp);
    }

    if (notes) {
      leadData.notes = [{ content: notes }];
    }

    const lead = await ProducerLead.create(leadData);

    res.status(201).json({
      success: true,
      message: 'Lead creado exitosamente',
      data: { lead }
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear lead',
      error: error.message
    });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private (Admin only)
export const updateLead = async (req, res) => {
  try {
    const lead = await ProducerLead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead no encontrado'
      });
    }

    const {
      name,
      businessName,
      phone,
      email,
      location,
      categories,
      source,
      nextFollowUp,
      priority,
      estimatedVolume
    } = req.body;

    if (name) lead.name = name;
    if (businessName !== undefined) lead.businessName = businessName;
    if (phone !== undefined) lead.phone = phone;
    if (email !== undefined) lead.email = email;
    if (location) lead.location = location;
    if (categories) lead.categories = categories;
    if (source) lead.source = source;
    if (priority) lead.priority = priority;
    if (estimatedVolume !== undefined) lead.estimatedVolume = estimatedVolume;
    if (nextFollowUp !== undefined) {
      lead.nextFollowUp = nextFollowUp ? new Date(nextFollowUp) : null;
    }

    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Lead actualizado exitosamente',
      data: { lead }
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar lead',
      error: error.message
    });
  }
};

// @desc    Update lead status
// @route   PUT /api/leads/:id/status
// @access  Private (Admin only)
export const updateLeadStatus = async (req, res) => {
  try {
    const { status, lostReason, convertedProducerId } = req.body;
    
    const lead = await ProducerLead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead no encontrado'
      });
    }

    const validStatuses = ['new', 'contacted', 'interested', 'negotiating', 'registered', 'lost'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }

    lead.status = status;
    lead.lastContactedAt = new Date();

    if (status === 'lost' && lostReason) {
      lead.lostReason = lostReason;
      lead.nextFollowUp = null;
    }

    if (status === 'registered' && convertedProducerId) {
      lead.convertedProducerId = convertedProducerId;
      lead.nextFollowUp = null;
    }

    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: { lead }
    });
  } catch (error) {
    console.error('Error updating lead status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado',
      error: error.message
    });
  }
};

// @desc    Add note to lead
// @route   POST /api/leads/:id/notes
// @access  Private (Admin only)
export const addNote = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El contenido de la nota es obligatorio'
      });
    }

    const lead = await ProducerLead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead no encontrado'
      });
    }

    lead.notes.push({ content: content.trim() });
    lead.lastContactedAt = new Date();
    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Nota añadida exitosamente',
      data: { lead }
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Error al añadir nota',
      error: error.message
    });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private (Admin only)
export const deleteLead = async (req, res) => {
  try {
    const lead = await ProducerLead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead no encontrado'
      });
    }

    await ProducerLead.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Lead eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar lead',
      error: error.message
    });
  }
};

// @desc    Get lead statistics
// @route   GET /api/leads/stats
// @access  Private (Admin only)
export const getLeadStats = async (req, res) => {
  try {
    const totalLeads = await ProducerLead.countDocuments();
    
    const statusStats = await ProducerLead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const sourceStats = await ProducerLead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const newThisMonth = await ProducerLead.countDocuments({
      createdAt: { $gte: thisMonth }
    });

    const convertedThisMonth = await ProducerLead.countDocuments({
      status: 'registered',
      updatedAt: { $gte: thisMonth }
    });

    const overdueFollowUps = await ProducerLead.countDocuments({
      nextFollowUp: { $lt: new Date() },
      status: { $nin: ['registered', 'lost'] }
    });

    const conversionRate = totalLeads > 0 
      ? ((statusStats.find(s => s._id === 'registered')?.count || 0) / totalLeads * 100).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalLeads,
          newThisMonth,
          convertedThisMonth,
          overdueFollowUps,
          conversionRate,
          byStatus: statusStats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
          bySource: sourceStats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {})
        }
      }
    });
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};
