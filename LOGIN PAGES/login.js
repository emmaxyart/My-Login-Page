document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const emailInput = document.getElementById('email'); // Assuming ID 'email' for email input
            const passwordInput = document.getElementById('password'); // Assuming ID 'password' for password input

            // Fallback to original IDs if new ones aren't found (e.g. if HTML wasn't updated yet)
            const email = emailInput ? emailInput.value : document.getElementById('exampleInputEmail1').value;
            const password = passwordInput ? passwordInput.value : document.getElementById('exampleInputPassword1').value;

            if (!email || !password) {
                alert('Please enter both email and password.');
                return;
            }

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (response.ok) {
                    alert(data.message); // "Login successful."
                    if (data.token) {
                        localStorage.setItem('authToken', data.token);
                        console.log('Login successful. Token stored. JWT:', data.token);
                        alert('Login successful! Token stored in localStorage. Check console for token.');
                        // In a real application, you would redirect to a protected page:
                        // window.location.href = '/dashboard.html';
                    }
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred during login. Please try again.');
            }
        });
    }
});
