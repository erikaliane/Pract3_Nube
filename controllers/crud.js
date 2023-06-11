const conexion = require('../database/db');
const multer = require('multer');
const path = require('path');
const aws = require('aws-sdk');
// Configuración de Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configuración del cliente de AWS S3
const s3 = new aws.S3({
  accessKeyId: 'AKIAXBX3WDY5BZAAYFHE',
  secretAccessKey: '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'
});

exports.save = (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Error de Multer al cargar el archivo
      console.error(err);
      res.status(500).send('Error al cargar el archivo.');
    } else if (err) {
      console.error(err);
      res.status(500).send('Error en la carga del archivo.');
    } else {
      if (!req.file) {
        res.status(400).send('No se seleccionó ningún archivo.');
      } else {
        const codigo = req.body.codigo;
        const nombre = req.body.nombre;
        const apellidos= req.body.apellidos;
        const  correo = req.body.correo;
        const numero= req.body.numero;

        const fileContent = req.file.buffer;
        const params = {
          Bucket: 'pract3ventura',
          Key: Date.now() + '_' + req.file.originalname,
          Body: fileContent
        };

        s3.upload(params, (err, data) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error al cargar el archivo en S3.');
          } else {
            //el nombre de la imagen cargada en S3
            const imagen = params.Key; 
            conexion.query(
              'INSERT INTO estudiante SET ?',
              { codigo: codigo, nombre: nombre, apellidos: apellidos, correo: correo, numero: numero, imagen: imagen },
              (error, results) => {
                if (error) {
                  console.log(error);
                  res.status(500).send('Error al guardar elestudianteen la base de datos.');
                } else {
                  res.redirect('/');
                }
              }
            );
          }
        });
      }
    }
  });
};


