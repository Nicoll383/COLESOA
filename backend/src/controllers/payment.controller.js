const Payment = require('../models/Payment');

class PaymentController {
  // Crear nuevo pago
  static async create(req, res) {
    try {
      const {
        matricula_id,
        concepto,
        monto,
        metodo_pago,
        numero_operacion,
        observaciones
      } = req.body;

      // Validaciones
      if (!matricula_id || !concepto || !monto) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: matricula_id, concepto, monto'
        });
      }

      if (monto <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El monto debe ser mayor a 0'
        });
      }

      const payment = await Payment.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Pago registrado exitosamente',
        data: payment
      });
    } catch (error) {
      console.error('Error al crear pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar pago',
        error: error.message
      });
    }
  }

  // Listar pagos
  static async list(req, res) {
    try {
      const filters = {
        matricula_id: req.query.matricula_id,
        estado: req.query.estado,
        año_escolar: req.query.año_escolar,
        estudiante_dni: req.query.estudiante_dni,
        limit: req.query.limit
      };

      const payments = await Payment.findAll(filters);

      res.json({
        success: true,
        data: payments
      });
    } catch (error) {
      console.error('Error al listar pagos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al listar pagos',
        error: error.message
      });
    }
  }

  // Obtener pago por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const payment = await Payment.findById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Error al obtener pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener pago',
        error: error.message
      });
    }
  }

  // Actualizar estado del pago
  static async updateEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado, observaciones } = req.body;

      if (!estado) {
        return res.status(400).json({
          success: false,
          message: 'El estado es requerido'
        });
      }

      const estadosValidos = ['pendiente', 'completado', 'cancelado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido. Debe ser: pendiente, completado o cancelado'
        });
      }

      const payment = await Payment.updateEstado(id, estado, observaciones);

      res.json({
        success: true,
        message: 'Estado del pago actualizado',
        data: payment
      });
    } catch (error) {
      console.error('Error al actualizar estado del pago:', error);

      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al actualizar estado del pago',
        error: error.message
      });
    }
  }

  // Obtener pagos pendientes de una matrícula
  static async getPagosPendientes(req, res) {
    try {
      const { matriculaId } = req.params;

      const payments = await Payment.getPagosPendientes(matriculaId);

      res.json({
        success: true,
        data: payments
      });
    } catch (error) {
      console.error('Error al obtener pagos pendientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener pagos pendientes',
        error: error.message
      });
    }
  }

  // Obtener total pagado de una matrícula
  static async getTotalPagado(req, res) {
    try {
      const { matriculaId } = req.params;

      const total = await Payment.getTotalPagado(matriculaId);

      res.json({
        success: true,
        data: {
          total_pagado: total
        }
      });
    } catch (error) {
      console.error('Error al obtener total pagado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener total pagado',
        error: error.message
      });
    }
  }
}

module.exports = PaymentController;
