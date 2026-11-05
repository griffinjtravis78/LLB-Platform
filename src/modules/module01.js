// File: src/modules/Module1_Vitals.js
import { supabase } from '../app.js';

export async function renderModule01(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 1: Biographical Vitals & Contact Ledger</h2>
                <p class="text-xs text-gray-400 mt-1">Capture official legal vitals, social security details, and professional counsel. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod1-form" class="space-y-4 max-w-xl bg-[#161616] p-6 rounded-lg border border-gray-800 shadow-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Legal Full Name *</label>
                    <input type="text" id="legal_name" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none text-xs" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Date of Birth *</label>
                        <input type="date" id="date_of_birth" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none text-xs" />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Social Security Number *</label>
                        <input type="password" id="ssn" placeholder="XXX-XX-0000" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none text-xs font-mono" />
                        <span class="text-[10px] text-gray-500 mt-0.5 block">Masked during Phase 1 (Living); unmasked in Phase 2 for Primary Proxy.</span>
                    </div>
                </div>
                <div class="border-t border-gray-800 pt-4 mt-2">
                    <h3 class="text-xs font-bold uppercase text-[#C5A059] mb-3">Professional Counsel & Physicians</h3>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs text-gray-400 mb-1">Primary Attorney Name</label>
                            <input type="text" id="primary_attorney_name" class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none text-xs" />
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400 mb-1">Primary Attorney Contact (Phone/Email)</label>
                            <input type="text" id="primary_attorney_contact" class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none text-xs" />
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400 mb-1">Primary Physician Name & Contact</label>
                            <input type="text" id="primary_physician" class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none text-xs" />
                        </div>
                    </div>
                </div>
                <button type="submit" class="w-full bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold py-2 rounded transition cursor-pointer text-xs uppercase tracking-wider">Save Vitals & Contacts</button>
            </form>
            <div id="mod1-status" class="text-xs text-gray-400 mt-2 font-mono"></div>
        </div>
    `;

    document.getElementById('mod1-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const legal_name = document.getElementById('legal_name').value;
        const date_of_birth = document.getElementById('date_of_birth').value;
        const ssn = document.getElementById('ssn').value;
        const primary_attorney_name = document.getElementById('primary_attorney_name').value;
        const primary_attorney_contact = document.getElementById('primary_attorney_contact').value;
        const primary_physician = document.getElementById('primary_physician').value;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Error: No authenticated user session found.");
            return;
        }

        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) {
            alert("Error: No tenant profile linked to this user.");
            return;
        }

        const statusEl = document.getElementById('mod1-status');
        statusEl.textContent = 'Saving vitals securely...';
        statusEl.className = 'text-xs text-[#C5A059] mt-2 font-mono';

        const { error } = await supabase.from('module_01_vitals').upsert({
            tenant_id: profile.tenant_id,
            legal_name,
            date_of_birth,
            ssn,
            primary_attorney_name,
            primary_attorney_contact,
            primary_physician
        }, { onConflict: 'tenant_id' });

        if (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'text-xs text-red-400 mt-2 font-mono';
        } else {
            statusEl.textContent = 'Successfully saved biographical vitals and professional contacts.';
            statusEl.className = 'text-xs text-green-400 mt-2 font-mono';
        }
    });
}
