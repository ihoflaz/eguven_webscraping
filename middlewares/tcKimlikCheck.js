const axios = require('axios');

module.exports = async function tcKimlikCheck(req, res, next) {
    let customer;
    try {
        customer = req.body;
        const name = customer.firstName.toLocaleUpperCase("TR");
        const lastname = customer.lastName.toLocaleUpperCase("TR");
        const tc = customer.tcno;
        const birthYear = customer.birth;
        const data = `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <TCKimlikNoDogrula xmlns="http://tckimlik.nvi.gov.tr/WS">
      <TCKimlikNo>${tc}</TCKimlikNo>
      <Ad>${name}</Ad>
      <Soyad>${lastname}</Soyad>
      <DogumYili>${birthYear.split(".")[2]}</DogumYili>
    </TCKimlikNoDogrula>
  </soap12:Body>
</soap12:Envelope>`;
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://tckimlik.nvi.gov.tr/Service/KPSPublic.asmx',
            headers: {
                'Content-Type': 'application/soap+xml; charset=utf-8'
            },
            data: data
        };

        const response = await axios.request(config);
        const xmlResponse = response.data;
        const result = xmlResponse.match(/<TCKimlikNoDogrulaResult>(.*?)<\/TCKimlikNoDogrulaResult>/)[1];
        const isTCKimlikValid = result === "true";
        if (!isTCKimlikValid) {
            return res.status(400).json({error: 'TC Kimlik doğrulaması başarısız oldu'});
        }
        next();
    } catch (error) {
        console.error(error);
        res.status(500).send('Sunucu hatası');
    }
};