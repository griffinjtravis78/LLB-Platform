// File: src/modules/module12.js
import { supabase } from '../app.js';

export async function renderDashboard(container) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
    if (!profile) return;

    container.innerHTML = `
        <div class="space-y-6">
            <div class="flex justify-between items-center border-b border-[#D8C3A5]/20 pb-4">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Module 12: Photo Archive Vault & C2PA Metadata Tagging</h2>
                    <p class="text-xs text-gray-300 mt-1">Catalog family photo vaults, image provenance, metadata tags, and cryptographic C2PA content authenticity manifests.</p>
                </div>
                <button id="btn-add-photo" class="bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition shadow cursor-pointer">
                    + Add Photo Record (12.1)
                </button>
            </div>

            <div class="bg-[#2C353D] rounded-lg border border-[#6A7B8C]/40 overflow-hidden shadow-xl">
                <div class="px-4 py-3 bg-[#485664] border-b border-[#6A7B8C]/40 text-xs font-bold uppercase tracking-wider text-[#D8C3A5]">
                    Registered Photo Vault Archive
                </div>
                <div id="photos-table-container" class="p-4">
                    <p class="text-xs text-gray-300">Loading records...</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-add-photo').addEventListener('click', () => {
        window.app.activeSubLevel = '12.1';
        window.app.renderNavigation();
        window.app.loadModule('module12', '12.1');
    });

    await loadRecordsTable(profile.tenant_id);
}

async function loadRecordsTable(tenantId) {
    const { data: records, error } = await supabase
        .from('module_12_photos')
        .select('*')
        .eq('tenant_id', tenantId);

    const tableContainer = document.getElementById('photos-table-container');
    if (!tableContainer) return;

    if (error) {
        tableContainer.innerHTML = `<p class="text-xs text-red-300">Error loading records: ${error.message}</p>`;
        return;
    }

    if (!records || records.length === 0) {
        tableContainer.innerHTML = `<p class="text-xs text-gray-300 italic">No photo vault records entered yet. Click "+ Add Photo Record" above.</p>`;
        return;
    }

    tableContainer.innerHTML = `
        <table class="w-full text-left text-xs border-collapse">
            <thead>
                <tr class="border-b border-[#6A7B8C]/50 text-[#D8C3A5]">
                    <th class="p-2.5">Photo Title</th>
                    <th class="p-2.5">Date / Era</th>
                    <th class="p-2.5">C2PA Status</th>
                    <th class="p-2.5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-[#6A7B8C]/30 text-gray-200">
                ${records.map(rec => `
                    <tr class="hover:bg-[#485664]/30 transition">
                        <td class="p-2.5 font-semibold text-white">${rec.photo_title || 'N/A'}</td>
                        <td class="p-2.5">${rec.photo_date || 'Unknown'}</td>
                        <td class="p-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${rec.c2pa_verified ? 'bg-green-900/40 text-green-300 border border-green-700/50' : 'bg-gray-800 text-gray-300 border border-gray-700'}">${rec.c2pa_verified ? 'C2PA Verified' : 'Unverified'}</span></td>
                        <td class="p-2.5 text-right space-x-2">
                            <button data-id="${rec.id}" class="edit-btn text-[#D8C3A5] hover:underline font-bold bg-transparent border-none cursor-pointer">EDIT</button>
                            <button data-id="${rec.id}" class="delete-btn text-red-300 hover:underline font-bold bg-transparent border-none cursor-pointer">DELETE</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    tableContainer.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this photo record?')) {
                const { error: delError } = await supabase.from('module_12_photos').delete().eq('id', id);
                if (delError) {
                    alert(`Error deleting record: ${delError.message}`);
                } else {
                    loadRecordsTable(tenantId);
                }
            }
        });
    });

    tableContainer.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            window.app.activeSubLevel = '12.1';
            window.app.renderNavigation();
            window.app.loadModule('module12', '12.1');
        });
    });
}

export async function renderSubLevel(container, subLevelId) {
    if (subLevelId === '12.1') {
        renderPhotoForm(container);
    } else {
        container.innerHTML = `<div class="text-xs text-gray-300">Sub-level ${subLevelId} under development.</div>`;
    }
}

function renderPhotoForm(container) {
    container.innerHTML = `
        <div class="space-y-6 max-w-xl">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-bold text-[#D8C3A5]">Sub-Level 12.1: Photo Archive Record</h2>
                    <p class="text-xs text-gray-300 mt-1">Record photo metadata, provenance details, and C2PA manifest verification. Mandatory fields marked with *.</p>
                </div>
                <button id="back-to-dash" class="text-xs text-[#D8C3A5] hover:underline bg-transparent border-none cursor-pointer font-semibold">← Back to Dashboard</button>
            </div>
            
            <form id="mod12-form" class="space-y-4 bg-[#2C353D] p-6 rounded-lg border border-[#6A7B8C]/40 shadow-xl">
                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Photo Title / Caption *</label>
                    <input type="text" id="photo_title" placeholder="e.g. Family Reunion at the Farm, 1984" required class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Approximate Date / Era</label>
                        <input type="text" id="photo_date" placeholder="e.g. Circa Summer 1984" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">C2PA Manifest Verification</label>
                        <select id="c2pa_verified" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs">
                            <option value="true">Verified (C2PA Signed)</option>
                            <option value="false">Unverified / Legacy Scan</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Cloud Storage Asset Link / URL</label>
                    <input type="text" id="asset_url" placeholder="Supabase Storage Bucket URL" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs" />
                </div>

                <div>
                    <label class="block text-xs font-semibold uppercase text-[#D8C3A5] mb-1">Provenance & Historical Context Notes</label>
                    <textarea id="provenance_notes" placeholder="Describe who is in the photo, location, and historical backstory..." rows="3" class="w-full bg-[#485664] border border-[#6A7B8C] rounded p-2 text-white focus:border-[#D8C3A5] outline-none text-xs"></textarea>
                </div>

                <button type="submit" class="w-full bg-[#D8C3A5] hover:bg-[#A38E70] text-[#2C353D] font-bold py-2.5 rounded transition cursor-pointer text-xs uppercase tracking-wider shadow">Save Photo Record</button>
            </form>
            <div id="mod12-status" class="text-xs text-gray-300 font-mono"></div>
        </div>
    `;

    document.getElementById('back-to-dash').addEventListener('click', () => {
        window.app.activeSubLevel = null;
        window.app.renderNavigation();
        window.app.loadModule('module12', null);
    });

    document.getElementById('mod12-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const photo_title = document.getElementById('photo_title').value.trim();
        const photo_date = document.getElementById('photo_date').value.trim();
        const c2pa_verified = document.getElementById('c2pa_verified').value === 'true';
        const asset_url = document.getElementById('asset_url').value.trim();
        const provenance_notes = document.getElementById('provenance_notes').value.trim();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        if (!profile) return;

        const statusEl = document.getElementById('mod12-status');
        statusEl.textContent = 'Saving photo archive record...';
        statusEl.className = 'text-xs text-[#D8C3A5] font-mono';

        const { error } = await supabase.from('module_12_photos').insert({
            tenant_id: profile.tenant_id,
            photo_title,
            photo_date,
            c2pa_verified,
            asset_url,
            provenance_notes
        });

        if (error) {
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'text-xs text-red-300 font-mono';
        } else {
            statusEl.textContent = 'Successfully saved photo archive record.';
            statusEl.className = 'text-xs text-green-300 font-mono';
            setTimeout(() => {
                window.app.activeSubLevel = null;
                window.app.renderNavigation();
                window.app.loadModule('module12', null);
            }, 1000);
        }
    });
}
