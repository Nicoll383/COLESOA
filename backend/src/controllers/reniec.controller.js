const axios = require('axios');

// Base de datos simulada de DNIs para desarrollo
// NOTA: Para producción, se recomienda contratar un servicio de API de RENIEC de pago
const dniDatabase = {
  '74892504': { nombres: 'JUAN CARLOS', apellidoPaterno: 'RODRIGUEZ', apellidoMaterno: 'GARCIA' },
  '12345678': { nombres: 'MARIA ELENA', apellidoPaterno: 'LOPEZ', apellidoMaterno: 'TORRES' },
  '87654321': { nombres: 'JOSE LUIS', apellidoPaterno: 'MARTINEZ', apellidoMaterno: 'SANCHEZ' },
  '11111111': { nombres: 'ANA SOFIA', apellidoPaterno: 'FERNANDEZ', apellidoMaterno: 'RAMIREZ' },
  '22222222': { nombres: 'CARLOS ALBERTO', apellidoPaterno: 'GOMEZ', apellidoMaterno: 'DIAZ' },
  '33333333': { nombres: 'LUCIA ISABEL', apellidoPaterno: 'VASQUEZ', apellidoMaterno: 'CRUZ' },
  '44444444': { nombres: 'PEDRO ANTONIO', apellidoPaterno: 'QUISPE', apellidoMaterno: 'MAMANI' }
};

class ReniecController {
  // Consultar DNI en RENIEC
  static async consultarDni(req, res) {
    try {
      const { dni } = req.params;

      // Validar DNI
      if (!dni || dni.length !== 8 || !/^\d{8}$/.test(dni)) {
        return res.status(400).json({
          success: false,
          message: 'DNI inválido. Debe tener 8 dígitos'
        });
      }

      let data = null;

      // MODO DESARROLLO: Usar base de datos simulada primero
      if (dniDatabase[dni]) {
        console.log(`✓ DNI ${dni} encontrado en base de datos de desarrollo`);
        const persona = dniDatabase[dni];
        data = {
          dni: dni,
          nombres: persona.nombres,
          apellidoPaterno: persona.apellidoPaterno,
          apellidoMaterno: persona.apellidoMaterno,
          nombreCompleto: `${persona.nombres} ${persona.apellidoPaterno} ${persona.apellidoMaterno}`.trim()
        };

        return res.json({
          success: true,
          data: data,
          source: 'development'
        });
      }

      // Si no está en la BD de desarrollo, intentar APIs reales (opcional)
      // NOTA: Las APIs públicas de RENIEC suelen fallar o requerir pago
      console.log(`⚠ DNI ${dni} no encontrado en BD de desarrollo, intentando APIs...`);

      // Opción: Intentar con API de prueba (puede fallar)
      try {
        const response = await axios.get(
          `https://dniruc.apisperu.com/api/v1/dni/${dni}`,
          {
            timeout: 3000,
            headers: {
              'Accept': 'application/json'
            }
          }
        );

        if (response.data && response.data.nombres) {
          data = {
            dni: dni,
            nombres: response.data.nombres || '',
            apellidoPaterno: response.data.apellidoPaterno || '',
            apellidoMaterno: response.data.apellidoMaterno || '',
            nombreCompleto: `${response.data.nombres || ''} ${response.data.apellidoPaterno || ''} ${response.data.apellidoMaterno || ''}`.trim()
          };

          return res.json({
            success: true,
            data: data,
            source: 'api'
          });
        }
      } catch (apiError) {
        console.log('✗ APIs de RENIEC no disponibles (requieren autenticación de pago)');
      }

      // Si no se encontró en ningún lado
      return res.status(404).json({
        success: false,
        message: 'DNI no encontrado. Por favor, ingrese los datos manualmente.',
        hint: 'Para desarrollo, use uno de estos DNIs de prueba: 74892504, 12345678, 87654321, 11111111, 22222222, 33333333, 44444444'
      });

    } catch (error) {
      console.error('Error al consultar RENIEC:', error);
      res.status(500).json({
        success: false,
        message: 'Error al consultar DNI',
        error: error.message
      });
    }
  }
}

module.exports = ReniecController;
