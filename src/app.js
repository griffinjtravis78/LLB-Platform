renderLogin() {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-[#0E0E0E] flex items-center justify-center p-6">
                <div class="bg-[#161616] border border-[#C5A059]/30 p-8 rounded-lg max-w-md w-full shadow-2xl">
                    <div class="text-center mb-6">
                        <span class="text-[#C5A059] text-2xl font-bold tracking-widest">LLB ERP</span>
                        <p class="text-gray-400 text-sm mt-1">Life, Legacy, and Bereavement</p>
                    </div>
                    <form id="auth-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Email Address *</label>
                            <input type="email" id="email" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Password *</label>
                            <input type="password" id="password" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                        </div>
                        <button type="submit" id="submit-btn" class="w-full bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold py-2 rounded transition">Secure Login</button>
                    </form>
                    <div class="mt-4 text-center">
                        <button id="toggle-mode" class="text-xs text-[#C5A059] hover:underline bg-transparent border-none cursor-pointer">Need an account? Register here</button>
                    </div>
                </div>
            </div>
        `;

        let isRegistering = false;
        document.getElementById('toggle-mode').addEventListener('click', () => {
            isRegistering = !isRegistering;
            document.getElementById('submit-btn').textContent = isRegistering ? 'Create Account' : 'Secure Login';
            document.getElementById('toggle-mode').textContent = isRegistering ? 'Already have an account? Sign in' : 'Need an account? Register here';
        });

        document.getElementById('auth-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (isRegistering) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) {
                    alert(error.message);
                } else {
                    alert('Registration successful! You can now log in or run your profile setup SQL script.');
                    window.location.reload();
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) alert(error.message);
                else window.location.reload();
            }
        });
    }
