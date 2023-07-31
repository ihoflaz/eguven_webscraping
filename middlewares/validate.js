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

function isValidSetYear(setYear) {
    return /^[1-3]{1}$/.test(setYear);
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
    if (!data.setYear) {
        errors.push({input: 'setYear', message: 'Set Year is required'});
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

    // Check if setYear is valid
    if (!isValidSetYear(data.setYear)) {
        errors.push({input: 'setYear', message: 'Invalid Set Year, should be 1, 2, or 3'});
    }

    return errors;
}

module.exports = validate;
