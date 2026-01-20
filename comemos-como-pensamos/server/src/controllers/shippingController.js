import ShippingZone from '../models/ShippingZone.js';
import Producer from '../models/Producer.js';

// @desc    Crear zona de envío
// @route   POST /api/shipping/zones
// @access  Private (Producer only)
export const createShippingZone = async (req, res) => {
  try {
    const { name, postalCodes, cities, cost, minimumOrder, estimatedDays } = req.body;

    // Verificar que el usuario es productor
    const producer = await Producer.findOne({ userId: req.user._id });

    if (!producer) {
      return res.status(403).json({
        success: false,
        message: 'Debes ser productor para crear zonas de envío'
      });
    }

    // Crear zona de envío
    const shippingZone = await ShippingZone.create({
      producerId: producer._id,
      name,
      postalCodes: postalCodes || [],
      cities: cities || [],
      cost,
      minimumOrder: minimumOrder || 0,
      estimatedDays
    });

    // Agregar a las zonas del productor
    producer.shippingZones.push(shippingZone._id);
    await producer.save();

    res.status(201).json({
      success: true,
      message: 'Zona de envío creada exitosamente',
      data: { shippingZone }
    });
  } catch (error) {
    console.error('Error al crear zona de envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear zona de envío',
      error: error.message
    });
  }
};

// @desc    Obtener zonas de envío de un productor
// @route   GET /api/shipping/zones/producer/:producerId
// @access  Public
export const getProducerShippingZones = async (req, res) => {
  try {
    const shippingZones = await ShippingZone.find({
      producerId: req.params.producerId,
      isActive: true
    });

    res.status(200).json({
      success: true,
      count: shippingZones.length,
      data: { shippingZones }
    });
  } catch (error) {
    console.error('Error al obtener zonas de envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener zonas de envío',
      error: error.message
    });
  }
};

// @desc    Obtener mis zonas de envío (productor logueado)
// @route   GET /api/shipping/zones/my
// @access  Private (Producer only)
export const getMyShippingZones = async (req, res) => {
  try {
    const producer = await Producer.findOne({ userId: req.user._id });

    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Perfil de productor no encontrado'
      });
    }

    const shippingZones = await ShippingZone.find({
      producerId: producer._id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: shippingZones.length,
      data: { shippingZones }
    });
  } catch (error) {
    console.error('Error al obtener mis zonas de envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener zonas de envío',
      error: error.message
    });
  }
};

// @desc    Calcular costo de envío
// @route   POST /api/shipping/calculate
// @access  Public
export const calculateShipping = async (req, res) => {
  try {
    const { producerId, postalCode, city, orderTotal } = req.body;

    if (!producerId || (!postalCode && !city)) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere producerId y (postalCode o city)'
      });
    }

    // Buscar zonas de envío del productor
    const shippingZones = await ShippingZone.find({
      producerId,
      isActive: true
    });

    if (shippingZones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'El productor no tiene zonas de envío configuradas'
      });
    }

    // Buscar zona que coincida
    let matchedZone = null;

    for (const zone of shippingZones) {
      // Verificar por código postal
      if (postalCode && zone.coversPostalCode(postalCode)) {
        matchedZone = zone;
        break;
      }

      // Verificar por ciudad
      if (city && zone.coversCity(city)) {
        matchedZone = zone;
        break;
      }
    }

    if (!matchedZone) {
      return res.status(404).json({
        success: false,
        message: 'No hay cobertura de envío para esta ubicación'
      });
    }

    // Verificar pedido mínimo
    if (orderTotal && !matchedZone.meetsMinimum(orderTotal)) {
      return res.status(400).json({
        success: false,
        message: `El pedido mínimo para esta zona es €${matchedZone.minimumOrder}`,
        data: {
          minimumOrder: matchedZone.minimumOrder,
          currentTotal: orderTotal
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        shippingCost: matchedZone.cost,
        estimatedDays: matchedZone.estimatedDays,
        zoneName: matchedZone.name,
        minimumOrder: matchedZone.minimumOrder
      }
    });
  } catch (error) {
    console.error('Error al calcular envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular costo de envío',
      error: error.message
    });
  }
};

// @desc    Actualizar zona de envío
// @route   PUT /api/shipping/zones/:id
// @access  Private (Owner only)
export const updateShippingZone = async (req, res) => {
  try {
    const shippingZone = await ShippingZone.findById(req.params.id);

    if (!shippingZone) {
      return res.status(404).json({
        success: false,
        message: 'Zona de envío no encontrada'
      });
    }

    // Verificar que el usuario es el dueño
    const producer = await Producer.findOne({ userId: req.user._id });

    if (!producer || shippingZone.producerId.toString() !== producer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar esta zona de envío'
      });
    }

    const { name, postalCodes, cities, cost, minimumOrder, estimatedDays, isActive } = req.body;

    if (name) shippingZone.name = name;
    if (postalCodes) shippingZone.postalCodes = postalCodes;
    if (cities) shippingZone.cities = cities;
    if (cost !== undefined) shippingZone.cost = cost;
    if (minimumOrder !== undefined) shippingZone.minimumOrder = minimumOrder;
    if (estimatedDays) shippingZone.estimatedDays = estimatedDays;
    if (isActive !== undefined) shippingZone.isActive = isActive;

    await shippingZone.save();

    res.status(200).json({
      success: true,
      message: 'Zona de envío actualizada exitosamente',
      data: { shippingZone }
    });
  } catch (error) {
    console.error('Error al actualizar zona de envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar zona de envío',
      error: error.message
    });
  }
};

// @desc    Eliminar zona de envío
// @route   DELETE /api/shipping/zones/:id
// @access  Private (Owner only)
export const deleteShippingZone = async (req, res) => {
  try {
    const shippingZone = await ShippingZone.findById(req.params.id);

    if (!shippingZone) {
      return res.status(404).json({
        success: false,
        message: 'Zona de envío no encontrada'
      });
    }

    // Verificar que el usuario es el dueño
    const producer = await Producer.findOne({ userId: req.user._id });

    if (!producer || shippingZone.producerId.toString() !== producer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta zona de envío'
      });
    }

    // Eliminar de las zonas del productor
    producer.shippingZones = producer.shippingZones.filter(
      zoneId => zoneId.toString() !== shippingZone._id.toString()
    );
    await producer.save();

    await ShippingZone.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Zona de envío eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar zona de envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar zona de envío',
      error: error.message
    });
  }
};
