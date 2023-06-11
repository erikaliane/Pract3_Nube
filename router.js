const express = require('express');

const conexion = require('./database/db');
const router = express.Router();
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



router.get('/',(req,res)=>{

   
   conexion.query('select * from estudiante',(error,results)=>{
        if(error){
            throw error;
        }else{
            res.render('index', {results : results});
        }
    }); 
})


//RUTA PARA CREAR REGISTROS

router.get('/create',(req,res)=>{
    res.render('create');
})

//RUTA PARA EDITAR REGISTROS 
router.get('/edit/:codigo' ,(req,res)=>{
    const codigo = req.params.codigo;
    conexion.query('SELECT * FROM estudiante WHERE codigo=?',[codigo], (error, results, fields)=>{
        if(error){
            throw error;
        }else{
            res.render('edit', {estudiante:results[0]});
        }
    })
})
//RUTA PARA UPDATE


router.post('/update/:codigo',  (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Error de Multer al cargar el archivo
      console.error(err);
      res.status(500).send('Error al cargar el archivo.');
    } else if (err) {
      console.error(err);
      res.status(500).send('Error en la carga del archivo.');
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
          } else if (err) {
            console.error(err);
            res.status(500).send('Error en la carga del archivo.');
          
          } else {
            //el nombre de la imagen cargada en S3
            const imagen = params.Key; 
            console.log('Eliminar imagen:', imagen);
             conexion.query(
              'UPDATE estudiante SET nombre = ?, apellidos = ?, correo = ?, numero = ? , imagen = ? WHERE codigo = ?',[ nombre,  apellidos,  correo, numero, imagen  , codigo],
              (error, results) => {
                if (error) {
                  console.log(error);
                  res.status(500).send('Error al guardar elestudianteen la base de datos.');
                } else {
                  conexion.query('SELECT imagen FROM estudiante WHERE codigo = ?', [codigo], (error, results) => {
                    if (error) {
                      throw error;
                    } else {
                      const imageName = req.body.imagen;  
                      console.log('Eliminar imagen:', imageName);
                            const params = {
                                Bucket: 'pract3ventura', 
                                Key: imageName
                              };
                            s3.deleteObject(params, (err, data) => {
                                if (err) {
                                  console.error(err);
                                  res.status(500).send('Error al eliminar la imagen de S3.');
                                } else {
                                  res.redirect('/');
                                }
                            });
                            
                          ;
                        }
                      });
                }
              }
            );
          }
        });
      
    }
  });
});



//RUTA PARA ELIMINAR EL REGISTRO

router.get('/delete/:codigo' ,(req, res)=>{
    const codigo = req.params.codigo;

    conexion.query('SELECT imagen FROM estudiante WHERE codigo = ?', [codigo], (error, results) => {
        if (error) {
          throw error;
        } else {
          const imageName = results[0].imagen;    
          console.log('Eliminar imagen:', imageName);
            conexion.query('DELETE FROM estudiante WHERE codigo = ?' , [codigo], (error, results)=>{
            if(error){
                throw error;
            }else{
                const params = {
                    Bucket: 'pract3ventura', 
                    Key: imageName
                  };
                s3.deleteObject(params, (err, data) => {
                    if (err) {
                      console.error(err);
                      res.status(500).send('Error al eliminar la imagen de S3.');
                    } else {
                      res.redirect('/');
                    }
                });
                }
              });
            }
          });
        });
  
const crud= require('./controllers/crud');
router.post('/save', crud.save)

module.exports = router