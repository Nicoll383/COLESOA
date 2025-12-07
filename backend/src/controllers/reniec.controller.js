const axios = require('axios');

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

      // Intentar con diferentes APIs de RENIEC
      let data = null;
      let error = null;

      // Opción 1: API apis.net.pe
      try {
        const response1 = await axios.get(
          `https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`,
          {
            headers: {
              'Authorization': 'Bearer apis-token-10477.7eaofVUeYm1eVFP0nCLnMcqHxMVDKBFN'
            },
            timeout: 5000
          }
        );

        if (response1.data) {
          data = {
            dni: dni,
            nombres: response1.data.nombres || '',
            apellidoPaterno: response1.data.apellidoPaterno || '',
            apellidoMaterno: response1.data.apellidoMaterno || '',
            nombreCompleto: `${response1.data.nombres || ''} ${response1.data.apellidoPaterno || ''} ${response1.data.apellidoMaterno || ''}`.trim()
          };
        }
      } catch (err1) {
        error = err1.message;
        console.log('API 1 falló, intentando con API 2...');

        // Opción 2: API dniruc.apisperu.com
        try {
          const response2 = await axios.get(
            `https://dniruc.apisperu.com/api/v1/dni/${dni}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImZuaWNvbGwzODNAZ21haWwuY29tIn0.VzN3T8l8H_KL_0qYcF_3LqQH_8xYx9xYx9xYx9xYx9x`,
            { timeout: 5000 }
          );

          if (response2.data && response2.data.nombres) {
            data = {
              dni: dni,
              nombres: response2.data.nombres || '',
              apellidoPaterno: response2.data.apellidoPaterno || '',
              apellidoMaterno: response2.data.apellidoMaterno || '',
              nombreCompleto: `${response2.data.nombres || ''} ${response2.data.apellidoPaterno || ''} ${response2.data.apellidoMaterno || ''}`.trim()
            };
          }
        } catch (err2) {
          error = err2.message;
          console.log('API 2 también falló');
        }
      }

      // Si no se pudo obtener datos de ninguna API
      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'No se pudo consultar el DNI en este momento. Por favor, ingrese los datos manualmente.',
          error: error
        });
      }

      res.json({
        success: true,
        data: data
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
