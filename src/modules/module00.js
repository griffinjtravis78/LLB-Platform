// File: src/modules/module00.js
import { supabase } from '../app.js';

export async function renderModule00(container) {
    container.innerHTML = `
        <div class="max-w-xl mx-auto bg-[#161616] border border-[#C5A059]/30 rounded-xl p-8 shadow-2xl my-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 0: Customer Onboarding & Registration</h2>
                <p class="text-xs text-gray-400 mt-1">Configure your account credentials, primary support track, and initial proxy delegate. All fields marked with * are mandatory.</p>
            </div>
            <form id="mod0-form" class="space-y-4 mt-6">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Email Address *</label>
                    <input type="email" id="reg-email" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2.5 text-white focus:border-[#C5A059] outline-none text-xs" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Password *</label>
                    <input type="password" id="reg-password" required placeholder="Minimum 6 characters" class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2.5 text-white focus:border-[#C5A059] outline-none text-xs" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Primary Proxy Full Name *</label>
                        <input type="text" id="proxy_name" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2.5 text-white focus:border-[#C5A059] outline-none text-xs" />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Primary Proxy Phone *</label>
                        <input type="text" id="proxy_phone" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2.5 text-white focus:border-[#C5A059] outline-none text-xs" />
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Primary Proxy Email *</label>
                    <input type="email" id="proxy_email" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2.5 text-white focus:border-[#C5A059] outline-none text-xs" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Support Track Selection *</label>
                    <select id="support_track" class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2.5 text-white focus:border-[#C5A059] outline-none text-xs">
                        <option value="track_a_doula">Track A: End-of-Life Doula Assisted</option>
                        <option value="track_b_independent">Track B: Independent Proxy Managed</option>
                    </select>
                </div>
                <button type="submit" class="w-full bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold py-3 rounded transition uppercase tracking-wider text-xs cursor-pointer mt-2">Complete Registration & Initialize Profile</button>
            </form>
            <div id="mod0-status" class="text-xs text-center mt-4 font-mono"></div>
        </div>
    `;

    document.getElementById('mod0-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const proxy_name = document.getElementById('proxy_name').value;
        const proxy_phone = document.getElementById('proxy_phone').value;
        const proxy_email = document.getElementById('proxy_email').value;
        const support_track = document.getElementById('support_track').value;
        const statusEl = document.getElementById('mod0-status');

        statusEl.textContent = 'Creating secure account...';
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
            statusEl.textContent = 'Error: Registration session could not be established.';
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
            statusEl.textContent = `Tenant error: ${tenantError.message}`;
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
            statusEl.textContent = `Profile error: ${profileError.message}`;
            statusEl.className = 'text-xs text-red-400 text-center mt-4 font-mono';
            return;
        }

        // 4. Save Onboarding / Proxy details
        const { error: modError } = await supabase
            .from('module_00_onboarding')
            .insert({
                tenant_id: tenantData.id,
                proxy_name,
                proxy_phone,
                proxy_email,
                support_track
            });

        if (modError) {
            statusEl.textContent = `Onboarding save error: ${modError.message}`;
            statusEl.className = 'text-xs text-red-400 text-center mt-4 font-mono';
        } else {
            statusEl.textContent = 'Registration successful! Redirecting to Module 1 Vitals...';
            statusEl.className = 'text-xs text-green-400 text-center mt-4 font-mono';
            setTimeout(() => {
                window.location.hash = '#vitals';
            }, 1500);
        }
    });
}
