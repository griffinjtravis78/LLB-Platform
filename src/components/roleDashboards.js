// File: src/components/roleDashboards.js
import { supabase } from '../app.js';
import { renderAuditLedger } from '../components/auditLedger.js';
import { renderPhaseGateway } from '../components/phaseGateway.js';

export async function renderRoleDashboard(container, userProfile, currentTenant) {
    const role = userProfile?.role || 'customer';

    if (role === 'admin' || role === 'counsel') {
        renderAdminCounselDashboard(container, userProfile, currentTenant);
    } else if (role === 'proxy') {
        renderProxyDashboard(container, userProfile, currentTenant);
    } else {
        renderCustomerDashboard(container, userProfile, currentTenant);
    }
}

function renderCustomerDashboard(container, profile, tenant) {
    container.innerHTML = `
        <div class="space-y-6">
            <div class="bg-[#485664] border border-[#D8C3A5]/40 p-6 rounded-xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <span class="text-[10px] uppercase tracking-widest text-[#D8C3A5] font-mono">Estate Owner Workspace</span>
                    <h2 class="text-xl font-bold text-white mt-1">Welcome, ${profile.first_name || 'Estate Owner'}</h2>
                    <p class="text-xs text-gray-300 mt-1">Manage your living estate records, asset vaults, and legacy directives securely.</p>
                </div>
                <div class="bg-[#2C353D] px-4 py-2.5 rounded border border-[#6A7B8C]/50 text-xs">
                    <span class="text-gray-400 block text-[10px] uppercase font-mono">Service Tier</span>
                    <span class="font-bold text-[#D8C3A5]">Level ${profile.access_tier} Active</span>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-[#2C353D] border border-[#6A7B8C]/40 p-5 rounded-lg shadow-lg">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-[#D8C3A5] mb-2">Estate Phase</h3>
                    <p class="text-sm font-semibold text-white">${tenant?.estate_phase === 'phase_2_bereavement' ? 'Phase 2: Bereavement' : 'Phase 1: Living (Active)'}</p>
                    <p class="text-[11px] text-gray-300 mt-1">All modules fully active for modification.</p>
                </div>
                <div class="bg-[#2C353D] border border-[#6A7B8C]/40 p-5 rounded-lg shadow-lg">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-[#D8C3A5] mb-2">Primary Modules</h3>
                    <p class="text-sm font-semibold text-white">Modules 0 – 18 Ready</p>
                    <p class="text-[11px] text-gray-300 mt-1">Use the sidebar navigation to update records.</p>
                </div>
                <div class="bg-[#2C353D] border border-[#6A7B8C]/40 p-5 rounded-lg shadow-lg">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-[#D8C3A5] mb-2">Security Status</h3>
                    <p class="text-sm font-semibold text-green-300">RLS Enforced & Active</p>
                    <p class="text-[11px] text-gray-300 mt-1">Tenant isolation protocols verified.</p>
                </div>
            </div>
        </div>
    `;
}

function renderProxyDashboard(container, profile, tenant) {
    container.innerHTML = `
        <div class="space-y-6">
            <div class="bg-[#485664] border border-amber-500/40 p-6 rounded-xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <span class="text-[10px] uppercase tracking-widest text-amber-300 font-mono">Primary Proxy / Deputy Portal</span>
                    <h2 class="text-xl font-bold text-white mt-1">Deputy Execution Dashboard</h2>
                    <p class="text-xs text-gray-300 mt-1">Contingency access and transition management for ${tenant?.legal_name || 'Estate'}.</p>
                </div>
                <div class="bg-[#2C353D] px-4 py-2.5 rounded border border-amber-700/50 text-xs">
                    <span class="text-gray-400 block text-[10px] uppercase font-mono">Proxy Status</span>
                    <span class="font-bold text-amber-300">Authorized Deputy</span>
                </div>
            </div>

            <div id="proxy-gateway-slot" class="space-y-6"></div>
        </div>
    `;

    renderPhaseGateway(document.getElementById('proxy-gateway-slot'), () => {
        window.location.reload();
    });
}

function renderAdminCounselDashboard(container, profile, tenant) {
    container.innerHTML = `
        <div class="space-y-6">
            <div class="bg-[#485664] border border-[#D8C3A5]/40 p-6 rounded-xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <span class="text-[10px] uppercase tracking-widest text-[#D8C3A5] font-mono">Legal Counsel & Compliance Portal</span>
                    <h2 class="text-xl font-bold text-white mt-1">Oversight & Evidentiary Ledger</h2>
                    <p class="text-xs text-gray-300 mt-1">Review immutable cryptographic logs, compliance records, and UPL notices.</p>
                </div>
                <div class="bg-[#2C353D] px-4 py-2.5 rounded border border-[#6A7B8C]/50 text-xs">
                    <span class="text-gray-400 block text-[10px] uppercase font-mono">Access Level</span>
                    <span class="font-bold text-[#D8C3A5]">Administrator / Counsel</span>
                </div>
            </div>

            <div id="admin-ledger-slot" class="space-y-6"></div>
        </div>
    `;

    renderAuditLedger(document.getElementById('admin-ledger-slot'));
}
