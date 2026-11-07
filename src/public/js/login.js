document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const messageEl = document.getElementById('message');
    const submitBtn = form.querySelector('button[type="submit"]');

    const email = form.email.value.trim();
    const password = form.password.value;

    if (messageEl) {
        messageEl.textContent = '';
        messageEl.className = '';
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Accesso in corso...';

    try {
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });

        let data;
        try {
            data = await res.json();
        } catch {
            throw new Error('Il server non ha risposto correttamente. Riprova più tardi.');
        }

        if (!res.ok) {
            throw new Error(data.error || 'Si è verificato un errore. Riprova.');
        }

        if (messageEl) {
            messageEl.textContent = data.message;
            messageEl.className = 'success';
        }

        window.location.href = '/mappa';
    } catch (err) {
        if (messageEl) {
            messageEl.textContent = err.message;
            messageEl.className = 'error';
        } else {
            alert(err.message);
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Accedi';
    }
});
