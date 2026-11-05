// File: src/modules/Module0_Onboarding.js
import { supabase } from '../app.js';

export async function renderModule0(container) {
    container.innerHTML = `
        <div class="max-w-md mx-auto bg-[#161616] border border-[#C5A059]/30 rounded-xl p-8 shadow-2xl my-8">
            <h2 class="text-xl font-bold text-[#C5A059] text-center mb-1">MODULE 0: ONBOARDING & REGISTRATION</h2>
            <p class="text-xs text-gray-400 text-center mb-6">Configure your estate account and support tracks</p>
            
            <form id="onboarding-form" class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Email Address *</label>
                    <input type="email" id="reg-email" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2.5 text-white focus:border-[#C5A059] outline-none text-xs" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Password *</label>
                    <input type="password" id="reg-password" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2.5 text-white focus:border-[#C5A059] outline-none text-xs" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Support Track Selection *</label>
                    <select id="support-track" class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2.5 text-white focus:border-[#C5A059] outline-none text-xs">
                        <option value="track_a">Track A - Comprehensive Primary Estate Management</option>
                        <option value="track_b">Track B - Accelerated Modular Setup</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Primary Proxy Contact Name</label>
                    <input type="text" id="proxy-name" placeholder="Optional initial delegate" class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2.5 text-white focus:border-[#C5A059] outline-none text-xs" />
                </div>
                <button type="submit" class="w-full bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold py-3 rounded transition text-xs uppercase tracking-wider cursor-pointer">Complete Registration & Initialize Profile</button>
            </form>
            <div id="reg-status" class="text-xs text-center mt-4 font-mono"></div>
        </div>
    `;

    document.getElementById('onboarding-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const supportTrack = document.getElementById('support-track').value;
        const proxyName = document.getElementById('proxy-name').value;
        const statusEl = document.getElementById('reg-status');

        statusEl.textContent = 'Initializing secure registration...';
        statusEl.className = 'text-xs text-[#C5A059] text-center mt-4 font-mono';

        // 1. Sign up user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        
        if (authError) {
            statusEl.textContent = `Error: ${authError.message}`;
            statusEl.className = 'text-xs text-red-400 text-center mt-4 font-mono';
            return;
        }

        const user = authData.user;
        if (!user) {
            statusEl.textContent = 'Error: Registration failed to return user session.';
            statusEl.className = 'text-xs text-red-400 text-center mt-4 font-mono';
            return;
        }

        // 2. Create Tenant record manually from frontend
        const { data: tenantData, error: tenantError } = await supabase
            .from('tenants')
            .insert({ estate_phase: 'phase_1_living' })
            .select()
            .single();

        if (tenantError) {
            statusEl.textContent = `Tenant creation error: ${tenantError.message}`;
            statusEl.className = 'text-xs text-red-400 text-center mt-4 font-mono';
            return;
        }

        // 3. Create Profile record linked to Tenant
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                tenant_id: tenantData.id,
                email: email,
                role: 'customer',
                customer_tier_id: 'tier_1_essential'
            });

        if (profileError) {
            statusEl.textContent = `Profile linking error: ${profileError.message}`;
            statusEl.className = 'text-xs text-red-400 text-center mt-4 font-mono';
        } else {
            statusEl.textContent = 'Registration successful! Initializing module dashboard...';
            statusEl.className = 'text-xs text-green-400 text-center mt-4 font-mono';
            setTimeout(() => {
                window.location.hash = '#vitals';
            }, 1500);
        }
    });
}
