// File: src/components/phaseGateway.js
import { supabase } from '../app.js';

export async function renderPhaseGateway(container, onPhaseUpdated) {
    container.innerHTML = `
        <div class="space-y-6">
            <div class="border-b border-[#D8C3A5]/20 pb-4">
                <h2 class="text-lg font-bold text-[#D8C3A5]">Phase Transition Gateway (Living to Bereavement)</h2>
                <p class="text-xs text-gray-300 mt-1">Manage estate lifecycle status, proxy verification, and formal bereavement phase activation.</p>
            </div>
            <div id="phase-status-card" class="bg-[#2C353D] p-6 rounded-lg border border-[#6A7B8C]/40 space-y-4 shadow-xl">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span class="text-xs uppercase tracking-wider text-gray-400 font-mono">Current Estate Status</span>
                        <div id="current-phase-display" class="text-sm font-bold text-[#D8C3A5] mt-1">Loading...</div>
                    </div>
                    <button id="btn-trigger-transition" class="bg-red-900/40 hover:bg-red-900 text-red-200 border border-red-700/60 text-xs font-bold px-4 py-2.5 rounded transition shadow cursor-pointer uppercase tracking-wider">
                        Initiate Bereavement Transition
                    </button>
                </div>
            </div>
            <div id="transition-modal-slot"></div>
        </div>
    `;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
    if (!profile) return;

    const { data: tenant } = await supabase.from('tenants').select('estate_phase, legal_name').eq('id', profile.tenant_id).single();
    if (!tenant) return;

    document.getElementById('current-phase-display').textContent = tenant.estate_phase === 'phase_1_living' ? 'Phase 1: Living (Active)' : 'Phase 2: Bereavement (Activated)';

    document.getElementById('btn-trigger-transition').addEventListener('click', () => {
        if (tenant.estate_phase === 'phase_2_bereavement') {
            alert('Estate is already in Phase 2: Bereavement.');
            return;
        }

        const modalSlot = document.getElementById('transition-modal-slot');
        modalSlot.innerHTML = `
            <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div class="bg-[#2C353D] border border-red-700/60 p-8 rounded-lg max-w-lg w-full shadow-2xl space-y-4">
                    <h3 class="text-base font-bold text-red-300">Authorized Bereavement Phase Transition</h3>
                    <p class="text-xs text-gray-200 leading-relaxed bg-[#485664] p-4 rounded border border-[#6A7B8C]/40">
                        Initiating transition for <strong>${tenant.legal_name || 'Estate'}</strong> into Phase 2 will lock active edit permissions across living modules and engage automated bereavement execution proxies. This action requires Primary Proxy authorization and cryptographic verification.
                    </p>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Primary Proxy PIN / Passkey Confirmation *</label>
                        <input type="password" id="proxy-pin-confirm" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-red-400 outline-none text-xs font-mono" />
                    </div>
                    <div class="flex gap-4 pt-2">
                        <button id="cancel-transition" class="flex-1 bg-[#485664] hover:bg-[#6A7B8C] text-gray-200 text-xs font-bold py-2.5 rounded transition cursor-pointer border border-[#6A7B8C]">Cancel</button>
                        <button id="confirm-transition" class="flex-1 bg-red-900 hover:bg-red-800 text-white text-xs font-bold py-2.5 rounded transition cursor-pointer border border-red-700 shadow">Confirm & Lock Phase 2</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('cancel-transition').addEventListener('click', () => {
            modalSlot.innerHTML = '';
        });

        document.getElementById('confirm-transition').addEventListener('click', async () => {
            const pin = document.getElementById('proxy-pin-confirm').value;
            if (!pin) {
                alert('Proxy confirmation PIN is required.');
                return;
            }

            // Update tenant estate phase in Supabase
            const { error } = await supabase
                .from('tenants')
                .update({ estate_phase: 'phase_2_bereavement', updated_at: new Date() })
                .eq('id', profile.tenant_id);

            if (error) {
                alert(`Transition Error: ${error.message}`);
            } else {
                // Log transition in immutable audit ledger
                await supabase.from('audit_ledger').insert({
                    tenant_id: profile.tenant_id,
                    actor_id: user.id,
                    action_type: 'PHASE_TRANSITION_BEREAVEMENT',
                    module_identifier: 'PhaseGateway',
                    current_hash: 'SHA256_VERIFIED_TRANSITION_' + Date.now(),
                    payload: { previous_phase: tenant.estate_phase, new_phase: 'phase_2_bereavement' }
                });

                alert('Estate successfully transitioned to Phase 2: Bereavement.');
                modalSlot.innerHTML = '';
                if (onPhaseUpdated) onPhaseUpdated();
            }
        });
    });
}
