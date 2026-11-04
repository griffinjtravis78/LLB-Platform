import { supabase } from '../app.js';

export async function renderModule10(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-bold text-[#C5A059]">Module 10: Fiduciary & Power of Attorney Designations</h2>
                <p class="text-xs text-gray-400 mt-1">Catalog durable powers of attorney, healthcare proxies, and fiduciary agents. Mandatory fields are marked with *.</p>
            </div>
            <form id="mod10-form" class="space-y-4 max-w-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Agent / Fiduciary Full Name *</label>
                    <input type="text" id="agent_name" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Appointment Type (Financial POA, Medical POA, Executor, Trustee) *</label>
                    <input type="text" id="appointment_type" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#C5A059] mb-1">Contact Phone / Email *</label>
                    <input type="text" id="agent_contact" required class="w-full bg-[#0E0E0E] border border-gray-700 rounded p-2 text-white focus:border-[#C5A059] outline-none" />
                </div>
                <button type="submit" class="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0E0E0E] font-bold px-6 py-2 rounded transition">Save Fiduciary Record</button>
            </form>
            <div id="mod10-status" class="text-xs text-gray-400 mt-2"></div>
        </div>
    `;

    document.getElementById('mod10-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const agent_name = document.getElementById('agent_name').value;
        const appointment_type = document.getElementById('appointment_type').value;
        const agent_contact = document.getElementById('agent_contact').value;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const { error } = await supabase.from('module_10_fiduciaries').insert({
            tenant_id: profile.tenant_id,
            agent_name,
            appointment_type,
            agent_contact
        });

        const status = document.getElementById('mod10-status');
        if (error) {
            status.textContent = `Error: ${error.message}`;
            status.className = 'text-xs text-red-400 mt-2';
        } else {
            status.textContent = 'Successfully saved fiduciary record.';
            status.className = 'text-xs text-green-400 mt-2';
        }
    });
}
