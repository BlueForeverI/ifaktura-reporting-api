/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
 const fetch = require('node-fetch');
 const AdmZip = require("adm-zip");
 const streamToBuffer = stream => {
   const chunks = [];
   return new Promise((resolve, reject) => {
     stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
     stream.on('error', (err) => reject(err));
     stream.on('end', () => resolve(Buffer.concat(chunks)));
   })
 };
 
 exports.report = (req, res) => {
   const requests = req.body.map(inv => 
     fetch('https://ifaktura-reporting-api.herokuapp.com/api/report', 
        {
          method: 'POST',
          body: JSON.stringify(inv), 
          headers: {'Content-Type': 'application/json'}
        })
       .then(resp => ({body: resp.body, number: inv.data.invoice.number}))
     );
 
   Promise.all(requests)
     .then(responses => responses.map(resp => streamToBuffer(resp.body)
       .then(stream => ({stream, number: resp.number}))))
     .then(data => Promise.all(data))
     .then(files => {
       var zip = new AdmZip();
       files.forEach(file => {
         zip.addFile(`invoice_${file.number}.pdf`, file.stream);
       })
       
       return zip.toBufferPromise();
     })
     .then(zipData => {
       res.writeHead(200, {
         'Content-Type': 'application/octet-stream',
         'Content-disposition': 'attachment;filename=invoices.zip',
         'Content-Length': zipData.length
       });
       res.end(zipData);
     });
 };
 