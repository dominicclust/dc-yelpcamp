(function () {
    'use strict'
    bsCustomFileInput.init()
    const forms = document.querySelectorAll('.validated-form')
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', e => {
            if (!form.checkValidity()) {
                e.preventDefault()
                e.stopPropagation()
            }
            form.classList.add('was-validated')
        }, false)
    })
})()
