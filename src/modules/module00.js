// File: src/modules/module00.js
import { supabase } from '../app.js';

export async function renderModule00(container) {
    container.innerHTML = `
        <div class="max-w-xl mx-auto bg-[#485664] border border-[#D8C3A5]/40 rounded-xl p-8 shadow-2xl my-6">
            <div>
                <h2 class="text-lg font-bold text-[#D8C3A5] uppercase tracking-wider">Level 0 Registration</h2>
                <p class="text-xs text-gray-200 mt-1">Register your secure account credentials and location. All fields marked with * are mandatory.</p>
            </div>
            <form id="mod0-form" class="space-y-4 mt-6">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">First Name *</label>
                        <input type="text" id="reg-firstname" required class="w-full bg-[#2C353D] border border-[#6A7B8C] rounded p-2.5 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Last Name *</label>
                        <input type="text" id="reg-lastname" required class="w-full bg-[#2C353D] border border-[#6A7B8C] rounded p-2.5 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">City *</label>
                        <input type="text" id="reg-city" required class="w-full bg-[#2C353D] border border-[#6A7B8C] rounded p-2.5 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">State *</label>
                        <input type="text" id="reg-state" required placeholder="e.g. MO" class="w-full bg-[#2C353D] border border-[#6A7B8C] rounded p-2.5 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Email Address *</label>
                    <input type="email" id="reg-email" required class="w-full bg-[#2C353D] border border-[#6A7B8C] rounded p-2.5 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Password *</label>
                    <input type="password" id="reg-password" required placeholder="Minimum 6 characters" class="w-full bg-[#2C353D] border border-[#6A7B8C] rounded p-2.5 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                </div>
                <button type="submit" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-3 rounded transition uppercase tracking-wider text-xs cursor-pointer mt-2 shadow">Complete Level 0 Registration</button>
            </form>
            <div id="mod0-status" class="text-xs text-center mt-4 font-mono"></div>
        </div>
    `;

    document.getElementById('mod0-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.getElementById('reg-firstname').value.trim();
        const lastName = document.getElementById('reg-lastname').value.trim();
        const city = document.getElementById('reg-city').value.trim();
        const state = document.getElementById('reg-state').value.trim();
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const statusEl = document.getElementById('mod0-status');

        statusEl.textContent = 'Creating Level 0 secure account...';
        statusEl.className = 'text-xs text-[#D8C3A5] text-center mt-4 font-mono';

        // 1. Sign up user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        
        if (authError) {
            statusEl.textContent = `Error: ${authError.message}`;
            statusEl.className = 'text-xs text-red-300 text-center mt-4 font-mono';
            return;
        }

        const user = authData.user;
        if (!user) {
            statusEl.textContent = 'Error: Registration session could not be established.';
            statusEl.className = 'text-xs text-red-300 text-center mt-4 font-mono';
            return;
        }

        // 2. Create Tenant record with location details
        const { data: tenantData, error: tenantError } = await supabase
            .from('tenants')
            .insert({ 
                estate_phase: 'phase_1_living',
                legal_name: `${firstName} ${lastName}`
            })
            .select()
            .single();

        if (tenantError) {
            statusEl.textContent = `Tenant error: ${tenantError.message}`;
            statusEl.className = 'text-xs text-red-300 text-center mt-4 font-mono';
            return;
        }

        // 3. Create Profile record linked to Tenant with access_tier = 0
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                tenant_id: tenantData.id,
                email: email,
                full_name: `${firstName} ${lastName}`,
                role: 'customer',
                access_tier: 0,
                disclaimer_accepted: false
            });

        if (profileError) {
            statusEl.textContent = `Profile error: ${profileError.message}`;
            statusEl.className = 'text-xs text-red-300 text-center mt-4 font-mono';
            return;
        }

        statusEl.textContent = 'Level 0 Registration complete! Redirecting to secure login...';
        statusEl.className = 'text-xs text-green-300 text-center mt-4 font-mono';
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    });
}
