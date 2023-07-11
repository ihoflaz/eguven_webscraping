function isValidTC(tc) {
    if (!/^\d{11}$/.test(tc)) {
        return false;
    }

    let sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(tc[i]);
    }

    return sum % 10 === parseInt(tc[10]);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidTel(tel) {
    return /^(\+90|0)?5\d{9}$/.test(tel);
}

function isValidDate(date) {
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
        return false;
    }

    const parts = date.split('.');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (month < 1 || month > 12) {
        return false;
    }

    const maxDays = [31, year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];

    return day > 0 && day <= maxDays;
}

function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

function addYears(date, years) {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + years);
    return newDate;
}

function validate(data) {
    const errors = [];

    // Check if all fields are filled
    if (!data.firstName) {
        errors.push({input: 'firstName', message: 'Firstname is required'});
    }
    if (!data.lastName) {
        errors.push({input: 'lastName', message: 'Lastname is required'});
    }
    if (!data.tcno) {
        errors.push({input: 'tcno', message: 'TC number is required'});
    }
    if (!data.email) {
        errors.push({input: 'email', message: 'Email is required'});
    }
    if (!data.telefon) {
        errors.push({input: 'telefon', message: 'Telephone is required'});
    }
    if (!data.serino) {
        errors.push({input: 'serino', message: 'Seri No is required'});
    }
    if (!data.startdate) {
        errors.push({input: 'startdate', message: 'Startdate is required'});
    }
    if (!data.enddate) {
        errors.push({input: 'enddate', message: 'Enddate is required'});
    }
    if (!data.birth) {
        errors.push({input: 'birth', message: 'Birthdate is required'});
    }
    if (!data.uyruk) {
        errors.push({input: 'uyruk', message: 'Uyruk is required'});
    }
    if (!data.birthloc) {
        errors.push({input: 'birthloc', message: 'Doğum Yeri is required'});
    }
    if (!data.secword) {
        errors.push({input: 'secword', message: 'Güvenlik Sözcüğü is required'});
    }
    if (!data.pazarlamaizni) {
        errors.push({input: 'pazarlamaizni', message: 'Marketing permission is required'});
    }
    if (!data.telefonizni) {
        errors.push({input: 'telefonizni', message: 'Phone permission is required'});
    }
    if (!data.epostaizni) {
        errors.push({input: 'epostaizni', message: 'Email permission is required'});
    }
    if (!data.smsizni) {
        errors.push({input: 'smsizni', message: 'SMS permission is required'});
    }
    if (!data.teslimatadres) {
        errors.push({input: 'teslimatadres', message: 'Teslimat Adresi is required'});
    }
    if (!data.teslimatil) {
        errors.push({input: 'teslimatil', message: 'Teslimat İli is required'});
    }
    if (!data.teslimatilce) {
        errors.push({input: 'teslimatilce', message: 'Teslimat İlçesi is required'});
    }

    // Check if firstName and lastName contain numbers
    if (/\d/.test(data.firstName)) {
        errors.push({input: 'firstName', message: 'Firstname should not contain numbers'});
    }
    if (/\d/.test(data.lastName)) {
        errors.push({input: 'lastName', message: 'Lastname should not contain numbers'});
    }

    // Check if tcno is valid
    if (!isValidTC(data.tcno)) {
        errors.push({input: 'tcno', message: 'Invalid TC number'});
    }

    // Check if email is valid
    if (!isValidEmail(data.email)) {
        errors.push({input: 'email', message: 'Invalid Email format'});
    }

    // Check if telefon is valid
    if (!isValidTel(data.telefon)) {
        errors.push({input: 'telefon', message: 'Invalid Telephone format'});
    }

    // Check if startdate and enddate are valid
    if (!isValidDate(data.startdate)) {
        errors.push({input: 'startdate', message: 'Invalid Startdate format'});
    } else if (data.startdate !== formatDate(new Date())) {
        errors.push({input: 'startdate', message: `Startdate should be today's date (${formatDate(new Date())})`});
    }
    if (!isValidDate(data.enddate)) {
        errors.push({input: 'enddate', message: 'Invalid Enddate format'});
    } else if (data.enddate !== formatDate(addYears(new Date(), 3))) {
        errors.push({
            input: 'enddate',
            message: `Enddate should be equal to Startdate + 3 years (${formatDate(addYears(new Date(), 3))})`
        });
    }

    // Check if birth is valid
    if (!isValidDate(data.birth)) {
        errors.push({input: 'birth', message: 'Invalid Birthdate format'});
    }
    return errors;
}


module.exports = validate;