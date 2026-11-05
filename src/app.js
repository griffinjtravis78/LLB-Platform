renderLogin() {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-[#2C353D] flex flex-col items-center justify-center p-6">
                <!-- Centered Login Content with Large Centered Logo -->
                <div class="text-center mb-6">
                    <img src="./LLB.jpeg" alt="LLB Logo" class="h-24 w-auto mx-auto rounded-xl border-2 border-[#D8C3A5]/50 object-contain bg-white p-2 shadow-xl mb-3">
                    <h1 class="text-2xl font-bold text-[#D8C3A5] tracking-widest uppercase">LLB Platform</h1>
                    <p class="text-xs text-gray-300 mt-1">Life, Legacy, and Bereavement Enterprise ERP</p>
                </div>

                <div class="bg-[#485664] border border-[#D8C3A5]/40 p-8 rounded-xl max-w-md w-full shadow-2xl">
                    <div class="text-center mb-6">
                        <h2 class="text-lg font-bold text-[#D8C3A5] tracking-wider">SECURE LOGIN</h2>
                        <p class="text-gray-300 text-xs mt-1">Enter your credentials to access your estate workspace</p>
                    </div>
                    <form id="auth-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Email Address *</label>
                            <input type="email" id="email" required class="w-full bg-[#2C353D] border border-[#6A7B8C] rounded p-2.5 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Password *</label>
                            <input type="password" id="password" required class="w-full bg-[#2C353D] border border-[#6A7B8C] rounded p-2.5 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                        </div>
                        <button type="submit" id="submit-btn" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-3 rounded transition text-xs uppercase tracking-wider cursor-pointer shadow">Secure Login</button>
                    </form>
                    <div class="mt-6 text-center border-t border-[#6A7B8C] pt-4">
                        <button type="button" id="to-register-btn" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">Need an account? Open Module 0 Registration</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('to-register-btn').addEventListener('click', () => {
            // Render Module 0 registration screen directly
            const container = document.getElementById('app');
            import('./modules/module00.js').then(mod => {
                if (typeof mod.renderModule00 === 'function') {
                    mod.renderModule00(container);
                }
            }).catch(err => {
                console.error("Error loading Module 0 for registration:", err);
            });
        });

        document.getElementById('auth-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                alert(error.message);
            } else {
                window.location.reload();
            }
        });
    }
